import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

const toNumber = (value: unknown) => Number(value ?? 0);

export async function GET() {
  try {
    const customers = await prisma.creditCustomer.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      customers.map((customer) => ({
        id: customer.id,
        personName: customer.personName,
        previousBalance: toNumber(customer.previousBalance),
        currentAmount: toNumber(customer.currentAmount),
        paidAmount: toNumber(customer.paidAmount),
      }))
    );
  } catch (error) {
    console.error("GET /api/credits", error);
    return NextResponse.json({ error: "Failed to load credit records." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const personName = String(body.personName ?? "").trim();
    const currentAmount = Number(body.currentAmount ?? 0);
    const paidAmount = Number(body.paidAmount ?? 0);

    if (!personName) return NextResponse.json({ error: "Please enter person name." }, { status: 400 });
    if (!Number.isFinite(currentAmount) || currentAmount < 0) return NextResponse.json({ error: "Current amount cannot be negative." }, { status: 400 });
    if (!Number.isFinite(paidAmount) || paidAmount < 0) return NextResponse.json({ error: "Paid amount cannot be negative." }, { status: 400 });

    const existing = await prisma.creditCustomer.findFirst({
      where: { personName: { equals: personName, mode: "insensitive" } },
    });

    if (existing) {
      const previousBalance = toNumber(existing.previousBalance);
      const existingCurrent = toNumber(existing.currentAmount);
      const existingPaid = toNumber(existing.paidAmount);
      const existingBalance = Math.max(previousBalance + existingCurrent - existingPaid, 0);
      const newTotal = existingBalance + currentAmount;
      const newPaid = existingPaid + paidAmount;

      if (newPaid > newTotal) {
        return NextResponse.json({ error: "Paid amount cannot be greater than total balance." }, { status: 400 });
      }

      const updated = await prisma.creditCustomer.update({
        where: { id: existing.id },
        data: {
          personName,
          previousBalance: existingBalance,
          currentAmount,
          paidAmount: newPaid,
        },
      });

      return NextResponse.json({
        id: updated.id,
        personName: updated.personName,
        previousBalance: toNumber(updated.previousBalance),
        currentAmount: toNumber(updated.currentAmount),
        paidAmount: toNumber(updated.paidAmount),
      }, { status: 200 });
    }

    if (paidAmount > currentAmount) {
      return NextResponse.json({ error: "Paid amount cannot be greater than current amount." }, { status: 400 });
    }

    const customer = await prisma.creditCustomer.create({
      data: { personName, previousBalance: 0, currentAmount, paidAmount },
    });

    return NextResponse.json({
      id: customer.id,
      personName: customer.personName,
      previousBalance: toNumber(customer.previousBalance),
      currentAmount: toNumber(customer.currentAmount),
      paidAmount: toNumber(customer.paidAmount),
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/credits", error);
    return NextResponse.json({ error: "Failed to save credit record." }, { status: 500 });
  }
}
