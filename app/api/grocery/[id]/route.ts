import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const toNumber = (value: unknown) => Number(value ?? 0);

// ============================================================
// PUT: Update grocery item
// ============================================================
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const body = await request.json();
    const itemName = String(body.itemName ?? "").trim();
    const weight = Number(body.weight);
    const quantity = Number(body.quantity);
    const rate = Number(body.rate);
    const transportation = Number(body.transportation);
    const sellingPrice = Number(body.sellingPrice);

    if (
      !Number.isInteger(id) ||
      id <= 0 ||
      !itemName ||
      !Number.isFinite(weight) ||
      weight <= 0 ||
      !Number.isFinite(quantity) ||
      quantity <= 0 ||
      !Number.isFinite(rate) ||
      rate < 0 ||
      !Number.isFinite(transportation) ||
      transportation < 0 ||
      !Number.isFinite(sellingPrice) ||
      sellingPrice <= 0
    ) {
      return NextResponse.json({ error: "Invalid grocery item data." }, { status: 400 });
    }

    // Check if item exists
    const existing = await prisma.groceryItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Grocery item not found." }, { status: 404 });
    }

    // Prevent editing closed month items
    if (existing.isClosed) {
      return NextResponse.json(
        { error: "Cannot edit items from a closed month." },
        { status: 400 }
      );
    }

    const item = await prisma.groceryItem.update({
      where: { id },
      data: { itemName, weight, quantity, rate, transportation, sellingPrice },
    });

    return NextResponse.json({
      id: item.id,
      itemName: item.itemName,
      weight: toNumber(item.weight),
      quantity: item.quantity,
      rate: toNumber(item.rate),
      transportation: toNumber(item.transportation),
      sellingPrice: toNumber(item.sellingPrice),
      month: item.month,
      year: item.year,
      isClosed: item.isClosed,
      closedAt: item.closedAt ? item.closedAt.toISOString() : null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("PUT /api/grocery/[id] error:", error);
    return NextResponse.json({ error: "Failed to update grocery item" }, { status: 500 });
  }
}

// ============================================================
// DELETE: Delete grocery item
// ============================================================
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Invalid id." }, { status: 400 });
    }

    // Check if item exists
    const existing = await prisma.groceryItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Grocery item not found." }, { status: 404 });
    }

    // Prevent deleting closed month items
    if (existing.isClosed) {
      return NextResponse.json(
        { error: "Cannot delete items from a closed month." },
        { status: 400 }
      );
    }

    await prisma.groceryItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/grocery/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete grocery item" }, { status: 500 });
  }
}
