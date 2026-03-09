/**
 * Cloudflare Pages Function — /api/og?id=[bioguide_id]
 *
 * Generates a 1200×630 PNG social share image for a Congress member.
 * Uses satori (JSX → SVG) + @resvg/resvg-js (SVG → PNG).
 */

import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

// Static JSON data is bundled at build time by the Pages Functions bundler
import membersData from "../../src/data/members.json";
import financeData from "../../src/data/finance.json";

// ── data helpers ──────────────────────────────────────────────────────────────

function lookup(bioguideId) {
  const member = membersData.find((m) => m.bioguide_id === bioguideId);
  if (!member) return null;

  const finance = financeData[bioguideId];
  const pacPct = finance?.pac_percentage ?? null;
  const totalRaised = finance?.total_raised ?? null;

  const partyFull =
    member.party === "D"
      ? "Democrat"
      : member.party === "R"
        ? "Republican"
        : "Independent";

  let verdictLabel = "NO DATA";
  if (pacPct !== null) {
    if (pacPct >= 60) verdictLabel = "DONOR CAPTURED";
    else if (pacPct >= 30) verdictLabel = "MIXED ALLEGIANCE";
    else verdictLabel = "CONSTITUENT FOCUSED";
  }

  return { member, partyFull, pacPct, totalRaised, verdictLabel };
}

function fmtDollars(n) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

// ── satori markup ─────────────────────────────────────────────────────────────

function buildMarkup(data) {
  const { member, partyFull, pacPct, totalRaised, verdictLabel } = data;
  const chamber =
    member.chamber === "house" ? "Representative" : "Senator";
  const district = member.district
    ? `${member.state}-${member.district}`
    : member.state;

  const verdictColor =
    verdictLabel === "DONOR CAPTURED"
      ? "#DC2626"
      : verdictLabel === "MIXED ALLEGIANCE"
        ? "#D97706"
        : verdictLabel === "CONSTITUENT FOCUSED"
          ? "#16A34A"
          : "#71717A";

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
        // Top bar: site name
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
            children: member.full_name,
          },
        },
        // Subtitle
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
              { type: "span", props: { children: `${partyFull} ${chamber}` } },
              { type: "span", props: { children: "·" } },
              { type: "span", props: { children: district } },
            ],
          },
        },
        // Stats row
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              gap: "60px",
              marginBottom: "40px",
            },
            children: [
              pacPct !== null && statBlock(`${pacPct.toFixed(0)}%`, "PAC Funded"),
              totalRaised !== null &&
                statBlock(fmtDollars(totalRaised), "Total Raised"),
            ].filter(Boolean),
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
                  children: verdictLabel,
                },
              },
            ],
          },
        },
      ],
    },
  };
}

function statBlock(value, label) {
  return {
    type: "div",
    props: {
      style: { display: "flex", flexDirection: "column" },
      children: [
        {
          type: "div",
          props: {
            style: { fontSize: "48px", fontWeight: 800, color: "#FFFFFF" },
            children: value,
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
            children: label,
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
    // Redirect to static placeholder
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
