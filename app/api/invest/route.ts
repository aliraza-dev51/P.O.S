import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const toNumber = (value: unknown) => Number(value ?? 0);

const getMonthYearFromDate = (dateValue?: string | Date) => {
  const date = new Date(dateValue ?? Date.now());
  return { month: date.getMonth() + 1, year: date.getFullYear() };
};

function serializeInvestment(investment: {
  id: number;
  dateTime: Date;
  itemName: string;
  weight: unknown;
  quantity: number;
  quantityPerPack: number;
  rate: unknown;
  marketRate: unknown;
  month: number;
  year: number;
  isClosed: boolean;
  closedAt: Date | null;
}) {
  return {
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
  };
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

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = currentUser.id;
    const url = new URL(request.url);
    const closed = url.searchParams.get("closed");
    const month = url.searchParams.get("month");
    const year = url.searchParams.get("year");
    const search = url.searchParams.get("search");

    if (closed === "true") {
      const closedMonths = await prisma.investment.groupBy({
        by: ["month", "year"],
        where: { userId, isClosed: true },
        orderBy: [{ year: "desc" }, { month: "desc" }],
      });

      const history = await Promise.all(
        closedMonths.map(async (monthYear) => {
          const items = await prisma.investment.findMany({
            where: { userId, month: monthYear.month, year: monthYear.year, isClosed: true },
            orderBy: { dateTime: "desc" },
          });

          let totalInvestment = 0;
          let totalMarketValue = 0;
          let totalProfit = 0;

          items.forEach((item) => {
            const investmentValue = toNumber(item.rate) * item.quantity;
            const marketValue = toNumber(item.marketRate) * item.quantity;
            const profit = (toNumber(item.marketRate) - toNumber(item.rate)) * item.quantity;
            totalInvestment += investmentValue;
            totalMarketValue += marketValue;
            totalProfit += profit;
          });

          return {
            month: monthYear.month,
            year: monthYear.year,
            isClosed: true,
            closedAt: items[0]?.closedAt ? items[0].closedAt.toISOString() : null,
            items: items.map(serializeInvestment),
            totalItems: items.length,
            totalInvestment,
            totalMarketValue,
            totalProfit,
          };
        })
      );

      return NextResponse.json(history);
    }

    const { month: currentMonth, year: currentYear } = getMonthYearFromDate();
    const targetMonth = month ? Number(month) : currentMonth;
    const targetYear = year ? Number(year) : currentYear;

    const whereClause: any = {
      userId,
      month: targetMonth,
      year: targetYear,
      isClosed: false,
    };

    if (search && search.trim()) {
      whereClause.itemName = { contains: search.trim(), mode: "insensitive" };
    }

    const items = await prisma.investment.findMany({
      where: whereClause,
      orderBy: { dateTime: "desc" },
    });

    const existingClosed = await prisma.investment.findFirst({
      where: { userId, month: targetMonth, year: targetYear, isClosed: true },
    });

    let totalInvestment = 0;
    let totalMarketValue = 0;
    let totalProfit = 0;

    items.forEach((item) => {
      totalInvestment += toNumber(item.rate) * item.quantity;
      totalMarketValue += toNumber(item.marketRate) * item.quantity;
      totalProfit += (toNumber(item.marketRate) - toNumber(item.rate)) * item.quantity;
    });

    return NextResponse.json({
      month: targetMonth,
      year: targetYear,
      isClosed: existingClosed !== null,
      closedAt: existingClosed?.closedAt ? existingClosed.closedAt.toISOString() : null,
      items: items.map(serializeInvestment),
      totalItems: items.length,
      totalInvestment,
      totalMarketValue,
      totalProfit,
    });
  } catch (error) {
    console.error("GET INVESTMENTS ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch investments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = currentUser.id;
    const body = await request.json();

    if (body?.action === "close-month") {
      const month = Number(body.month ?? 0);
      const year = Number(body.year ?? 0);

      if (!Number.isFinite(month) || month < 1 || month > 12) {
        return NextResponse.json({ error: "Invalid month." }, { status: 400 });
      }

      if (!Number.isFinite(year)) {
        return NextResponse.json({ error: "Invalid year." }, { status: 400 });
      }

      const alreadyClosed = await prisma.investment.findFirst({
        where: { userId, month, year, isClosed: true },
      });

      if (alreadyClosed) {
        return NextResponse.json({ error: "This month is already closed." }, { status: 400 });
      }

      await prisma.investment.updateMany({
        where: { userId, month, year, isClosed: false },
        data: { isClosed: true, closedAt: new Date() },
      });

      return NextResponse.json({ message: "Month closed successfully", month, year, isClosed: true });
    }

    const data = validateInvestment(body);
    if (!data) {
      return NextResponse.json({ error: "Invalid investment data" }, { status: 400 });
    }

    const { month, year } = getMonthYearFromDate(data.dateTime);
    const alreadyClosed = await prisma.investment.findFirst({
      where: { userId, month, year, isClosed: true },
    });

    if (alreadyClosed) {
      return NextResponse.json({ error: "This month is closed. You cannot add new investments here." }, { status: 400 });
    }

    const investment = await prisma.investment.create({
      data: {
        userId,
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

    return NextResponse.json(serializeInvestment(investment), { status: 201 });
  } catch (error) {
    console.error("POST INVESTMENT ERROR:", error);
    return NextResponse.json({ error: "Failed to create investment" }, { status: 500 });
  }
}
