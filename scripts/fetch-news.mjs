#!/usr/bin/env node
/**
 * scripts/fetch-news.mjs
 *
 * Pre-build script: fetches latest Perplexity Sonar news for all (or specified)
 * representatives and writes to src/data/news-cache.json.
 *
 * Used for static builds where /api/research is not available.
 *
 * Usage:
 *   OPENROUTER_API_KEY=sk-... node scripts/fetch-news.mjs
 *   OPENROUTER_API_KEY=sk-... node scripts/fetch-news.mjs --ids A000374,B001271
 *   OPENROUTER_API_KEY=sk-... node scripts/fetch-news.mjs --limit 10   # first 10 reps
 *   OPENROUTER_API_KEY=sk-... node scripts/fetch-news.mjs --deep        # use sonar-deep-research
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CACHE_PATH = join(ROOT, "src/data/news-cache.json");
const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

const args = process.argv.slice(2);
const idsArg = args.includes("--ids") ? args[args.indexOf("--ids") + 1] : null;
const limitArg = args.includes("--limit") ? parseInt(args[args.indexOf("--limit") + 1]) : null;
const deep = args.includes("--deep");
const model = deep ? "perplexity/sonar-deep-research" : "perplexity/sonar";

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  console.error("Error: OPENROUTER_API_KEY environment variable is required.");
  process.exit(1);
}

// Load members
const membersPath = join(ROOT, "src/data");
const memberFiles = ["members.json", "congress-members.json"].filter((f) =>
  existsSync(join(membersPath, f))
);
if (!memberFiles.length) {
  console.error("Could not find members data file in src/data/");
  process.exit(1);
}
let members = JSON.parse(readFileSync(join(membersPath, memberFiles[0]), "utf8"));
if (!Array.isArray(members)) {
  // Some formats wrap in an object
  members = members.members ?? members.results ?? Object.values(members);
}

// Filter
if (idsArg) {
  const ids = idsArg.split(",").map((s) => s.trim());
  members = members.filter((m) => ids.includes(m.bioguide_id));
}
if (limitArg) {
  members = members.slice(0, limitArg);
}

console.log(`Fetching news for ${members.length} reps using model: ${model}`);

// Load existing cache
const cache = existsSync(CACHE_PATH)
  ? JSON.parse(readFileSync(CACHE_PATH, "utf8"))
  : {};

let success = 0;
let failed = 0;

for (const member of members) {
  const id = member.bioguide_id;
  const name = member.full_name ?? member.name;
  const state = member.state;
  const chamber = member.chamber ?? member.type;

  const chamberTitle = chamber === "house" ? "Representative" : "Senator";
  const contextLine = state ? ` (${state})` : "";
  const prompt = deep
    ? `Conduct thorough research on US ${chamberTitle} ${name}${contextLine}. Cover: recent votes, campaign finance, controversies, policy positions. Be specific with dates and sources.`
    : `What is the latest news about US ${chamberTitle} ${name}${contextLine}? Summarize the top 5 recent stories with dates.`;

  try {
    const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://reps.arialabs.ai",
        "X-Title": "Accountability Dashboard News Fetcher",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: deep ? 2048 : 1024,
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? "";
    const citations = data.citations ?? [];

    cache[id] = {
      name,
      summary: content,
      citations,
      model,
      fetchedAt: new Date().toISOString(),
    };

    success++;
    process.stdout.write(`✓ ${name}\n`);
  } catch (err) {
    failed++;
    console.error(`✗ ${name}: ${err.message}`);
  }

  // Rate limit: ~1 req/sec
  await new Promise((r) => setTimeout(r, 1100));
}

writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
console.log(`\nDone. ${success} succeeded, ${failed} failed.`);
console.log(`Cache written to: ${CACHE_PATH}`);
