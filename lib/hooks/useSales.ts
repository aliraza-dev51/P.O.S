"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  closeSalesMonth,
  createSale,
  deleteSale,
  getSales,
  updateSale,
  type SalesApiResponse,
  type Sale,
  type SalesMonth,
} from "@/lib/api/sales";
import { salesKeys } from "@/lib/query-keys";

export function useSales(month?: number, year?: number) {
  return useQuery({
    queryKey: salesKeys.list(month, year),
    queryFn: getSales,
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      date: string;
      openingAmount: number;
      cashAmount: number;
      onlineAmount: number;
      onlineAccount: "EasyPaisa" | "Bank Islami" | "" | null;
      saleAmount: number;
    }) => createSale(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.all });
    },
  });
}

export function useUpdateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: {
        date: string;
        openingAmount: number;
        cashAmount: number;
        onlineAmount: number;
        onlineAccount: "EasyPaisa" | "Bank Islami" | "" | null;
        saleAmount: number;
      };
    }) => updateSale(id, payload),
    onSuccess: (_, variables) => {
      queryClient.setQueryData<SalesApiResponse>(salesKeys.list(), (current) => {
        if (!current?.sales) return current;

        const normalizedSales = current.sales.map((sale) => {
          if (sale.id !== variables.id) return sale;

          return {
            ...sale,
            ...variables.payload,
            onlineAccount: variables.payload.onlineAccount ?? "",
          } satisfies Sale;
        });

        return {
          ...current,
          sales: normalizedSales,
        };
      });
      queryClient.invalidateQueries({ queryKey: salesKeys.all });
      queryClient.invalidateQueries({ queryKey: salesKeys.detail(variables.id) });
    },
  });
}

export function useDeleteSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteSale(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.all });
      queryClient.invalidateQueries({ queryKey: salesKeys.detail(id) });
    },
  });
}

export function useCloseSalesMonth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => closeSalesMonth(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.all });
    },
  });
}
