import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const toClient = (item: any) => ({
  id: item.id,
  dateTime: item.dateTime.toISOString(),
  vendorName: item.vendorName,
  billAmount: Number(item.billAmount),
  status: item.status === "PAID" ? "Paid" : "Unpaid",
});

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = Number(params.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "Invalid vendor bill id" }, { status: 400 });
    }

    const existing = await prisma.vendorBill.findFirst({ where: { id, userId: currentUser.id } });
    if (!existing) {
      return NextResponse.json({ error: "Vendor bill not found" }, { status: 404 });
    }

    const body = await request.json();
    const vendorName = String(body.vendorName ?? "").trim();
    const billAmount = Number(body.billAmount);
    const status = body.status === "Paid" ? "PAID" : "UNPAID";

    if (!vendorName || !Number.isFinite(billAmount) || billAmount <= 0) {
      return NextResponse.json({ error: "Valid vendor name and bill amount are required" }, { status: 400 });
    }

    const item = await prisma.vendorBill.update({
      where: { id },
      data: { vendorName, billAmount, status },
    });

    return NextResponse.json(toClient(item));
  } catch (error) {
    console.error("PUT /api/vendors/[id] error:", error);
    return NextResponse.json({ error: "Failed to update vendor bill" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = Number(params.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "Invalid vendor bill id" }, { status: 400 });
    }

    const existing = await prisma.vendorBill.findFirst({ where: { id, userId: currentUser.id } });
    if (!existing) {
      return NextResponse.json({ error: "Vendor bill not found" }, { status: 404 });
    }

    await prisma.vendorBill.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/vendors/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete vendor bill" }, { status: 500 });
  }
}
