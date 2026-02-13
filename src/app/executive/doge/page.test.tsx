import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("DogeLegacyRedirect", () => {
  it("redirects to new agencies path", async () => {
    const { redirect } = await import("next/navigation");
    const { default: Page } = await import("./page");
    try { Page(); } catch {}
    expect(redirect).toHaveBeenCalledWith("/executive/agencies/doge");
  });
});
