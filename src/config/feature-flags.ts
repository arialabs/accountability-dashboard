export type FeatureFlags = {
  judicial: boolean;
  executive: boolean;
  keyVoteRecord: boolean;
  stockTrades: boolean;
  scandals: boolean;
  dogeTracker: boolean;
  dogeStaff: boolean;
  alignmentScore: boolean;
  billSummaries: boolean;
  searchByZip: boolean;
}

export const defaultFlags: FeatureFlags = {
  judicial: false,
  executive: true,
  keyVoteRecord: false,
  stockTrades: true,
  scandals: true,
  dogeTracker: true,
  dogeStaff: true,
  alignmentScore: false,
  billSummaries: false,
  searchByZip: false,
}

export const flagDescriptions: Record<keyof FeatureFlags, string> = {
  judicial: "Judicial branch section (SCOTUS, federal courts)",
  executive: "Executive branch section",
  keyVoteRecord: "Key vote record scoring on rep profiles",
  stockTrades: "Stock trading data on rep profiles",
  scandals: "Scandals section",
  dogeTracker: "DOGE tracker page",
  dogeStaff: "DOGE staff roster",
  alignmentScore: "Progressive/conservative alignment scores",
  billSummaries: "Bill detail pages",
  searchByZip: "Search by ZIP code",
}
