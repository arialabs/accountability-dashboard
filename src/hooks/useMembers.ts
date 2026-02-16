"use client";

import { useApi } from "./useApi";
import { fetchMembers, fetchMemberDetail, type ApiMember, type ApiMemberDetail } from "../lib/api-client";

export function useMembers(chamber?: string) {
  return useApi<{ members: ApiMember[]; pagination: any }>(
    (signal) => fetchMembers({ chamber, limit: 250, signal }),
    [chamber]
  );
}

export function useMemberDetail(bioguideId: string | null) {
  return useApi<ApiMemberDetail | null>(
    (signal) => bioguideId ? fetchMemberDetail(bioguideId, signal) : Promise.resolve(null),
    [bioguideId]
  );
}
