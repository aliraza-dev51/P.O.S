export type CreditType = "DAILY" | "MONTHLY";

export type CreditCustomer = {
  id: number;
  personName: string;
  creditType: CreditType;
  creditDate: string;
  month: number;
  year: number;
  isClosed: boolean;
  closedAt: string | null;
  previousBalance: number;
  currentAmount: number;
  paidAmount: number;
};

export async function getCredits(type: "DAILY" | "MONTHLY" = "DAILY"): Promise<CreditCustomer[]> {
  const response = await fetch(`/api/credits?type=${type}`, { cache: "no-store" });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Failed to load credit records.");
  }

  return data as CreditCustomer[];
}

export async function createCredit(payload: {
  personName: string;
  creditType?: CreditType;
  creditDate?: string;
  currentAmount: number;
  paidAmount: number;
}): Promise<CreditCustomer> {
  const response = await fetch("/api/credits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Failed to save credit record.");
  }

  return data as CreditCustomer;
}

export async function updateCredit(
  id: number,
  payload: {
    personName: string;
    creditType?: CreditType;
    creditDate?: string;
    currentAmount: number;
    paidAmount: number;
  }
): Promise<CreditCustomer> {
  const response = await fetch(`/api/credits/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Failed to update credit record.");
  }

  return data as CreditCustomer;
}

export async function deleteCredit(id: number): Promise<void> {
  const response = await fetch(`/api/credits/${id}`, {
    method: "DELETE",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Failed to delete credit record.");
  }
}
