import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

const toNumber = (value: unknown) => Number(value ?? 0);

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (!Number.isInteger(id)) return NextResponse.json({ error: "Invalid credit ID." }, { status: 400 });

    const body = await request.json();
    const personName = String(body.personName ?? "").trim();
    const currentAmount = Number(body.currentAmount ?? 0);
    const paidAmount = Number(body.paidAmount ?? 0);

    if (!personName) return NextResponse.json({ error: "Please enter person name." }, { status: 400 });
    if (!Number.isFinite(currentAmount) || currentAmount < 0) return NextResponse.json({ error: "Current amount cannot be negative." }, { status: 400 });
    if (!Number.isFinite(paidAmount) || paidAmount < 0) return NextResponse.json({ error: "Paid amount cannot be negative." }, { status: 400 });

    const existing = await prisma.creditCustomer.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Credit record not found." }, { status: 404 });

    const total = toNumber(existing.previousBalance) + currentAmount;
    if (paidAmount > total) {
      return NextResponse.json({ error: "Paid amount cannot be greater than total balance." }, { status: 400 });
    }

    const updated = await prisma.creditCustomer.update({
      where: { id },
      data: { personName, currentAmount, paidAmount },
    });

    return NextResponse.json({
      id: updated.id,
      personName: updated.personName,
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
