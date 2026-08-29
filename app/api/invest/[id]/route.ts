import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getMonthYearFromDate(dateValue?: string | Date) {
  const date = new Date(dateValue ?? Date.now());
  return { month: date.getMonth() + 1, year: date.getFullYear() };
}

function validateInvestment(body: unknown) {
  if (typeof body !== "object" || body === null) return null;

  const data = body as Record<string, unknown>;
  const itemName = String(data.itemName ?? "").trim();
  const weight = Number(data.weight);
  const quantity = Number(data.quantity);
  const quantityPerPack = Number(data.quantityPerPack);
  const rate = Number(data.rate);
  const marketRate = Number(data.marketRate);

  if (
    !itemName ||
    !Number.isFinite(weight) ||
    !Number.isFinite(quantity) ||
    !Number.isFinite(quantityPerPack) ||
    !Number.isFinite(rate) ||
    !Number.isFinite(marketRate)
  ) {
    return null;
  }

  if (
    weight <= 0 ||
    quantity <= 0 ||
    quantityPerPack <= 0 ||
    rate < 0 ||
    marketRate < 0
  ) {
    return null;
  }

  if (!Number.isInteger(quantity) || !Number.isInteger(quantityPerPack)) {
    return null;
  }

  return {
    itemName,
    weight,
    quantity,
    quantityPerPack,
    rate,
    marketRate,
    dateTime: data.dateTime ? new Date(String(data.dateTime)) : new Date(),
  };
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const investmentId = Number(id);

    if (!Number.isInteger(investmentId)) {
      return NextResponse.json({ message: "Invalid investment ID" }, { status: 400 });
    }

    const body = await request.json();
    const existing = await prisma.investment.findFirst({ where: { id: investmentId, userId: currentUser.id } });

    if (!existing) {
      return NextResponse.json({ message: "Investment not found" }, { status: 404 });
    }

    if (existing.isClosed) {
      return NextResponse.json({ message: "This month is closed. You cannot edit old investment records." }, { status: 400 });
    }

    const data = validateInvestment(body);
    if (!data) {
      return NextResponse.json({ message: "Invalid investment data" }, { status: 400 });
    }

    const { month, year } = getMonthYearFromDate(data.dateTime);

    const closedThisMonth = await prisma.investment.findFirst({
      where: { userId: currentUser.id, month, year, isClosed: true },
    });

    if (closedThisMonth) {
      return NextResponse.json({ message: "This month is closed. You cannot update investment records here." }, { status: 400 });
    }

    const investment = await prisma.investment.update({
      where: { id: investmentId },
      data: {
        itemName: data.itemName,
        weight: data.weight,
        quantity: data.quantity,
        quantityPerPack: data.quantityPerPack,
        rate: data.rate,
        marketRate: data.marketRate,
        dateTime: data.dateTime,
        month,
        year,
      },
    });

    return NextResponse.json({
      id: investment.id,
      dateTime: investment.dateTime.toISOString(),
      itemName: investment.itemName,
      weight: Number(investment.weight),
      quantity: investment.quantity,
      quantityPerPack: investment.quantityPerPack,
      rate: Number(investment.rate),
      marketRate: Number(investment.marketRate),
      month: investment.month,
      year: investment.year,
      isClosed: investment.isClosed,
      closedAt: investment.closedAt ? investment.closedAt.toISOString() : null,
    });
  } catch (error) {
    console.error("UPDATE INVESTMENT ERROR:", error);
    return NextResponse.json({ message: "Failed to update investment" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const investmentId = Number(id);

    if (!Number.isInteger(investmentId)) {
      return NextResponse.json({ message: "Invalid investment ID" }, { status: 400 });
    }

    const existing = await prisma.investment.findFirst({ where: { id: investmentId, userId: currentUser.id } });
    if (!existing) {
      return NextResponse.json({ message: "Investment not found" }, { status: 404 });
    }

    if (existing.isClosed) {
      return NextResponse.json({ message: "This month is closed. You cannot delete old investment records." }, { status: 400 });
    }

    await prisma.investment.delete({ where: { id: investmentId } });
    return NextResponse.json({ message: "Investment deleted successfully" });
  } catch (error) {
    console.error("DELETE INVESTMENT ERROR:", error);
    return NextResponse.json({ message: "Failed to delete investment" }, { status: 500 });
  }
}