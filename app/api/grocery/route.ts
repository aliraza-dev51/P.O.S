import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const items = await prisma.groceryItem.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(items);
  } catch (error) {
    console.error("GET /api/grocery error:", error);
    return NextResponse.json({ error: "Failed to load grocery items" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const itemName = String(body.itemName ?? "").trim();
    const weight = Number(body.weight);
    const quantity = Number(body.quantity);
    const rate = Number(body.rate);
    const transportation = Number(body.transportation);
    const sellingPrice = Number(body.sellingPrice);

    if (!itemName || !Number.isFinite(weight) || weight <= 0 || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(rate) || rate < 0 || !Number.isFinite(transportation) || transportation < 0 || !Number.isFinite(sellingPrice) || sellingPrice <= 0) {
      return NextResponse.json({ error: "Please fill all fields correctly." }, { status: 400 });
    }

    const item = await prisma.groceryItem.create({
      data: { itemName, weight, quantity, rate, transportation, sellingPrice },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("POST /api/grocery error:", error);
    return NextResponse.json({ error: "Failed to create grocery item" }, { status: 500 });
  }
}
