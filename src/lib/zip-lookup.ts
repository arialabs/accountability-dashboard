/**
 * ZIP code lookup utilities — shared between client search and API route.
 */

import { getMemberFinanceStatic } from "./data";

/** Returns true when the input looks like a 5-digit US ZIP code. */
export function isZipCode(input: string): boolean {
  return /^\d{5}$/.test(input.trim());
}

export interface ZipRepResult {
  id: string;
  name: string;
  state: string;
  party: string;
  chamber: string;
  district: number | null;
  photo_url: string | null;
  verdictScore: "captured" | "mixed" | "focused" | null;
  verdictLabel: string | null;
}

/** Compute verdict from finance data (mirrors the getDonorVerdict in congress page). */
export function getVerdictForMember(bioguideId: string): {
  verdictScore: "captured" | "mixed" | "focused" | null;
  verdictLabel: string | null;
} {
  const finance = getMemberFinanceStatic(bioguideId);
  if (!finance) return { verdictScore: null, verdictLabel: null };
  const pac = finance.pac_percentage ?? 0;
  const large = finance.large_donor_percentage ?? 0;
  if (pac === 0 && large === 0) return { verdictScore: null, verdictLabel: null };
  if (pac >= 60 || large >= 75)
    return { verdictScore: "captured", verdictLabel: "Donor Captured" };
  if (pac >= 30 || large >= 50)
    return { verdictScore: "mixed", verdictLabel: "Mixed Allegiance" };
  return { verdictScore: "focused", verdictLabel: "Constituent Focused" };
}

/** Map raw API results to our ZipRepResult shape using local member data. */
export function mapApiResultToReps(
  apiResults: ZipRepResult[]
): ZipRepResult[] {
  // API already returns the shape we need; this is a pass-through
  // but ensures type safety on the client side.
  return apiResults.filter(
    (r) => r && r.id && r.name
  );
}

/**
 * Fetch representatives for a ZIP code from our Pages Function endpoint.
 * Returns { reps, fallback, message } — callers should check fallback.
 */
export async function fetchRepsByZip(
  zip: string
): Promise<{ reps: ZipRepResult[]; fallback: boolean; message: string }> {
  try {
    const res = await fetch(`/api/find-reps?zip=${encodeURIComponent(zip)}`);
    const data = await res.json();

    if (data.fallback) {
      return { reps: [], fallback: true, message: data.message };
    }
    if (data.error) {
      return { reps: [], fallback: true, message: data.error };
    }

    return { reps: mapApiResultToReps(data), fallback: false, message: "" };
  } catch {
    return {
      reps: [],
      fallback: true,
      message: "Network error looking up ZIP code. Try searching by name or state.",
    };
  }
}
