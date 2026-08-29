export type AttendanceStatus =
  | "Present"
  | "Absent"
  | "Off"
  | "Half Day"
  | "Late";

export type Employee = {
  id: number;
  name: string;
  phone: string;
  cnic: string;
  designation: string;
  salary: number;
  joiningDate: string;
  image: string;
};

export type Attendance = {
  id: number;
  employeeId: number;
  date: string;
  inTime: string;
  outTime: string;
  status: AttendanceStatus;
};

type EmployeeRecord = {
  id: number;
  name: string;
  phone?: string | null;
  cnic?: string | null;
  designation: string;
  salary: number | string;
  joiningDate: string | Date;
  image?: string | null;
};

export async function getEmployees(): Promise<Employee[]> {
  const response = await fetch("/api/employees", { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Failed to load employees");
  }

  const data = (await response.json()) as EmployeeRecord[];

  return (data ?? []).map((employee) => ({
    ...employee,
    salary: Number(employee.salary),
    joiningDate: new Date(employee.joiningDate).toISOString().split("T")[0],
    phone: employee.phone ?? "",
    cnic: employee.cnic ?? "",
    image: employee.image ?? "",
  })) as Employee[];
}

export async function getAttendance(): Promise<Attendance[]> {
  const response = await fetch("/api/attendance", { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Failed to load attendance");
  }

  return (await response.json()) as Attendance[];
}

export async function createEmployee(payload: Omit<Employee, "id">): Promise<Employee> {
  const response = await fetch("/api/employees", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Unable to save employee");
  }

  return {
    ...data,
    salary: Number(data.salary),
    joiningDate: new Date(data.joiningDate).toISOString().split("T")[0],
    phone: data.phone ?? "",
    cnic: data.cnic ?? "",
    image: data.image ?? "",
  } as Employee;
}

export async function updateEmployee(
  id: number,
  payload: Omit<Employee, "id">
): Promise<Employee> {
  const response = await fetch(`/api/employees/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Unable to save employee");
  }

  return {
    ...data,
    salary: Number(data.salary),
    joiningDate: new Date(data.joiningDate).toISOString().split("T")[0],
    phone: data.phone ?? "",
    cnic: data.cnic ?? "",
    image: data.image ?? "",
  } as Employee;
}

export async function deleteEmployee(id: number): Promise<void> {
  const response = await fetch(`/api/employees/${id}`, {
    method: "DELETE",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Unable to delete employee");
  }
}

export async function saveAttendance(payload: {
  employeeId: number;
  date: string;
  inTime?: string;
  outTime?: string;
  status: AttendanceStatus;
}): Promise<Attendance> {
  const existingRecords = await getAttendance();
  const existing = existingRecords.find(
    (record) => record.employeeId === payload.employeeId && record.date === payload.date
  );

  const response = await fetch(existing ? `/api/attendance/${existing.id}` : "/api/attendance", {
    method: existing ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Unable to mark attendance");
  }

  return data as Attendance;
}
