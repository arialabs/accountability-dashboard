"use client";

import { useApi } from "./useApi";
import { fetchLeaderboard, type ApiLeaderboard } from "../lib/api-client";

export function useLeaderboard() {
  return useApi<ApiLeaderboard>(
    (signal) => fetchLeaderboard(signal),
    []
  );
}
