/**
 * Cloudflare Pages Function — GET /api/find-reps?zip=XXXXX
 *
 * Looks up Congress members by ZIP code using the Congress.gov API,
 * then matches bioguide IDs against the local members + finance data.
 */

import membersData from "../../src/data/members.json";
import financeData from "../../src/data/finance.json";

const STATE_ABBREV = {
  Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR",
  California: "CA", Colorado: "CO", Connecticut: "CT", Delaware: "DE",
  Florida: "FL", Georgia: "GA", Hawaii: "HI", Idaho: "ID",
  Illinois: "IL", Indiana: "IN", Iowa: "IA", Kansas: "KS",
  Kentucky: "KY", Louisiana: "LA", Maine: "ME", Maryland: "MD",
  Massachusetts: "MA", Michigan: "MI", Minnesota: "MN", Mississippi: "MS",
  Missouri: "MO", Montana: "MT", Nebraska: "NE", Nevada: "NV",
  "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM",
  "New York": "NY", "North Carolina": "NC", "North Dakota": "ND",
  Ohio: "OH", Oklahoma: "OK", Oregon: "OR", Pennsylvania: "PA",
  "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD",
  Tennessee: "TN", Texas: "TX", Utah: "UT", Vermont: "VT",
  Virginia: "VA", Washington: "WA", "West Virginia": "WV",
  Wisconsin: "WI", Wyoming: "WY",
  "District of Columbia": "DC", "American Samoa": "AS", Guam: "GU",
  "Northern Mariana Islands": "MP", "Puerto Rico": "PR",
  "U.S. Virgin Islands": "VI",
};

/** Build a lookup map once at cold-start */
const membersByBioguide = Object.fromEntries(
  membersData.map((m) => [
    m.bioguide_id,
    { ...m, state: STATE_ABBREV[m.state] || m.state },
  ])
);

function getVerdictScore(bioguideId) {
  const f = financeData[bioguideId];
  if (!f) return { verdictScore: null, verdictLabel: null };
  const pac = f.pac_percentage ?? 0;
  const large = f.large_donor_percentage ?? 0;
  if (pac === 0 && large === 0) return { verdictScore: null, verdictLabel: null };
  if (pac >= 60 || large >= 75) return { verdictScore: "captured", verdictLabel: "Donor Captured" };
  if (pac >= 30 || large >= 50) return { verdictScore: "mixed", verdictLabel: "Mixed Allegiance" };
  return { verdictScore: "focused", verdictLabel: "Constituent Focused" };
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const zip = url.searchParams.get("zip");

  if (!zip || !/^\d{5}$/.test(zip)) {
    return Response.json(
      { error: "A valid 5-digit ZIP code is required (?zip=XXXXX)" },
      { status: 400 }
    );
  }

  const apiKey = context.env.CONGRESS_API_KEY;
  if (!apiKey) {
    return Response.json(
      { fallback: true, message: "Congress API key not configured. Try searching by state instead." },
      { status: 200 }
    );
  }

  try {
    const res = await fetch(
      `https://api.congress.gov/v3/zipcode/${zip}?api_key=${apiKey}&format=json`,
      { headers: { Accept: "application/json" } }
    );

    if (!res.ok) {
      return Response.json(
        { fallback: true, message: `Congress API returned ${res.status}. Try searching by state instead.` },
        { status: 200 }
      );
    }

    const data = await res.json();
    const bioguideIds = (data.results || []).map((r) => r.bioguide_id || r.bioguideId).filter(Boolean);

    const matched = bioguideIds
      .map((id) => {
        const m = membersByBioguide[id];
        if (!m) return null;
        const { verdictScore, verdictLabel } = getVerdictScore(id);
        return {
          id: m.bioguide_id,
          name: m.full_name,
          state: m.state,
          party: m.party,
          chamber: m.chamber,
          district: m.district,
          photo_url: m.photo_url,
          verdictScore,
          verdictLabel,
        };
      })
      .filter(Boolean);

    return Response.json(matched, { status: 200 });
  } catch (err) {
    return Response.json(
      { fallback: true, message: "Could not reach Congress API. Try searching by state instead." },
      { status: 200 }
    );
  }
}
