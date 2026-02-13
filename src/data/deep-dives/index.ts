import { congressionalStockTrading } from "./congressional-stock-trading";
import { pharmaLobbyingDrugPrices } from "./pharma-lobbying-drug-prices";
import { defenseContractorRevolvingDoor } from "./defense-contractor-revolving-door";
import type { DeepDiveInvestigation } from "@/lib/types";

export const deepDiveInvestigations: DeepDiveInvestigation[] = [
  congressionalStockTrading,
  pharmaLobbyingDrugPrices,
  defenseContractorRevolvingDoor,
];

export function getDeepDiveBySlug(slug: string): DeepDiveInvestigation | undefined {
  return deepDiveInvestigations.find((investigation) => investigation.slug === slug);
}

export function getAllDeepDives(): DeepDiveInvestigation[] {
  return deepDiveInvestigations;
}
