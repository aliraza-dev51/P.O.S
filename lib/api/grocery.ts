export type GroceryItem = {
  id: number;
  itemName: string;
  weight: number;
  quantity: number;
  rate: number;
  transportation: number;
  sellingPrice: number;
  entryDate: string;
  month: number;
  year: number;
  isClosed: boolean;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GroceryMonth = {
  month: number;
  year: number;
  isClosed: boolean;
  closedAt: string | null;
  items: GroceryItem[];
  totalItems: number;
  totalWeight: number;
  totalSales: number;
  totalProfit: number;
};

// Get current/active month's grocery items with metadata
export async function getGrocery(month?: number, year?: number, date?: string): Promise<GroceryMonth> {
  const params = new URLSearchParams();
  if (month !== undefined) params.append("month", String(month));
  if (year !== undefined) params.append("year", String(year));
  if (date) params.append("date", date);

  const response = await fetch(`/api/grocery?${params.toString()}`, { cache: "no-store" });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Failed to load grocery items.");
  }

  return data as GroceryMonth;
}

// Get all closed months (history)
export async function getGroceryHistory(): Promise<GroceryMonth[]> {
  const response = await fetch(`/api/grocery?closed=true`, { cache: "no-store" });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Failed to load grocery history.");
  }

  return data as GroceryMonth[];
}

// Get specific month's complete record
export async function getGroceryMonth(month: number, year: number): Promise<GroceryMonth> {
  const response = await fetch(`/api/grocery?month=${month}&year=${year}`, { cache: "no-store" });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Failed to load grocery month.");
  }

  return data as GroceryMonth;
}

// Search grocery items by name in current or specific month
export async function searchGrocery(
  search: string,
  month?: number,
  year?: number,
  date?: string
): Promise<GroceryItem[]> {
  const params = new URLSearchParams({ search });
  if (month !== undefined) params.append("month", String(month));
  if (year !== undefined) params.append("year", String(year));
  if (date) params.append("date", date);

  const response = await fetch(`/api/grocery?${params.toString()}`, { cache: "no-store" });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Failed to search grocery items.");
  }

  return data as GroceryItem[];
}

// Create new grocery item for current active month
export async function createGrocery(payload: {
  itemName: string;
  weight: number;
  quantity: number;
  rate: number;
  transportation: number;
  sellingPrice: number;
  entryDate?: string;
}): Promise<GroceryItem> {
  const response = await fetch("/api/grocery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Failed to create grocery item.");
  }

  return data as GroceryItem;
}

// Update existing grocery item
export async function updateGrocery(
  id: number,
  payload: {
    itemName: string;
    weight: number;
    quantity: number;
    rate: number;
    transportation: number;
    sellingPrice: number;
    entryDate?: string;
  }
): Promise<GroceryItem> {
  const response = await fetch(`/api/grocery/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Failed to update grocery item.");
  }

  return data as GroceryItem;
}

// Delete grocery item
export async function deleteGrocery(id: number): Promise<void> {
  const response = await fetch(`/api/grocery/${id}`, {
    method: "DELETE",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Failed to delete grocery item.");
  }
}

// Close a grocery month (make it historical/read-only)
export async function closeGroceryMonth(month: number, year: number): Promise<void> {
  const response = await fetch("/api/grocery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "close-month",
      month,
      year,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Failed to close grocery month.");
  }
}
