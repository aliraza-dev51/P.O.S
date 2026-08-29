import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

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

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type") as "DAILY" | "MONTHLY" | null;

    const customers = await prisma.creditCustomer.findMany({
      where: type ? { creditType: type } : undefined,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      customers.map((customer) => ({
        id: customer.id,
        personName: customer.personName,
        creditType: customer.creditType ?? "DAILY",
        creditDate: customer.creditDate.toISOString(),
        month: customer.month ?? getMonthYear(customer.creditDate).month,
        year: customer.year ?? getMonthYear(customer.creditDate).year,
        isClosed: customer.isClosed ?? false,
        closedAt: customer.closedAt ? customer.closedAt.toISOString() : null,
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

    if (body?.action === "close-month") {
      const month = Number(body.month ?? new Date().getMonth() + 1);
      const year = Number(body.year ?? new Date().getFullYear());
      const creditType = body.creditType ? normalizeCreditType(body.creditType) : null;

      if (!Number.isFinite(month) || month < 1 || month > 12) {
        return NextResponse.json({ error: "Invalid month." }, { status: 400 });
      }

      if (!Number.isFinite(year)) {
        return NextResponse.json({ error: "Invalid year." }, { status: 400 });
      }

      await prisma.creditCustomer.updateMany({
        where: {
          month,
          year,
          ...(creditType ? { creditType } : {}),
        },
        data: {
          isClosed: true,
          closedAt: new Date(),
        },
      });

      return NextResponse.json({ success: true });
    }

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

    // For MONTHLY: find open record in current month/year
    // For DAILY: find latest record (ignore month/year closing)
    let existing;
    if (creditType === "MONTHLY") {
      existing = await prisma.creditCustomer.findFirst({
        where: {
          personName: { equals: personName, mode: "insensitive" },
          creditType,
          month,
          year,
          isClosed: false,
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      existing = await prisma.creditCustomer.findFirst({
        where: {
          personName: { equals: personName, mode: "insensitive" },
          creditType,
        },
        orderBy: { createdAt: "desc" },
      });
    }

    if (existing) {
      // CORRECT: Calculate the existing balance WITHOUT Math.max (allows negative)
      const existingBalance = 
        toNumber(existing.previousBalance) + 
        toNumber(existing.currentAmount) - 
        toNumber(existing.paidAmount);

      // Create NEW record with:
      // - previousBalance = old balance (can be positive or negative)
      // - currentAmount = NEW transaction amount (user entered)
      // - paidAmount = NEW transaction payment (user entered)

      const updated = await prisma.creditCustomer.update({
        where: { id: existing.id },
        data: {
          personName,
          creditType,
          creditDate,
          month,
          year,
          isClosed: false,
          closedAt: null,
          previousBalance: existingBalance,  // Set the accumulated balance
          currentAmount,                       // NEW transaction (user entered, unchanged)
          paidAmount,                          // NEW payment (user entered, unchanged)
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
      }, { status: 200 });
    }

    // NEW CUSTOMER: Create with previousBalance = 0
    const customer = await prisma.creditCustomer.create({
      data: {
        personName,
        creditType,
        creditDate,
        month,
        year,
        isClosed: false,
        previousBalance: 0,
        currentAmount,
        paidAmount,
      },
    });

    return NextResponse.json({
      id: customer.id,
      personName: customer.personName,
      creditType: customer.creditType ?? "DAILY",
      creditDate: customer.creditDate.toISOString(),
      month: customer.month ?? month,
      year: customer.year ?? year,
      isClosed: customer.isClosed ?? false,
      closedAt: customer.closedAt ? customer.closedAt.toISOString() : null,
      previousBalance: toNumber(customer.previousBalance),
      currentAmount: toNumber(customer.currentAmount),
      paidAmount: toNumber(customer.paidAmount),
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/credits", error);
    return NextResponse.json({ error: "Failed to save credit record." }, { status: 500 });
  }
}
