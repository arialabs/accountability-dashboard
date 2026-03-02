/**
 * GET /api/research?id=<bioguide_id>
 *
 * Returns latest Perplexity Sonar news for a representative.
 *
 * NOTE: This route requires server-side rendering.
 * For static export (Cloudflare Pages), use the pre-build script instead:
 *   pnpm run research:fetch
 *
 * To enable API routes, remove `output: "export"` from next.config.mjs and
 * deploy with a Node.js runtime (e.g., Cloudflare Workers via @cloudflare/next-on-pages).
 */

import { NextRequest, NextResponse } from "next/server";
import { getMember } from "@/lib/data";
import { fetchRepNews } from "@/lib/perplexity";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing ?id parameter" }, { status: 400 });
  }

  const member = getMember(id);
  if (!member) {
    return NextResponse.json({ error: `Member not found: ${id}` }, { status: 404 });
  }

  try {
    const result = await fetchRepNews(
      member.full_name,
      member.state,
      member.chamber
    );
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[research] Perplexity fetch failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
