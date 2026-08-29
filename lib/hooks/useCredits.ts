"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createCredit,
  deleteCredit,
  getCredits,
  updateCredit,
  type CreditCustomer,
} from "@/lib/api/credits";
import { creditKeys } from "@/lib/query-keys";

export function useCredits(type: "DAILY" | "MONTHLY" = "DAILY") {
  return useQuery({
    queryKey: creditKeys.list(type),
    queryFn: () => getCredits(type),
  });
}

export function useCreateCredit(type: "DAILY" | "MONTHLY" = "DAILY") {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      personName: string;
      creditType?: "DAILY" | "MONTHLY";
      creditDate?: string;
      currentAmount: number;
      paidAmount: number;
    }) => createCredit(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creditKeys.list(type) });
    },
  });
}

export function useUpdateCredit(type: "DAILY" | "MONTHLY" = "DAILY") {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: {
        personName: string;
        creditType?: "DAILY" | "MONTHLY";
        creditDate?: string;
        currentAmount: number;
        paidAmount: number;
      };
    }) => updateCredit(id, payload),
    onSuccess: (_, variables) => {
      queryClient.setQueryData<CreditCustomer[]>(creditKeys.list(type), (current) =>
        current?.map((item) => (item.id === variables.id ? { ...item, ...variables.payload } : item)) ?? current
      );
      queryClient.invalidateQueries({ queryKey: creditKeys.list(type) });
      queryClient.invalidateQueries({ queryKey: creditKeys.detail(variables.id) });
    },
  });
}

export function useDeleteCredit(type: "DAILY" | "MONTHLY" = "DAILY") {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCredit(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: creditKeys.list(type) });
      queryClient.invalidateQueries({ queryKey: creditKeys.detail(id) });
    },
  });
}
