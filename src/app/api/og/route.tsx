import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");
    const party = searchParams.get("party");
    const state = searchParams.get("state");
    const district = searchParams.get("district");
    const score = searchParams.get("score");
    const chamber = searchParams.get("chamber");

    if (!name) {
      return new Response("Missing name parameter", { status: 400 });
    }

    const partyColor = party === "D" ? "#2563eb" : party === "R" ? "#dc2626" : "#9333ea";
    const partyName = party === "D" ? "Democrat" : party === "R" ? "Republican" : "Independent";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "space-between",
            backgroundColor: "#f8fafc",
            padding: "60px",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {/* Header with branding */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                fontSize: "40px",
              }}
            >
              🏛️
            </div>
            <div
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: "#0f172a",
              }}
            >
              Accountability Dashboard
            </div>
          </div>

          {/* Main content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            {/* Name */}
            <div
              style={{
                fontSize: "72px",
                fontWeight: "black",
                color: "#0f172a",
                lineHeight: 1.1,
                maxWidth: "900px",
              }}
            >
              {name}
            </div>

            {/* Party and Location */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
              }}
            >
              <div
                style={{
                  backgroundColor: partyColor,
                  color: "white",
                  padding: "12px 24px",
                  borderRadius: "12px",
                  fontSize: "28px",
                  fontWeight: "bold",
                }}
              >
                {partyName}
              </div>
              <div
                style={{
                  fontSize: "32px",
                  color: "#475569",
                  fontWeight: "600",
                }}
              >
                {state}{district ? `-${district}` : ""} • {chamber === "house" ? "Representative" : "Senator"}
              </div>
            </div>

            {/* Say vs. Do Score */}
            {score && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  marginTop: "24px",
                }}
              >
                <div
                  style={{
                    fontSize: "28px",
                    color: "#475569",
                    fontWeight: "600",
                  }}
                >
                  Say vs. Do Score:
                </div>
                <div
                  style={{
                    fontSize: "64px",
                    fontWeight: "black",
                    color: parseInt(score) >= 70 ? "#16a34a" : parseInt(score) >= 40 ? "#eab308" : "#dc2626",
                  }}
                >
                  {score}%
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              fontSize: "24px",
              color: "#94a3b8",
              fontWeight: "500",
            }}
          >
            Track Congressional accountability • See who funds them, how they vote
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("OG Image generation error:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
