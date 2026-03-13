const BILL_PREFIX_MAP: Record<string, string> = {
  HR: "house-bill",
  S: "senate-bill",
  HJRES: "house-joint-resolution",
  SJRES: "senate-joint-resolution",
  HCONRES: "house-concurrent-resolution",
  SCONRES: "senate-concurrent-resolution",
  HRES: "house-resolution",
  SRES: "senate-resolution",
};

const PREFIXES = Object.keys(BILL_PREFIX_MAP).sort((a, b) => b.length - a.length);

export function billToCongressGovUrl(bill: string, congress: number): string | null {
  for (const prefix of PREFIXES) {
    if (bill.startsWith(prefix)) {
      const number = bill.slice(prefix.length);
      if (!number || isNaN(Number(number))) return null;
      const slug = BILL_PREFIX_MAP[prefix];
      return `https://www.congress.gov/bill/${congress}th-congress/${slug}/${number}`;
    }
  }
  return null;
}

export function rollCallUrl(
  chamber: "House" | "Senate",
  rollnumber: number,
  date: string,
  congress: number
): string {
  if (chamber === "House") {
    const year = new Date(date).getFullYear();
    return `https://clerk.house.gov/Votes/${year}${rollnumber}`;
  }
  const year = new Date(date).getFullYear();
  const congressStartYear = 2025 + (congress - 119) * 2;
  const session = year === congressStartYear ? 1 : 2;
  const paddedRoll = String(rollnumber).padStart(5, "0");
  return `https://www.senate.gov/legislative/LIS/roll_call_votes/vote${congress}${session}/vote_${congress}_${session}_${paddedRoll}.htm`;
}
