/**
 * Perplexity search via OpenRouter
 *
 * Used for live news lookups (sonar) and deep research (sonar-deep-research).
 * Requires OPENROUTER_API_KEY environment variable.
 */

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

export interface NewsItem {
  title: string;
  snippet: string;
  url?: string;
  publishedAt?: string;
}

export interface ResearchResult {
  summary: string;
  news: NewsItem[];
  citations: string[];
  fetchedAt: string;
}

export function getOpenRouterKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new Error(
      "OPENROUTER_API_KEY environment variable is required. See README for setup instructions."
    );
  }
  return key;
}

/**
 * Query Perplexity Sonar for latest news about a representative.
 * Uses `perplexity/sonar` model — live web search optimized for recent news.
 */
export async function fetchRepNews(
  repName: string,
  state?: string,
  chamber?: string
): Promise<ResearchResult> {
  const apiKey = getOpenRouterKey();

  const contextLine =
    state || chamber
      ? ` (${chamber === "house" ? "Representative" : "Senator"} from ${state})`
      : "";

  const prompt = `Find the latest news and recent developments about US ${chamber === "house" ? "Representative" : "Senator"} ${repName}${contextLine}. Focus on:
- Recent votes and legislative activity (last 30 days)
- Controversies or investigations
- Public statements or policy positions
- Campaign finance news

Return a brief summary followed by a bullet list of the top news items with dates.`;

  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://reps.arialabs.ai",
      "X-Title": "Accountability Dashboard",
    },
    body: JSON.stringify({
      model: "perplexity/sonar",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const content: string = data.choices?.[0]?.message?.content ?? "";
  const citations: string[] = data.citations ?? [];

  // Parse the markdown response into structured news items
  const news = parseNewsItems(content, citations);

  return {
    summary: extractSummary(content),
    news,
    citations,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Deep research on a representative using Perplexity Sonar Deep Research.
 * More thorough but slower — suitable for batch/cron jobs.
 */
export async function deepResearchRep(
  repName: string,
  state?: string,
  chamber?: string
): Promise<ResearchResult> {
  const apiKey = getOpenRouterKey();

  const contextLine = state ? ` (${state})` : "";
  const chamberTitle =
    chamber === "house" ? "Representative" : "Senator";

  const prompt = `Conduct thorough research on US ${chamberTitle} ${repName}${contextLine}. Include:
- Recent legislative activity and key votes
- Campaign finance and donor relationships
- Any controversies, ethics investigations, or scandals
- Policy positions and public statements
- Committee assignments and influence

Provide a comprehensive summary with specific facts, dates, and citations.`;

  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://reps.arialabs.ai",
      "X-Title": "Accountability Dashboard",
    },
    body: JSON.stringify({
      model: "perplexity/sonar-deep-research",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const content: string = data.choices?.[0]?.message?.content ?? "";
  const citations: string[] = data.citations ?? [];

  return {
    summary: content,
    news: parseNewsItems(content, citations),
    citations,
    fetchedAt: new Date().toISOString(),
  };
}

function extractSummary(content: string): string {
  // First paragraph before any bullet lists
  const lines = content.split("\n");
  const summaryLines: string[] = [];
  for (const line of lines) {
    if (line.startsWith("-") || line.startsWith("*") || line.startsWith("•")) break;
    if (line.trim()) summaryLines.push(line.trim());
    if (summaryLines.length >= 3) break;
  }
  return summaryLines.join(" ") || content.slice(0, 300);
}

function parseNewsItems(content: string, citations: string[]): NewsItem[] {
  const items: NewsItem[] = [];
  const bulletRegex = /^[-*•]\s+(.+)/gm;
  let match;
  let idx = 0;

  while ((match = bulletRegex.exec(content)) !== null) {
    const text = match[1].trim();
    // Try to extract a date like "Jan 2025" or "2025-01-15"
    const dateMatch = text.match(
      /(\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+\d{4}|\d{4}-\d{2}-\d{2})/i
    );
    items.push({
      title: text.replace(dateMatch?.[0] ?? "", "").replace(/[:\-–—]\s*$/, "").trim(),
      snippet: text,
      url: citations[idx] ?? undefined,
      publishedAt: dateMatch?.[0],
    });
    idx++;
  }

  return items;
}
