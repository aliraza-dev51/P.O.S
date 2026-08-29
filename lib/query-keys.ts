export const dashboardKeys = {
  all: ["dashboard"] as const,
};

export const vendorKeys = {
  all: ["vendors"] as const,
  list: () => [...vendorKeys.all, "list"] as const,
  detail: (id: number) => [...vendorKeys.all, "detail", id] as const,
};

export const creditKeys = {
  all: ["credits"] as const,
  list: (type: "DAILY" | "MONTHLY" = "DAILY") => [...creditKeys.all, type, "list"] as const,
  detail: (id: number) => [...creditKeys.all, "detail", id] as const,
};

export const employeeKeys = {
  all: ["employees"] as const,
  list: () => [...employeeKeys.all, "list"] as const,
  detail: (id: number) => [...employeeKeys.all, "detail", id] as const,
};

export const attendanceKeys = {
  all: ["attendance"] as const,
  list: () => [...attendanceKeys.all, "list"] as const,
  detail: (id: number) => [...attendanceKeys.all, "detail", id] as const,
};

export const salesKeys = {
  all: ["sales"] as const,
  list: (month?: number, year?: number) =>
    [...salesKeys.all, "list", month ?? "active", year ?? "active"] as const,
  detail: (id: number) => [...salesKeys.all, "detail", id] as const,
};

export const groceryKeys = {
  all: ["grocery"] as const,
  list: (month?: number, year?: number) =>
    [...groceryKeys.all, "list", month ?? "current", year ?? "current"] as const,
  history: () => [...groceryKeys.all, "history"] as const,
  month: (month: number, year: number) => [...groceryKeys.all, "month", month, year] as const,
  detail: (id: number) => [...groceryKeys.all, "detail", id] as const,
};
