#!/usr/bin/env tsx
/**
 * Fetch CRS bill summaries from Congress.gov + AI beneficiary analysis
 *
 * Phase 1: GET /v3/bill/{congress}/{type}/{number}/summaries
 * Phase 2: Claude AI analysis of "who benefits / who is harmed"
 *
 * Usage: CONGRESS_API_KEY=xxx ANTHROPIC_API_KEY=xxx tsx scripts/fetch-bill-summaries.ts
 * Output: src/data/bill-summaries.json
 */
import * as fs from "fs";
import * as path from "path";

const CONGRESS_API_KEY = process.env.CONGRESS_API_KEY;
if (!CONGRESS_API_KEY) {
  console.error("CONGRESS_API_KEY is required");
  process.exit(1);
}

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const KEY_VOTES_PATH = path.join(__dirname, "../src/data/key-votes.json");
const OUTPUT_PATH = path.join(__dirname, "../src/data/bill-summaries.json");

// Bill prefix -> Congress.gov API path segment
const BILL_TYPE_MAP: Record<string, string> = {
  HCONRES: "hconres",
  SCONRES: "sconres",
  HJRES: "hjres",
  SJRES: "sjres",
  HRES: "hres",
  SRES: "sres",
  HR: "hr",
  S: "s",
};
const PREFIXES_SORTED = Object.keys(BILL_TYPE_MAP).sort(
  (a, b) => b.length - a.length
);

interface BillSummaryRecord {
  bill: string;
  congress: number;
  title: string;
  crs_summary: string | null;
  summary_date: string | null;
  url: string;
  benefits: string[] | null;
  harms: string[] | null;
  ai_analyzed: boolean;
}

function parseBillId(
  billId: string
): { prefix: string; apiType: string; number: string } | null {
  for (const prefix of PREFIXES_SORTED) {
    if (billId.startsWith(prefix)) {
      const number = billId.slice(prefix.length);
      if (!number || isNaN(Number(number))) return null;
      return { prefix, apiType: BILL_TYPE_MAP[prefix], number };
    }
  }
  return null;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildCongressGovUrl(billId: string, congress: number): string {
  const URL_MAP: Record<string, string> = {
    HR: "house-bill",
    S: "senate-bill",
    HJRES: "house-joint-resolution",
    SJRES: "senate-joint-resolution",
    HCONRES: "house-concurrent-resolution",
    SCONRES: "senate-concurrent-resolution",
    HRES: "house-resolution",
    SRES: "senate-resolution",
  };
  for (const prefix of PREFIXES_SORTED) {
    if (billId.startsWith(prefix)) {
      const number = billId.slice(prefix.length);
      const slug = URL_MAP[prefix];
      if (slug)
        return `https://www.congress.gov/bill/${congress}th-congress/${slug}/${number}`;
    }
  }
  return `https://www.congress.gov/search?q=${billId}`;
}

async function fetchWithRetry(
  url: string,
  retries = 3
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url);
    if (res.ok) return res;
    if (res.status === 429) {
      const wait = Math.pow(2, i) * 3000;
      console.log(`  Rate limited, waiting ${wait / 1000}s...`);
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }
    if (res.status >= 500) {
      await new Promise((r) => setTimeout(r, 2000));
      continue;
    }
    return res; // 404 etc -- don't retry
  }
  return fetch(url); // final attempt
}

// --- Phase 1: Fetch CRS summaries ---

async function fetchCrsSummaries() {
  const keyVotes: Array<{
    bill: string;
    congress: number;
    title: string;
  }> = JSON.parse(fs.readFileSync(KEY_VOTES_PATH, "utf-8"));

  // Get unique bills with their congress number
  const billMap = new Map<string, { congress: number; title: string }>();
  for (const vote of keyVotes) {
    if (!billMap.has(vote.bill) && !vote.bill.startsWith("PN")) {
      billMap.set(vote.bill, { congress: vote.congress, title: vote.title });
    }
  }

  console.log(`Found ${billMap.size} unique bills (excluding nominations)\n`);

  // Load existing data for resume
  let summaries: Record<string, BillSummaryRecord> = {};
  if (fs.existsSync(OUTPUT_PATH)) {
    try {
      summaries = JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf-8"));
      console.log(
        `Loaded ${Object.keys(summaries).length} existing records\n`
      );
    } catch {
      /* start fresh */
    }
  }

  const bills = Array.from(billMap.entries());
  // Skip bills we already fetched (including those confirmed to have no summary)
  const toFetch = bills.filter(
    ([id]) => !(id in summaries)
  );

  console.log(`Need to fetch: ${toFetch.length} bills\n`);

  let fetched = 0;
  for (let i = 0; i < toFetch.length; i += 5) {
    const batch = toFetch.slice(i, i + 5);

    for (const [billId, { congress, title }] of batch) {
      const parsed = parseBillId(billId);
      if (!parsed) {
        console.log(`  [warn] Could not parse: ${billId}`);
        summaries[billId] = {
          bill: billId,
          congress,
          title,
          crs_summary: null,
          summary_date: null,
          url: buildCongressGovUrl(billId, congress),
          benefits: null,
          harms: null,
          ai_analyzed: false,
        };
        continue;
      }

      const url = `https://api.congress.gov/v3/bill/${congress}/${parsed.apiType}/${parsed.number}/summaries?api_key=${CONGRESS_API_KEY}&format=json`;
      try {
        const res = await fetchWithRetry(url);
        if (!res.ok) {
          console.log(`  [fail] ${billId}: HTTP ${res.status}`);
          summaries[billId] = {
            bill: billId,
            congress,
            title,
            crs_summary: null,
            summary_date: null,
            url: buildCongressGovUrl(billId, congress),
            benefits: null,
            harms: null,
            ai_analyzed: false,
          };
          fetched++;
          continue;
        }

        const data = await res.json();
        const entries = data.summaries || [];

        // Take the most recent version (sort by updateDate descending)
        const sorted = entries.sort(
          (a: { updateDate: string }, b: { updateDate: string }) =>
            (b.updateDate || "").localeCompare(a.updateDate || "")
        );

        const best = sorted[0];
        const crsSummary = best?.text ? stripHtml(best.text) : null;
        const summaryDate =
          best?.updateDate || best?.actionDate || null;

        // Also try to get the official bill title from the API
        let officialTitle = title;
        try {
          const billRes = await fetchWithRetry(
            `https://api.congress.gov/v3/bill/${congress}/${parsed.apiType}/${parsed.number}?api_key=${CONGRESS_API_KEY}&format=json`
          );
          if (billRes.ok) {
            const billData = await billRes.json();
            officialTitle = billData.bill?.title || title;
          }
        } catch {
          /* keep vote title */
        }

        summaries[billId] = {
          bill: billId,
          congress,
          title: officialTitle,
          crs_summary: crsSummary,
          summary_date: summaryDate,
          url: buildCongressGovUrl(billId, congress),
          benefits: null,
          harms: null,
          ai_analyzed: false,
        };

        console.log(
          `  ${crsSummary ? "[ok]" : "[--]"} ${billId}: ${crsSummary ? crsSummary.slice(0, 80) + "..." : "no CRS summary"}`
        );
        fetched++;
      } catch (err) {
        console.log(`  [fail] ${billId}: ${err}`);
      }
    }

    // Checkpoint every 25 bills
    if (fetched > 0 && fetched % 25 === 0) {
      fs.writeFileSync(
        OUTPUT_PATH,
        JSON.stringify(summaries, null, 2) + "\n"
      );
      console.log(
        `  [save] Checkpoint: ${Object.keys(summaries).length} records saved\n`
      );
    }

    // Rate limit: 2s between batches
    if (i + 5 < toFetch.length) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  // Final save
  fs.writeFileSync(
    OUTPUT_PATH,
    JSON.stringify(summaries, null, 2) + "\n"
  );
  const withSummary = Object.values(summaries).filter(
    (s) => s.crs_summary
  ).length;
  console.log(
    `\nPhase 1 complete: ${withSummary}/${Object.keys(summaries).length} bills have CRS summaries\n`
  );

  return summaries;
}

// --- Phase 2: AI beneficiary analysis ---

async function analyzeBeneficiaries(
  summaries: Record<string, BillSummaryRecord>
) {
  if (!ANTHROPIC_API_KEY) {
    console.log(
      "ANTHROPIC_API_KEY not set -- skipping Phase 2 (AI analysis)\n"
    );
    return;
  }

  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  const toAnalyze = Object.values(summaries).filter(
    (s) => s.crs_summary && !s.ai_analyzed
  );

  console.log(`Phase 2: Analyzing ${toAnalyze.length} bills with AI\n`);

  // Try preferred model first, fall back if it fails
  let model = "claude-sonnet-4-5-20250514";
  let modelVerified = false;

  let analyzed = 0;
  for (const bill of toAnalyze) {
    try {
      const response = await anthropic.messages.create({
        model,
        max_tokens: 200,
        temperature: 0,
        messages: [
          {
            role: "user",
            content: `Given this Congressional Research Service summary of a bill, identify:
1. Who benefits if this bill passes (industries, groups, or entities)
2. Who is harmed or disadvantaged if this bill passes

Be specific and concise. Return JSON only:
{"benefits": ["phrase1", "phrase2"], "harms": ["phrase1", "phrase2"]}

If the summary is too vague to determine beneficiaries, return:
{"benefits": null, "harms": null}

CRS Summary:
${bill.crs_summary}`,
          },
        ],
      });

      if (!modelVerified) {
        console.log(`  Using model: ${model}\n`);
        modelVerified = true;
      }

      const text =
        response.content[0].type === "text"
          ? response.content[0].text
          : "";
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.log(`  [warn] ${bill.bill}: no JSON in response`);
        continue;
      }
      const parsed = JSON.parse(jsonMatch[0]);

      bill.benefits = parsed.benefits || null;
      bill.harms = parsed.harms || null;
      bill.ai_analyzed = true;

      console.log(
        `  [ok] ${bill.bill}: benefits=${JSON.stringify(bill.benefits)?.slice(0, 60)}`
      );
      analyzed++;

      // Checkpoint every 25
      if (analyzed % 25 === 0) {
        fs.writeFileSync(
          OUTPUT_PATH,
          JSON.stringify(summaries, null, 2) + "\n"
        );
        console.log(`  [save] Checkpoint: ${analyzed} analyzed\n`);
      }

      // Rate limit
      await new Promise((r) => setTimeout(r, 1000));
    } catch (err: unknown) {
      // If preferred model fails on first call, try fallback
      if (!modelVerified && model === "claude-sonnet-4-5-20250514") {
        console.log(
          `  Model ${model} failed, trying fallback...`
        );
        model = "claude-3-5-sonnet-20241022";
        // Retry this bill with fallback model
        try {
          const response = await anthropic.messages.create({
            model,
            max_tokens: 200,
            temperature: 0,
            messages: [
              {
                role: "user",
                content: `Given this Congressional Research Service summary of a bill, identify:
1. Who benefits if this bill passes (industries, groups, or entities)
2. Who is harmed or disadvantaged if this bill passes

Be specific and concise. Return JSON only:
{"benefits": ["phrase1", "phrase2"], "harms": ["phrase1", "phrase2"]}

If the summary is too vague to determine beneficiaries, return:
{"benefits": null, "harms": null}

CRS Summary:
${bill.crs_summary}`,
              },
            ],
          });

          console.log(`  Using fallback model: ${model}\n`);
          modelVerified = true;

          const text =
            response.content[0].type === "text"
              ? response.content[0].text
              : "";
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            bill.benefits = parsed.benefits || null;
            bill.harms = parsed.harms || null;
            bill.ai_analyzed = true;
            analyzed++;
            console.log(
              `  [ok] ${bill.bill}: benefits=${JSON.stringify(bill.benefits)?.slice(0, 60)}`
            );
          }

          await new Promise((r) => setTimeout(r, 1000));
        } catch (fallbackErr) {
          console.log(
            `  [fail] ${bill.bill}: both models failed: ${fallbackErr}`
          );
        }
      } else {
        console.log(`  [fail] ${bill.bill}: ${err}`);
        // Don't mark as analyzed -- will retry next run
      }
    }
  }

  fs.writeFileSync(
    OUTPUT_PATH,
    JSON.stringify(summaries, null, 2) + "\n"
  );
  console.log(`\nPhase 2 complete: ${analyzed} bills analyzed\n`);
}

// --- Main ---

async function main() {
  console.log("=== Bill Summary Pipeline ===\n");
  const summaries = await fetchCrsSummaries();
  await analyzeBeneficiaries(summaries);
  console.log("Done!");
}

main().catch(console.error);
