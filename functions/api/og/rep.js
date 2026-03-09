/**
 * Cloudflare Pages Function — /api/og/rep?id=[bioguide_id]
 *
 * Generates a 1200x630 PNG social share image for a congress member.
 * Uses satori (JSX -> SVG) + @resvg/resvg-js (SVG -> PNG).
 */

import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

import membersData from "../../../src/data/members.json";
import financeData from "../../../src/data/finance.json";

// ── data helpers ──────────────────────────────────────────────────────────────

function partyFull(code) {
  if (code === "D") return "Democrat";
  if (code === "R") return "Republican";
  return "Independent";
}

function verdictLabel(pacPct) {
  if (pacPct === null || pacPct === undefined) return "NO DATA";
  if (pacPct >= 60) return "DONOR CAPTURED";
  if (pacPct >= 30) return "MIXED ALLEGIANCE";
  return "CONSTITUENT FOCUSED";
}

function lookup(bioguideId) {
  const member = membersData.find((m) => m.bioguide_id === bioguideId);
  if (!member) return null;

  const finance = financeData[bioguideId];
  const pacPct = finance?.pac_percentage ?? null;

  return {
    member,
    pacPct,
    totalRaised: finance?.total_raised ?? null,
    partyFull: partyFull(member.party),
    verdictLabel: verdictLabel(pacPct),
  };
}

// ── satori markup ─────────────────────────────────────────────────────────────

function buildMarkup(data) {
  const { member, pacPct, verdictLabel: verdict, partyFull: party } = data;

  const verdictColor =
    verdict === "DONOR CAPTURED"
      ? "#DC2626"
      : verdict === "MIXED ALLEGIANCE"
        ? "#D97706"
        : verdict === "NO DATA"
          ? "#6B7280"
          : "#16A34A";

  const partyColor =
    member.party === "D"
      ? "#3B82F6"
      : member.party === "R"
        ? "#EF4444"
        : "#8B5CF6";

  const chamberLabel =
    member.chamber === "house" ? "Representative" : "Senator";
  const location = member.district
    ? `${member.state}-${member.district}`
    : member.state;

  const statLine = pacPct !== null ? `${Math.round(pacPct)}%` : "—";

  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        width: "1200px",
        height: "630px",
        backgroundColor: "#0F172A",
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
                    color: "#38BDF8",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                  },
                  children: "ACCOUNTABILITY DASHBOARD",
                },
              },
              {
                type: "div",
                props: {
                  style: { fontSize: "18px", color: "#94A3B8" },
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
            children: member.full_name,
          },
        },
        // Party, state, chamber
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              fontSize: "26px",
              color: "#94A3B8",
              marginBottom: "40px",
              gap: "12px",
            },
            children: [
              {
                type: "span",
                props: {
                  style: { color: partyColor, fontWeight: 700 },
                  children: party,
                },
              },
              { type: "span", props: { children: "·" } },
              { type: "span", props: { children: `${chamberLabel}, ${location}` } },
            ],
          },
        },
        // Big stat — PAC percentage
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
                  style: { fontSize: "72px", fontWeight: 800 },
                  children: statLine,
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "18px",
                    color: "#38BDF8",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  },
                  children: "PAC MONEY",
                },
              },
            ],
          },
        },
        // Verdict badge
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
                  children: verdict,
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
    return Response.redirect(
      new URL("/og-image.png", url.origin).toString(),
      302,
    );
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
    return Response.redirect(
      new URL("/og-image.png", url.origin).toString(),
      302,
    );
  }
}
