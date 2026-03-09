/**
 * Cloudflare Pages Function: GET /api/find-reps?zip=XXXXX
 *
 * Resolves a 5-digit US ZIP code to:
 *  - 1 House Representative (via ZIP → lat/lng → congressional district)
 *  - 2 Senators (via state code)
 *
 * Returns:
 *   { reps: RawRep[], state: string, district: string }
 *   or { fallback: true } on any error
 *
 * Env vars required:
 *   CONGRESS_API_KEY  — Congress.gov v3 API key
 *
 * Issue #128
 */

const ZIP_RE = /^\d{5}$/;
const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'public, max-age=86400', // cache 24h — districts rarely change
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: CORS_HEADERS });
}

function mapParty(partyName) {
  if (!partyName) return 'I';
  const p = partyName.toLowerCase();
  if (p.includes('democrat')) return 'D';
  if (p.includes('republican')) return 'R';
  return 'I';
}

/**
 * Determine if a Congress.gov member is currently serving in the given chamber.
 * A member is current if their latest term has no endYear (still serving).
 */
function isCurrentChamber(member, chamber) {
  const terms = member.terms?.item ?? [];
  if (!terms.length) return false;
  const latest = terms[terms.length - 1];
  return latest.chamber === chamber && !latest.endYear;
}

/**
 * Shape a Congress.gov member response object into our RawRep format.
 */
function shapeRep(member, stateCode, chamber, district = null) {
  return {
    bioguide_id: member.bioguideId,
    name: member.name,
    party: mapParty(member.partyName),
    state: stateCode,
    chamber,
    district,
    photo_url: member.depiction?.imageUrl ?? null,
  };
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const zip = (url.searchParams.get('zip') ?? '').trim();

  // ── Validate ZIP ──────────────────────────────────────────────────────────
  if (!ZIP_RE.test(zip)) {
    return json({ error: 'Invalid ZIP code. Provide exactly 5 digits.' }, 400);
  }

  const apiKey = env.CONGRESS_API_KEY;
  if (!apiKey) {
    console.error('CONGRESS_API_KEY not set');
    return json({ fallback: true });
  }

  try {
    // ── Step 1: ZIP → lat/lng + state (zippopotam.us — free, no auth) ────────
    const zippRes = await fetch(`https://api.zippopotam.us/us/${zip}`, {
      headers: { 'User-Agent': 'accountability-dashboard/1.0' },
    });
    if (!zippRes.ok) {
      console.warn(`zippopotam returned ${zippRes.status} for ZIP ${zip}`);
      return json({ fallback: true });
    }
    const zippData = await zippRes.json();
    const place = zippData?.places?.[0];
    if (!place) {
      return json({ fallback: true });
    }

    const lat = place.latitude;
    const lon = place.longitude;
    const stateCode = place['state abbreviation']; // e.g. "NY"

    // ── Step 2: lat/lng → Congressional District (Census Geocoder — free) ────
    let districtNum = null;
    try {
      const censusUrl =
        `https://geocoding.geo.census.gov/geocoder/geographies/coordinates` +
        `?x=${encodeURIComponent(lon)}&y=${encodeURIComponent(lat)}` +
        `&benchmark=Public_AR_Current&vintage=Current_Current&layers=54&format=json`;
      const censusRes = await fetch(censusUrl, { signal: AbortSignal.timeout(5000) });
      if (censusRes.ok) {
        const censusData = await censusRes.json();
        const geos = censusData?.result?.geographies ?? {};
        // Layer 54 = Congressional Districts (current congress); key varies by congress session
        const districtLayer = Object.values(geos).flat();
        if (districtLayer.length > 0) {
          districtNum = districtLayer[0].BASENAME; // e.g. "12"
        }
      }
    } catch (censusErr) {
      console.warn('Census geocoder failed:', censusErr.message);
      // Non-fatal — we can still return senators even without House member
    }

    // ── Step 3: Fetch House member (state + district) ─────────────────────────
    const reps = [];

    if (districtNum) {
      try {
        const houseUrl =
          `https://api.congress.gov/v3/member/${stateCode}/${districtNum}` +
          `?currentMember=true&limit=10&api_key=${apiKey}`;
        const houseRes = await fetch(houseUrl, { signal: AbortSignal.timeout(8000) });
        if (houseRes.ok) {
          const houseData = await houseRes.json();
          const houseMember = (houseData.members ?? []).find(
            (m) => isCurrentChamber(m, 'House of Representatives')
          );
          if (houseMember) {
            reps.push(shapeRep(houseMember, stateCode, 'house', districtNum));
          }
        }
      } catch (houseErr) {
        console.warn('House lookup failed:', houseErr.message);
      }
    }

    // ── Step 4: Fetch Senators (state) ────────────────────────────────────────
    try {
      const senateUrl =
        `https://api.congress.gov/v3/member/${stateCode}` +
        `?currentMember=true&limit=20&api_key=${apiKey}`;
      const senateRes = await fetch(senateUrl, { signal: AbortSignal.timeout(8000) });
      if (senateRes.ok) {
        const senateData = await senateRes.json();
        const senators = (senateData.members ?? [])
          .filter((m) => isCurrentChamber(m, 'Senate'))
          .slice(0, 2);
        for (const sen of senators) {
          reps.push(shapeRep(sen, stateCode, 'senate', null));
        }
      }
    } catch (senErr) {
      console.warn('Senate lookup failed:', senErr.message);
    }

    if (reps.length === 0) {
      return json({ fallback: true });
    }

    return json({ reps, state: stateCode, district: districtNum });
  } catch (err) {
    console.error('find-reps unhandled error:', err);
    return json({ fallback: true });
  }
}
