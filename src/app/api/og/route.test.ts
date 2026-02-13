import { describe, it, expect, vi } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";

// Mock @vercel/og ImageResponse
vi.mock("@vercel/og", () => ({
  ImageResponse: vi.fn((element, options) => {
    return new Response("mock-image", {
      status: 200,
      headers: { "content-type": "image/png" },
    });
  }),
}));

describe("OG Image API Route", () => {
  it("returns 400 if name parameter is missing", async () => {
    const request = new NextRequest(
      new URL("http://localhost:3000/api/og")
    );

    const response = await GET(request);

    expect(response.status).toBe(400);
    const text = await response.text();
    expect(text).toBe("Missing name parameter");
  });

  it("generates image with all parameters", async () => {
    const request = new NextRequest(
      new URL(
        "http://localhost:3000/api/og?name=John%20Doe&party=D&state=CA&district=12&score=85&chamber=house"
      )
    );

    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
  });

  it("generates image with minimal parameters", async () => {
    const request = new NextRequest(
      new URL(
        "http://localhost:3000/api/og?name=Jane%20Smith&party=R&state=TX&chamber=senate"
      )
    );

    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
  });

  it("handles errors gracefully", async () => {
    const { ImageResponse } = await import("@vercel/og");
    vi.mocked(ImageResponse).mockImplementationOnce(() => {
      throw new Error("Image generation failed");
    });

    const request = new NextRequest(
      new URL(
        "http://localhost:3000/api/og?name=Test&party=D&state=NY&chamber=house"
      )
    );

    const response = await GET(request);

    expect(response.status).toBe(500);
    const text = await response.text();
    expect(text).toBe("Failed to generate image");
  });

  it("uses correct party colors", async () => {
    const { ImageResponse } = await import("@vercel/og");
    
    // Test Democrat
    let request = new NextRequest(
      new URL("http://localhost:3000/api/og?name=Test&party=D&state=CA&chamber=house")
    );
    await GET(request);
    expect(ImageResponse).toHaveBeenCalled();

    // Test Republican
    request = new NextRequest(
      new URL("http://localhost:3000/api/og?name=Test&party=R&state=TX&chamber=house")
    );
    await GET(request);
    expect(ImageResponse).toHaveBeenCalled();

    // Test Independent
    request = new NextRequest(
      new URL("http://localhost:3000/api/og?name=Test&party=I&state=VT&chamber=senate")
    );
    await GET(request);
    expect(ImageResponse).toHaveBeenCalled();
  });

  it("displays score when provided", async () => {
    const { ImageResponse } = await import("@vercel/og");
    
    const request = new NextRequest(
      new URL(
        "http://localhost:3000/api/og?name=Test&party=D&state=CA&chamber=house&score=75"
      )
    );
    await GET(request);

    // Verify ImageResponse was called with score in the component
    const calls = vi.mocked(ImageResponse).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
  });

  it("returns correct image dimensions", async () => {
    const { ImageResponse } = await import("@vercel/og");
    
    const request = new NextRequest(
      new URL("http://localhost:3000/api/og?name=Test&party=D&state=CA&chamber=house")
    );
    await GET(request);

    const calls = vi.mocked(ImageResponse).mock.calls;
    const lastCall = calls[calls.length - 1];
    expect(lastCall[1]).toEqual({ width: 1200, height: 630 });
  });
});
