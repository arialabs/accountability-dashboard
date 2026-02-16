"use client";

import { useApi } from "./useApi";
import { fetchVotes, type ApiVoteviewMember } from "../lib/api-client";

export function useVotes(chamber?: string, congress?: string) {
  return useApi<ApiVoteviewMember[]>(
    (signal) => fetchVotes({ chamber, congress, signal }),
    [chamber, congress]
  );
}
