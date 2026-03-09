/**
 * Cloudflare Pages Function — /api/og/cabinet?id=[member_id]
 *
 * Generates a 1200×630 PNG social share image for a cabinet member.
 * Uses satori (JSX → SVG) + @resvg/resvg-js (SVG → PNG).
 */

import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

import cabinetData from "../../../src/data/cabinet.json";

// ── data helpers ──────────────────────────────────────────────────────────────

const SEVERITY_WEIGHTS = { low: 1, medium: 3, high: 7, critical: 10 };

function lookup(memberId) {
  const member = cabinetData.members.find((m) => m.id === memberId);
  if (!member) return null;

  const score = member.conflicts_of_interest.reduce(
    (t, c) => t + (SEVERITY_WEIGHTS[c.severity] ?? 0),
    0,
  );

  let conflictLabel;
  if (score === 0) conflictLabel = "None";
  else if (score < 5) conflictLabel = "Low";
  else if (score < 15) conflictLabel = "Medium";
  else if (score < 25) conflictLabel = "High";
  else conflictLabel = "Critical";

  const verdictType =
    score >= 15 ? "HIGH RISK" : score >= 5 ? "MODERATE" : "LOW RISK";

  return { member, conflictScore: score, conflictLabel, verdictType };
}

// ── satori markup ─────────────────────────────────────────────────────────────

function buildMarkup(data) {
  const { member, conflictLabel, verdictType } = data;

  const verdictColor =
    verdictType === "HIGH RISK"
      ? "#DC2626"
      : verdictType === "MODERATE"
        ? "#D97706"
        : "#16A34A";

  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        width: "1200px",
        height: "630px",
        backgroundColor: "#1C1917",
        color: "#FFFFFF",
        fontFamily: "sans-serif",
        padding: "60px",
      },
      children: [
        // Top bar
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "40px",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "22px",
                    color: "#9A3412",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                  },
                  children: "ACCOUNTABILITY DASHBOARD",
                },
              },
              {
                type: "div",
                props: {
                  style: { fontSize: "18px", color: "#A8A29E" },
                  children: "reps.arialabs.ai",
                },
              },
            ],
          },
        },
        // Name
        {
          type: "div",
          props: {
            style: {
              fontSize: "56px",
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: "12px",
            },
            children: member.name,
          },
        },
        // Role & department
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              fontSize: "26px",
              color: "#A8A29E",
              marginBottom: "40px",
              gap: "12px",
            },
            children: [
              { type: "span", props: { children: member.role } },
              { type: "span", props: { children: "·" } },
              { type: "span", props: { children: member.department } },
            ],
          },
        },
        // Conflict score
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              marginBottom: "40px",
            },
            children: [
              {
                type: "div",
                props: {
                  style: { fontSize: "48px", fontWeight: 800 },
                  children: conflictLabel,
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "18px",
                    color: "#9A3412",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  },
                  children: "CONFLICT SCORE",
                },
              },
            ],
          },
        },
        // Verdict
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginTop: "auto",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    width: "14px",
                    height: "14px",
                    borderRadius: "7px",
                    backgroundColor: verdictColor,
                  },
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "28px",
                    fontWeight: 700,
                    color: verdictColor,
                    letterSpacing: "0.08em",
                  },
                  children: verdictType,
                },
              },
            ],
          },
        },
      ],
    },
  };
}

// ── handler ───────────────────────────────────────────────────────────────────

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return new Response("Missing id parameter", { status: 400 });
  }

  const data = lookup(id);

  if (!data) {
    return Response.redirect(new URL("/og-image.png", url.origin).toString(), 302);
  }

  try {
    const svg = await satori(buildMarkup(data), {
      width: 1200,
      height: 630,
      fonts: [],
    });

    const resvg = new Resvg(svg, {
      fitTo: { mode: "width", value: 1200 },
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    return new Response(pngBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, s-maxage=604800",
      },
    });
  } catch {
    return Response.redirect(new URL("/og-image.png", url.origin).toString(), 302);
  }
}
