"use client";

import { useApi } from "./useApi";
import { fetchMembers, fetchMemberDetail, type ApiMember } from "../lib/api-client";

export function useMembers() {
  return useApi<ApiMember[]>(
    (signal) => fetchMembers(signal),
    []
  );
}

export function useMemberDetail(bioguideId: string | null) {
  return useApi<ApiMember | null>(
    (signal) => bioguideId ? fetchMemberDetail(bioguideId, signal) : Promise.resolve(null),
    [bioguideId]
  );
}
