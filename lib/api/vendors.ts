export type VendorStatus = "Paid" | "Unpaid";

export type VendorItem = {
  id: number;
  dateTime: string;
  vendorName: string;
  billAmount: number;
  status: VendorStatus;
};

export async function getVendors(): Promise<VendorItem[]> {
  const response = await fetch("/api/vendors", { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Failed to load vendor bills");
  }

  return (await response.json()) as VendorItem[];
}

export async function createVendor(payload: {
  vendorName: string;
  billAmount: number;
  status: VendorStatus;
}): Promise<VendorItem> {
  const response = await fetch("/api/vendors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Unable to save vendor bill");
  }

  return data as VendorItem;
}

export async function updateVendor(
  id: number,
  payload: {
    vendorName: string;
    billAmount: number;
    status: VendorStatus;
  }
): Promise<VendorItem> {
  const response = await fetch(`/api/vendors/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Unable to update vendor bill");
  }

  return data as VendorItem;
}

export async function deleteVendor(id: number): Promise<void> {
  const response = await fetch(`/api/vendors/${id}`, {
    method: "DELETE",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Unable to delete vendor bill");
  }
}
