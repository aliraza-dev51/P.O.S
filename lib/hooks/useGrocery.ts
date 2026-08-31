"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  closeGroceryMonth,
  createGrocery,
  deleteGrocery,
  getGrocery,
  getGroceryHistory,
  getGroceryMonth,
  searchGrocery,
  type GroceryItem,
  type GroceryMonth,
  updateGrocery,
} from "@/lib/api/grocery";
import { groceryKeys } from "@/lib/query-keys";

// Get current month's grocery items
export function useGrocery(month?: number, year?: number, date?: string) {
  return useQuery({
    queryKey: groceryKeys.list(month, year, date),
    queryFn: () => getGrocery(month, year, date),
  });
}

// Get all closed months (history)
export function useGroceryHistory() {
  return useQuery({
    queryKey: groceryKeys.history(),
    queryFn: () => getGroceryHistory(),
  });
}

// Get specific month's complete record
export function useGroceryMonth(month: number, year: number) {
  return useQuery({
    queryKey: groceryKeys.month(month, year),
    queryFn: () => getGroceryMonth(month, year),
    enabled: month > 0 && year > 0,
  });
}

// Search grocery items
export function useGrocerySearch(search: string, month?: number, year?: number, date?: string) {
  return useQuery({
    queryKey: ["grocery", "search", search, month, year],
    queryFn: () => searchGrocery(search, month, year, date),
    enabled: search.length > 0,
  });
}

// Create new grocery item
export function useCreateGrocery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      itemName: string;
      weight: number;
      quantity: number;
      rate: number;
      transportation: number;
      sellingPrice: number;
      entryDate?: string;
    }) => createGrocery(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groceryKeys.all });
    },
  });
}

// Update grocery item
export function useUpdateGrocery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: {
        itemName: string;
        weight: number;
        quantity: number;
        rate: number;
        transportation: number;
        sellingPrice: number;
        entryDate?: string;
      };
    }) => updateGrocery(id, payload),
    onSuccess: (data) => {
      // Update cache for current month
      queryClient.setQueryData<GroceryItem[]>(groceryKeys.list(), (current) =>
        current?.map((item) => (item.id === data.id ? data : item)) ?? current
      );

      queryClient.invalidateQueries({ queryKey: groceryKeys.all });
      queryClient.invalidateQueries({ queryKey: groceryKeys.detail(data.id) });
    },
  });
}

// Delete grocery item
export function useDeleteGrocery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteGrocery(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: groceryKeys.all });
      queryClient.invalidateQueries({ queryKey: groceryKeys.detail(id) });
    },
  });
}

// Close grocery month
export function useCloseGroceryMonth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ month, year }: { month: number; year: number }) =>
      closeGroceryMonth(month, year),
    onSuccess: () => {
      // Invalidate all grocery queries
      queryClient.invalidateQueries({ queryKey: groceryKeys.all });
    },
  });
}
