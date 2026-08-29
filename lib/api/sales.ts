export type OnlineAccount = "EasyPaisa" | "Bank Islami";

export type Sale = {
  id: number;
  salesMonthId?: number;
  date: string;
  openingAmount: number;
  expense: number;
  saleAmount: number;
  cashAmount: number;
  onlineAmount: number;
  onlineAccount: OnlineAccount | "";
};

export type SalesMonth = {
  id: number;
  month: number;
  year: number;
  openingBalance: number;
  closingBalance: number | null;
  isClosed: boolean;
  closedAt: string | null;
  salesCount?: number;
};

export type SalesApiResponse = {
  success?: boolean;
  error?: string;
  sales?: Sale[];
  activeMonth?: SalesMonth | null;
  month?: SalesMonth | null;
  vendorExpense?: number;
  totalSales?: number;
  currentBalance?: number;
  history?: SalesMonth[];
  months?: SalesMonth[];
  closedMonth?: SalesMonth;
  newMonth?: SalesMonth;
};

export async function getSales(): Promise<SalesApiResponse> {
  const response = await fetch("/api/sales", {
    method: "GET",
    cache: "no-store",
  });

  const data = (await response.json()) as SalesApiResponse;

  if (!response.ok) {
    throw new Error(data.error || "Unable to load sales.");
  }

  return data;
}

export async function createSale(payload: {
  date: string;
  openingAmount: number;
  cashAmount: number;
  onlineAmount: number;
  onlineAccount: OnlineAccount | "" | null;
  saleAmount: number;
}): Promise<SalesApiResponse> {
  const response = await fetch("/api/sales", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as SalesApiResponse;

  if (!response.ok) {
    throw new Error(data.error || "Unable to save sale.");
  }

  return data;
}

export async function updateSale(
  id: number,
  payload: {
    date: string;
    openingAmount: number;
    cashAmount: number;
    onlineAmount: number;
    onlineAccount: OnlineAccount | "" | null;
    saleAmount: number;
  }
): Promise<SalesApiResponse> {
  const response = await fetch(`/api/sales/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as SalesApiResponse;

  if (!response.ok) {
    throw new Error(data.error || "Unable to save sale.");
  }

  return data;
}

export async function deleteSale(id: number): Promise<SalesApiResponse> {
  const response = await fetch(`/api/sales/${id}`, {
    method: "DELETE",
  });

  const data = (await response.json()) as SalesApiResponse;

  if (!response.ok) {
    throw new Error(data.error || "Unable to delete sale.");
  }

  return data;
}

export async function closeSalesMonth(id: number): Promise<SalesApiResponse> {
  const response = await fetch(`/api/sales/months/${id}/close`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  const data = (await response.json()) as SalesApiResponse;

  if (!response.ok) {
    throw new Error(data.error || "Unable to close month.");
  }

  return data;
}
