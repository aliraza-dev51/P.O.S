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

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await prisma.vendorBill.findMany({
      where: { userId: currentUser.id },
      orderBy: { dateTime: "desc" },
    });
    return NextResponse.json(items.map(toClient));
  } catch (error) {
    console.error("GET /api/vendors error:", error);
    return NextResponse.json({ error: "Failed to load vendor bills" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const vendorName = String(body.vendorName ?? "").trim();
    const billAmount = Number(body.billAmount);
    const status = body.status === "Paid" ? "PAID" : "UNPAID";

    if (!vendorName || !Number.isFinite(billAmount) || billAmount <= 0) {
      return NextResponse.json({ error: "Valid vendor name and bill amount are required" }, { status: 400 });
    }

    const item = await prisma.vendorBill.create({
      data: { userId: currentUser.id, vendorName, billAmount, status },
    });

    return NextResponse.json(toClient(item), { status: 201 });
  } catch (error) {
    console.error("POST /api/vendors error:", error);
    return NextResponse.json({ error: "Failed to create vendor bill" }, { status: 500 });
  }
}
