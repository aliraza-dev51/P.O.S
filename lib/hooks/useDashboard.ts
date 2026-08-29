"use client";

import { useQuery } from "@tanstack/react-query";

import { dashboardKeys } from "@/lib/query-keys";
import { getDashboardData } from "@/lib/api/dashboard";

export function useDashboard() {
  return useQuery({
    queryKey: dashboardKeys.all,
    queryFn: getDashboardData,
  });
}
