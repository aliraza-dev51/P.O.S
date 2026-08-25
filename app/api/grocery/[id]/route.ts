import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const body = await request.json();
    const itemName = String(body.itemName ?? "").trim();
    const weight = Number(body.weight);
    const quantity = Number(body.quantity);
    const rate = Number(body.rate);
    const transportation = Number(body.transportation);
    const sellingPrice = Number(body.sellingPrice);

    if (!Number.isInteger(id) || id <= 0 || !itemName || !Number.isFinite(weight) || weight <= 0 || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(rate) || rate < 0 || !Number.isFinite(transportation) || transportation < 0 || !Number.isFinite(sellingPrice) || sellingPrice <= 0) {
      return NextResponse.json({ error: "Invalid grocery item data." }, { status: 400 });
    }

    const item = await prisma.groceryItem.update({
      where: { id },
      data: { itemName, weight, quantity, rate, transportation, sellingPrice },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("PUT /api/grocery/[id] error:", error);
    return NextResponse.json({ error: "Failed to update grocery item" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Invalid id." }, { status: 400 });
    }

    await prisma.groceryItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/grocery/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete grocery item" }, { status: 500 });
  }
}
