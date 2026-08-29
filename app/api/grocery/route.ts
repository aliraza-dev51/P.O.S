import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Utility functions
const toNumber = (value: unknown) => Number(value ?? 0);

const getCurrentMonthYear = () => {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
};

// ============================================================
// GET: Fetch grocery items
// Params:
//   - ?month=X&year=Y (specific month) - defaults to current month
//   - ?closed=true (get closed months history)
//   - ?search=TERM (search by item name)
// ============================================================
export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = currentUser.id;
    const url = new URL(request.url);
    const month = url.searchParams.get("month");
    const year = url.searchParams.get("year");
    const closed = url.searchParams.get("closed");
    const search = url.searchParams.get("search");

    // If closed=true, return all closed months (history)
    if (closed === "true") {
      const closedMonths = await prisma.groceryItem.groupBy({
        by: ["month", "year"],
        where: { userId, isClosed: true },
        orderBy: [{ year: "desc" }, { month: "desc" }],
      });

      const history = await Promise.all(
        closedMonths.map(async (monthYear) => {
          const items = await prisma.groceryItem.findMany({
            where: {
              userId,
              month: monthYear.month,
              year: monthYear.year,
              isClosed: true,
            },
            orderBy: { createdAt: "desc" },
          });

          // Calculate totals
          let totalWeight = 0;
          let totalSales = 0;
          let totalCost = 0;

          items.forEach((item) => {
            totalWeight += toNumber(item.weight) * item.quantity;
            totalSales += toNumber(item.sellingPrice) * toNumber(item.weight) * item.quantity;
            totalCost += (toNumber(item.rate) + toNumber(item.transportation)) * item.quantity;
          });

          const closedAt = items[0]?.closedAt ?? null;

          return {
            month: monthYear.month,
            year: monthYear.year,
            isClosed: true,
            closedAt: closedAt ? closedAt.toISOString() : null,
            items: items.map((item) => ({
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
            })),
            totalItems: items.length,
            totalWeight,
            totalSales,
            totalProfit: totalSales - totalCost,
          };
        })
      );

      return NextResponse.json(history);
    }

    // Get specific month or current month
    const { month: currentMonth, year: currentYear } = getCurrentMonthYear();
    const targetMonth = month ? Number(month) : currentMonth;
    const targetYear = year ? Number(year) : currentYear;

    // Fetch items for the month
    let whereClause: any = {
      userId,
      month: targetMonth,
      year: targetYear,
      isClosed: false,
    };

    // Apply search filter if provided
    if (search) {
      whereClause.itemName = {
        contains: search,
        mode: "insensitive",
      };
    }

    const items = await prisma.groceryItem.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    // Calculate totals
    let totalWeight = 0;
    let totalSales = 0;
    let totalCost = 0;

    items.forEach((item) => {
      totalWeight += toNumber(item.weight) * item.quantity;
      totalSales += toNumber(item.sellingPrice) * toNumber(item.weight) * item.quantity;
      totalCost += (toNumber(item.rate) + toNumber(item.transportation)) * item.quantity;
    });

    // Check if this month exists as closed
    const existingClosed = await prisma.groceryItem.findFirst({
      where: {
        userId,
        month: targetMonth,
        year: targetYear,
        isClosed: true,
      },
    });

    const isClosed = existingClosed !== null;
    const closedAt = existingClosed?.closedAt ?? null;

    // If month doesn't exist at all, create it
    if (items.length === 0 && !isClosed) {
      // Initialize current month (no items yet, just return empty)
    }

    // Return formatted items with month metadata
    return NextResponse.json({
      month: targetMonth,
      year: targetYear,
      isClosed,
      closedAt: closedAt ? closedAt.toISOString() : null,
      items: items.map((item) => ({
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
      })),
      totalItems: items.length,
      totalWeight,
      totalSales,
      totalProfit: totalSales - totalCost,
    });
  } catch (error) {
    console.error("GET /api/grocery error:", error);
    return NextResponse.json({ error: "Failed to load grocery items" }, { status: 500 });
  }
}

// ============================================================
// POST: Create grocery item or close month
// For close-month action: { action: "close-month", month: X, year: Y }
// For create: { itemName, weight, quantity, rate, transportation, sellingPrice }
// ============================================================
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = currentUser.id;
    const body = await request.json();

    // Handle close-month action
    if (body?.action === "close-month") {
      const month = Number(body.month ?? 0);
      const year = Number(body.year ?? 0);

      if (!Number.isFinite(month) || month < 1 || month > 12) {
        return NextResponse.json({ error: "Invalid month." }, { status: 400 });
      }

      if (!Number.isFinite(year)) {
        return NextResponse.json({ error: "Invalid year." }, { status: 400 });
      }

      // Check if month is already closed
      const alreadyClosed = await prisma.groceryItem.findFirst({
        where: {
          userId,
          month,
          year,
          isClosed: true,
        },
      });

      if (alreadyClosed) {
        return NextResponse.json({ error: "This month is already closed." }, { status: 400 });
      }

      // Close all items in this month
      await prisma.groceryItem.updateMany({
        where: {
          userId,
          month,
          year,
          isClosed: false,
        },
        data: {
          isClosed: true,
          closedAt: new Date(),
        },
      });

      return NextResponse.json({ success: true });
    }

    // Handle create grocery item
    const itemName = String(body.itemName ?? "").trim();
    const weight = Number(body.weight);
    const quantity = Number(body.quantity);
    const rate = Number(body.rate);
    const transportation = Number(body.transportation);
    const sellingPrice = Number(body.sellingPrice);

    if (
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
      return NextResponse.json(
        { error: "Please fill all fields correctly." },
        { status: 400 }
      );
    }

    // Get current month/year
    const { month, year } = getCurrentMonthYear();

    // Check if current month is closed
    const monthClosed = await prisma.groceryItem.findFirst({
      where: {
        userId,
        month,
        year,
        isClosed: true,
      },
    });

    if (monthClosed) {
      return NextResponse.json(
        { error: "Cannot add items to a closed month. Please close month first." },
        { status: 400 }
      );
    }

    // Create item for current month
    const item = await prisma.groceryItem.create({
      data: {
        userId,
        itemName,
        weight,
        quantity,
        rate,
        transportation,
        sellingPrice,
        month,
        year,
        isClosed: false,
      },
    });

    return NextResponse.json(
      {
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
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/grocery error:", error);
    return NextResponse.json({ error: "Failed to create grocery item" }, { status: 500 });
  }
}

