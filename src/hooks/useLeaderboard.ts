"use client";

import { useApi } from "./useApi";
import { fetchLeaderboard, type ApiLeaderboardData } from "../lib/api-client";

export function useLeaderboard() {
  return useApi<ApiLeaderboardData>(
    (signal) => fetchLeaderboard(signal),
    []
  );
}
