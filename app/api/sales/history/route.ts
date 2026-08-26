import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function monthName(month: number): string {
  const names: string[] = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return names[month - 1] ?? "Unknown";
}

export async function GET() {
  try {
    const months = await prisma.salesMonth.findMany({
      orderBy: [
        {
          year: "desc",
        },
        {
          month: "desc",
        },
      ],
    });

    const result = await Promise.all(
      months.map(async (month) => {
        const sales = await prisma.sale.findMany({
          where: {
            salesMonthId: month.id,
          },
          orderBy: {
            date: "asc",
          },
        });

        const totalSales: number = sales.reduce(
          (total: number, sale) => {
            return total + Number(sale.saleAmount);
          },
          0
        );

        const totalExpense: number = sales.reduce(
          (total: number, sale) => {
            return total + Number(sale.expense);
          },
          0
        );

        const openingBalance: number = Number(
          month.openingBalance
        );

        const closingBalance: number =
          month.closingBalance !== null
            ? Number(month.closingBalance)
            : openingBalance +
              totalSales -
              totalExpense;

        return {
          id: month.id,

          month: month.month,

          monthName: monthName(month.month),

          year: month.year,

          openingBalance,

          closingBalance,

          isClosed: month.isClosed,

          closedAt: month.closedAt,

          salesCount: sales.length,

          totalSales,

          totalExpense,
        };
      })
    );

    return NextResponse.json({
      success: true,
      history: result,
    });
  } catch (error) {
    console.error(
      "GET /api/sales/history error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load sales history.",
      },
      {
        status: 500,
      }
    );
  }
}