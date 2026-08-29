"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createVendor,
  deleteVendor,
  getVendors,
  updateVendor,
  type VendorItem,
  type VendorStatus,
} from "@/lib/api/vendors";
import { dashboardKeys, vendorKeys } from "@/lib/query-keys";

export function useVendors() {
  return useQuery({
    queryKey: vendorKeys.list(),
    queryFn: getVendors,
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      vendorName: string;
      billAmount: number;
      status: VendorStatus;
    }) => createVendor(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.list() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: {
        vendorName: string;
        billAmount: number;
        status: VendorStatus;
      };
    }) => updateVendor(id, payload),
    onSuccess: (_, variables) => {
      queryClient.setQueryData<VendorItem[]>(vendorKeys.list(), (current) =>
        current?.map((item) => (item.id === variables.id ? { ...item, ...variables.payload } : item)) ?? current
      );
      queryClient.invalidateQueries({ queryKey: vendorKeys.list() });
      queryClient.invalidateQueries({ queryKey: vendorKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteVendor(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.list() });
      queryClient.invalidateQueries({ queryKey: vendorKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}
