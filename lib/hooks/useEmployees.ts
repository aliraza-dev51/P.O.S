"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createEmployee,
  deleteEmployee,
  getAttendance,
  getEmployees,
  saveAttendance,
  type Attendance,
  type AttendanceStatus,
  type Employee,
  updateEmployee,
} from "@/lib/api/employees";
import { attendanceKeys, employeeKeys } from "@/lib/query-keys";

export function useEmployees() {
  return useQuery({
    queryKey: employeeKeys.list(),
    queryFn: getEmployees,
  });
}

export function useAttendance() {
  return useQuery({
    queryKey: attendanceKeys.list(),
    queryFn: getAttendance,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<Employee, "id">) => createEmployee(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.list() });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Omit<Employee, "id">;
    }) => updateEmployee(id, payload),
    onSuccess: (_, variables) => {
      queryClient.setQueryData<Employee[]>(employeeKeys.list(), (current) =>
        current?.map((employee) => (employee.id === variables.id ? { ...employee, ...variables.payload } : employee)) ?? current
      );
      queryClient.invalidateQueries({ queryKey: employeeKeys.list() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(variables.id) });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteEmployee(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.list() });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.list() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
    },
  });
}

export function useSaveAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      employeeId: number;
      date: string;
      inTime?: string;
      outTime?: string;
      status: AttendanceStatus;
    }) => saveAttendance(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.list() });
    },
  });
}

export function useAttendanceRecord(employeeId: number, date: string) {
  return useQuery({
    queryKey: attendanceKeys.detail(employeeId),
    queryFn: async () => {
      const records = await getAttendance();
      return records.find((record) => record.employeeId === employeeId && record.date === date) ?? null;
    },
    enabled: Boolean(employeeId && date),
  });
}
