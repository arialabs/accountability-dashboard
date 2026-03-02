import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchRepNews, deepResearchRep, getOpenRouterKey } from "./perplexity";

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function makeOpenRouterResponse(content: string, citations: string[] = []) {
  return {
    ok: true,
    json: async () => ({
      choices: [{ message: { content } }],
      citations,
    }),
    text: async () => "",
    status: 200,
  };
}

describe("getOpenRouterKey", () => {
  it("throws when OPENROUTER_API_KEY is not set", () => {
    const original = process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_API_KEY;
    expect(() => getOpenRouterKey()).toThrow("OPENROUTER_API_KEY");
    process.env.OPENROUTER_API_KEY = original;
  });

  it("returns the key when set", () => {
    process.env.OPENROUTER_API_KEY = "test-key-123";
    expect(getOpenRouterKey()).toBe("test-key-123");
  });
});

describe("fetchRepNews", () => {
  beforeEach(() => {
    process.env.OPENROUTER_API_KEY = "test-key";
    mockFetch.mockReset();
  });

  it("calls OpenRouter with perplexity/sonar model", async () => {
    mockFetch.mockResolvedValue(
      makeOpenRouterResponse("Latest news about the senator.\n- Vote on bill X (Jan 2025)")
    );

    await fetchRepNews("Jane Doe", "CA", "senate");

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain("openrouter.ai");
    expect(url).toContain("/chat/completions");

    const body = JSON.parse(opts.body);
    expect(body.model).toBe("perplexity/sonar");
    expect(body.messages[0].content).toContain("Jane Doe");
    expect(body.messages[0].content).toContain("CA");
  });

  it("returns structured result with summary and fetchedAt", async () => {
    mockFetch.mockResolvedValue(
      makeOpenRouterResponse(
        "Summary of senator activities.\n- Recent vote on S.123 (February 5, 2025)\n- Ethics probe announced",
        ["https://example.com/news1"]
      )
    );

    const result = await fetchRepNews("Jane Doe", "CA", "senate");

    expect(result.summary).toBeTruthy();
    expect(result.news).toBeInstanceOf(Array);
    expect(result.citations).toContain("https://example.com/news1");
    expect(result.fetchedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("throws on API error response", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 429,
      text: async () => "Rate limit exceeded",
    });

    await expect(fetchRepNews("Jane Doe")).rejects.toThrow("429");
  });

  it("includes auth header with Bearer token", async () => {
    process.env.OPENROUTER_API_KEY = "sk-test-abc";
    mockFetch.mockResolvedValue(makeOpenRouterResponse("summary"));

    await fetchRepNews("John Smith");

    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.headers.Authorization).toBe("Bearer sk-test-abc");
  });
});

describe("deepResearchRep", () => {
  beforeEach(() => {
    process.env.OPENROUTER_API_KEY = "test-key";
    mockFetch.mockReset();
  });

  it("calls OpenRouter with perplexity/sonar-deep-research model", async () => {
    mockFetch.mockResolvedValue(makeOpenRouterResponse("Deep research result"));

    await deepResearchRep("John Smith", "TX", "house");

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.model).toBe("perplexity/sonar-deep-research");
    expect(body.max_tokens).toBe(2048);
  });

  it("returns summary matching full content for deep research", async () => {
    const content = "Comprehensive research on Representative John Smith (TX).\nKey findings: ...";
    mockFetch.mockResolvedValue(makeOpenRouterResponse(content));

    const result = await deepResearchRep("John Smith", "TX", "house");
    expect(result.summary).toBe(content);
  });
});
