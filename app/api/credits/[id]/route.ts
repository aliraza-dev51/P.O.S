import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

const toNumber = (value: unknown) => Number(value ?? 0);
const normalizeCreditType = (value: unknown) => {
  return value === "MONTHLY" ? "MONTHLY" : "DAILY";
};
const getMonthYear = (dateValue: string | Date) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear() };
  }

  return { month: date.getMonth() + 1, year: date.getFullYear() };
};

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (!Number.isInteger(id)) return NextResponse.json({ error: "Invalid credit ID." }, { status: 400 });

    const body = await request.json();
    const personName = String(body.personName ?? "").trim();
    const currentAmount = Number(body.currentAmount ?? 0);
    const paidAmount = Number(body.paidAmount ?? 0);
    const creditType = normalizeCreditType(body.creditType);
    const creditDate = body.creditDate ? new Date(body.creditDate) : new Date();
    const { month, year } = getMonthYear(creditDate);

    if (!personName) return NextResponse.json({ error: "Please enter person name." }, { status: 400 });
    if (!Number.isFinite(currentAmount) || currentAmount < 0) return NextResponse.json({ error: "Current amount cannot be negative." }, { status: 400 });
    if (!Number.isFinite(paidAmount) || paidAmount < 0) return NextResponse.json({ error: "Paid amount cannot be negative." }, { status: 400 });
    if (Number.isNaN(creditDate.getTime())) return NextResponse.json({ error: "Invalid credit date." }, { status: 400 });

    const existing = await prisma.creditCustomer.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Credit record not found." }, { status: 404 });

    // Overpayment is allowed - extra becomes advance
    // No validation needed against total balance

    const updated = await prisma.creditCustomer.update({
      where: { id },
      data: {
        personName,
        creditType,
        creditDate,
        month,
        year,
        isClosed: false,
        closedAt: null,
        currentAmount,
        paidAmount,
      },
    });

    return NextResponse.json({
      id: updated.id,
      personName: updated.personName,
      creditType: updated.creditType ?? "DAILY",
      creditDate: updated.creditDate.toISOString(),
      month: updated.month ?? month,
      year: updated.year ?? year,
      isClosed: updated.isClosed ?? false,
      closedAt: updated.closedAt ? updated.closedAt.toISOString() : null,
      previousBalance: toNumber(updated.previousBalance),
      currentAmount: toNumber(updated.currentAmount),
      paidAmount: toNumber(updated.paidAmount),
    });
  } catch (error) {
    console.error("PUT /api/credits/[id]", error);
    return NextResponse.json({ error: "Failed to update credit record." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (!Number.isInteger(id)) return NextResponse.json({ error: "Invalid credit ID." }, { status: 400 });

    await prisma.creditCustomer.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/credits/[id]", error);
    return NextResponse.json({ error: "Failed to delete credit record." }, { status: 500 });
  }
}
