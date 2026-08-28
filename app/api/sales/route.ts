import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* =========================================================
   DATE HELPERS
========================================================= */

function monthStart(year: number, month: number) {
  return new Date(year, month - 1, 1, 0, 0, 0, 0);
}

function nextMonth(year: number, month: number) {
  return month === 12
    ? { year: year + 1, month: 1 }
    : { year, month: month + 1 };
}

function previousMonth(year: number, month: number) {
  return month === 1
    ? { year: year - 1, month: 12 }
    : { year, month: month - 1 };
}

/* =========================================================
   DATE RANGE FOR ONE DAY
========================================================= */

function dayStart(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
    0
  );
}

function nextDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + 1,
    0,
    0,
    0,
    0
  );
}

/* =========================================================
   MONTH VENDOR EXPENSE
========================================================= */

async function getVendorExpense(
  year: number,
  month: number
) {
  const start = monthStart(year, month);

  const next = nextMonth(year, month);

  const end = monthStart(
    next.year,
    next.month
  );

  const result =
    await prisma.vendorBill.aggregate({
      _sum: {
        billAmount: true,
      },

      where: {
        dateTime: {
          gte: start,
          lt: end,
        },
      },
    });

  return Number(
    result._sum.billAmount ?? 0
  );
}

/* =========================================================
   VENDOR EXPENSE FOR ONE DATE
========================================================= */

async function getVendorExpenseForDate(
  date: Date
) {
  const start = dayStart(date);
  const end = nextDay(date);

  const result =
    await prisma.vendorBill.aggregate({
      _sum: {
        billAmount: true,
      },

      where: {
        dateTime: {
          gte: start,
          lt: end,
        },
      },
    });

  return Number(
    result._sum.billAmount ?? 0
  );
}

/* =========================================================
   CALCULATE MONTH CLOSING
========================================================= */

async function calculateMonthClosing(
  salesMonthId: number
) {
  const salesMonth =
    await prisma.salesMonth.findUnique({
      where: {
        id: salesMonthId,
      },
    });

  if (!salesMonth) {
    throw new Error(
      "Sales month not found."
    );
  }

  const sales =
    await prisma.sale.aggregate({
      _sum: {
        saleAmount: true,
      },

      where: {
        salesMonthId,
      },
    });

  const vendorExpense =
    await getVendorExpense(
      salesMonth.year,
      salesMonth.month
    );

  const opening =
    Number(
      salesMonth.openingBalance
    );

  const totalSales =
    Number(
      sales._sum.saleAmount ?? 0
    );

  const closing =
    opening +
    totalSales -
    vendorExpense;

  return {
    opening,
    totalSales,
    vendorExpense,
    closing,
  };
}

/* =========================================================
   GET OR CREATE ACTIVE MONTH
========================================================= */

async function getOrCreateActiveMonth() {
  const existing =
    await prisma.salesMonth.findFirst({
      where: {
        isClosed: false,
      },

      orderBy: [
        {
          year: "desc",
        },
        {
          month: "desc",
        },
      ],
    });

  if (existing) {
    return existing;
  }

  const now = new Date();

  const year =
    now.getFullYear();

  const month =
    now.getMonth() + 1;

  const previous =
    previousMonth(
      year,
      month
    );

  const previousRecord =
    await prisma.salesMonth.findUnique({
      where: {
        year_month: {
          year: previous.year,
          month: previous.month,
        },
      },
    });

  return prisma.salesMonth.upsert({
    where: {
      year_month: {
        year,
        month,
      },
    },

    update: {},

    create: {
      year,
      month,

      openingBalance:
        Number(
          previousRecord?.closingBalance ?? 0
        ),

      closingBalance: null,

      isClosed: false,
    },
  });
}

/* =========================================================
   NORMALIZE AMOUNT
========================================================= */

function normalizeAmount(
  value: unknown
) {
  const n =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(n)
    ? n
    : NaN;
}

/* =========================================================
   NORMALIZE ONLINE ACCOUNT
========================================================= */

function normalizeOnlineAccount(
  value: unknown
) {
  if (
    value === "EasyPaisa" ||
    value === "EASYPAISA"
  ) {
    return "EASYPAISA" as const;
  }

  if (
    value === "Bank Islami" ||
    value === "BANK_ISLAMI"
  ) {
    return "BANK_ISLAMI" as const;
  }

  return null;
}

/* =========================================================
   GET SALES
========================================================= */

export async function GET() {
  try {
    const activeMonth =
      await getOrCreateActiveMonth();

    const sales =
      await prisma.sale.findMany({
        where: {
          salesMonthId:
            activeMonth.id,
        },

        orderBy: [
          {
            date: "asc",
          },
          {
            id: "asc",
          },
        ],
      });

    /*
     * IMPORTANT:
     *
     * Every sale gets its own expense
     * from VendorBill of the SAME DATE.
     *
     * We do NOT use monthly expense
     * for individual sale rows.
     */

    const salesWithDateExpense =
      await Promise.all(
        sales.map(async (sale) => {
          const saleDate =
            new Date(sale.date);

          const dateExpense =
            await getVendorExpenseForDate(
              saleDate
            );

          return {
            id: sale.id,

            salesMonthId:
              activeMonth.id,

            date:
              sale.date
                .toISOString()
                .split("T")[0],

            openingAmount:
              Number(
                sale.openingAmount
              ),

            /*
             * ALWAYS use VendorBill
             * for this sale's date.
             */
            expense:
              dateExpense,

            cashAmount:
              Number(
                sale.cashAmount
              ),

            onlineAmount:
              Number(
                sale.onlineAmount
              ),

            saleAmount:
              Number(
                sale.saleAmount
              ),

            onlineAccount:
              sale.onlineAccount ===
              "EASYPAISA"
                ? "EasyPaisa"
                : sale.onlineAccount ===
                  "BANK_ISLAMI"
                ? "Bank Islami"
                : "",
          };
        })
      );

    /*
     * Monthly vendor expense.
     *
     * This is only for:
     * - summary card
     * - month closing
     */
    const vendorExpense =
      await getVendorExpense(
        activeMonth.year,
        activeMonth.month
      );

    const totalSales =
      sales.reduce(
        (total, sale) =>
          total +
          Number(
            sale.saleAmount
          ),
        0
      );

    const currentBalance =
      Number(
        activeMonth.openingBalance
      ) +
      totalSales -
      vendorExpense;

    const history =
      await prisma.salesMonth.findMany({
        orderBy: [
          {
            year: "desc",
          },
          {
            month: "desc",
          },
        ],

        include: {
          _count: {
            select: {
              sales: true,
            },
          },
        },
      });

    return NextResponse.json({
      success: true,

      activeMonth: {
        id: activeMonth.id,

        month:
          activeMonth.month,

        year:
          activeMonth.year,

        openingBalance:
          Number(
            activeMonth.openingBalance
          ),

        closingBalance:
          activeMonth.closingBalance ===
          null
            ? null
            : Number(
                activeMonth.closingBalance
              ),

        isClosed:
          activeMonth.isClosed,

        closedAt:
          activeMonth.closedAt,
      },

      sales:
        salesWithDateExpense,

      /*
       * This is MONTH expense.
       */
      vendorExpense,

      totalSales,

      currentBalance,

      history:
        history.map(
          (item) => ({
            id: item.id,

            month:
              item.month,

            year:
              item.year,

            openingBalance:
              Number(
                item.openingBalance
              ),

            closingBalance:
              item.closingBalance ===
              null
                ? null
                : Number(
                    item.closingBalance
                  ),

            isClosed:
              item.isClosed,

            closedAt:
              item.closedAt,

            salesCount:
              item._count.sales,
          })
        ),
    });
  } catch (error) {
    console.error(
      "GET /api/sales error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load sales.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   POST SALE / CLOSE MONTH
========================================================= */

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    /* =====================================================
       CLOSE MONTH
    ===================================================== */

    if (
      body.action ===
      "close-month"
    ) {
      const activeMonth =
        await getOrCreateActiveMonth();

      if (
        activeMonth.isClosed
      ) {
        return NextResponse.json(
          {
            error:
              "This month is already closed.",
          },
          {
            status: 400,
          }
        );
      }

      const result =
        await calculateMonthClosing(
          activeMonth.id
        );

      const closedMonth =
        await prisma.salesMonth.update({
          where: {
            id: activeMonth.id,
          },

          data: {
            closingBalance:
              result.closing,

            isClosed: true,

            closedAt:
              new Date(),
          },
        });

      const next =
        nextMonth(
          activeMonth.year,
          activeMonth.month
        );

      const newMonth =
        await prisma.salesMonth.upsert({
          where: {
            year_month: {
              year: next.year,
              month: next.month,
            },
          },

          update: {
            openingBalance:
              result.closing,

            isClosed: false,

            closingBalance:
              null,
          },

          create: {
            year: next.year,
            month: next.month,

            openingBalance:
              result.closing,

            closingBalance:
              null,

            isClosed: false,
          },
        });

      return NextResponse.json({
        success: true,

        closedMonth: {
          id: closedMonth.id,

          month:
            closedMonth.month,

          year:
            closedMonth.year,

          openingBalance:
            Number(
              closedMonth.openingBalance
            ),

          closingBalance:
            Number(
              closedMonth.closingBalance
            ),

          closedAt:
            closedMonth.closedAt,
        },

        newMonth: {
          id: newMonth.id,

          month:
            newMonth.month,

          year:
            newMonth.year,

          openingBalance:
            Number(
              newMonth.openingBalance
            ),

          isClosed:
            newMonth.isClosed,
        },
      });
    }

    /* =====================================================
       CREATE SALE
    ===================================================== */

    const {
      date,
      openingAmount:
        rawOpening,
      cashAmount:
        rawCash,
      onlineAmount:
        rawOnline,
      onlineAccount,
    } = body;

    if (!date) {
      return NextResponse.json(
        {
          error:
            "Date is required.",
        },
        {
          status: 400,
        }
      );
    }

    const openingAmount =
      normalizeAmount(
        rawOpening
      );

    const cashAmount =
      rawCash === "" ||
      rawCash === null ||
      rawCash === undefined
        ? 0
        : normalizeAmount(
            rawCash
          );

    const onlineAmount =
      rawOnline === "" ||
      rawOnline === null ||
      rawOnline === undefined
        ? 0
        : normalizeAmount(
            rawOnline
          );

    const saleAmount =
      cashAmount +
      onlineAmount;

    if (
      !Number.isFinite(
        openingAmount
      ) ||
      openingAmount < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Opening amount must be a valid number.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isFinite(
        cashAmount
      ) ||
      cashAmount < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Cash amount must be a valid number.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isFinite(
        onlineAmount
      ) ||
      onlineAmount < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Online amount must be a valid number.",
        },
        {
          status: 400,
        }
      );
    }

    if (saleAmount <= 0) {
      return NextResponse.json(
        {
          error:
            "Cash + Online amount must be greater than zero.",
        },
        {
          status: 400,
        }
      );
    }

    const dbOnlineAccount =
      normalizeOnlineAccount(
        onlineAccount
      );

    if (
      onlineAmount > 0 &&
      !dbOnlineAccount
    ) {
      return NextResponse.json(
        {
          error:
            "Please select EasyPaisa or Bank Islami for online payment.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      onlineAmount === 0 &&
      onlineAccount
    ) {
      return NextResponse.json(
        {
          error:
            "Online account can only be selected when online amount is greater than zero.",
        },
        {
          status: 400,
        }
      );
    }

    const activeMonth =
      await getOrCreateActiveMonth();

    if (
      activeMonth.isClosed
    ) {
      return NextResponse.json(
        {
          error:
            "This month is closed.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * First sale decides the month's
     * opening balance.
     */
    const existingSales =
      await prisma.sale.count({
        where: {
          salesMonthId:
            activeMonth.id,
        },
      });

    if (existingSales === 0) {
      await prisma.salesMonth.update({
        where: {
          id: activeMonth.id,
        },

        data: {
          openingBalance:
            openingAmount,
        },
      });
    }

    const saleDate =
      new Date(
        `${date}T00:00:00`
      );

    /*
     * IMPORTANT:
     *
     * Expense is taken ONLY from
     * VendorBill records having the
     * SAME DATE as this sale.
     */
    const dateExpense =
      await getVendorExpenseForDate(
        saleDate
      );

    const sale =
      await prisma.sale.create({
        data: {
          salesMonthId:
            activeMonth.id,

          date:
            saleDate,

          openingAmount:
            openingAmount,

          /*
           * THIS IS NOW THE EXPENSE
           * FOR THIS SPECIFIC DATE.
           */
          expense:
            dateExpense,

          cashAmount:
            cashAmount,

          onlineAmount:
            onlineAmount,

          saleAmount:
            saleAmount,

          paymentMethod:
            onlineAmount > 0 &&
            cashAmount === 0
              ? "ONLINE"
              : "CASH",

          onlineAccount:
            dbOnlineAccount,
        },
      });

    /*
     * Recalculate current month
     * closing balance after adding sale.
     */
    const closing =
      await calculateMonthClosing(
        activeMonth.id
      );

    await prisma.salesMonth.update({
      where: {
        id: activeMonth.id,
      },

      data: {
        closingBalance:
          closing.closing,
      },
    });

    return NextResponse.json(
      {
        success: true,

        sale: {
          id: sale.id,

          salesMonthId:
            sale.salesMonthId,

          date:
            sale.date
              .toISOString()
              .split("T")[0],

          openingAmount:
            Number(
              sale.openingAmount
            ),

          expense:
            dateExpense,

          cashAmount:
            Number(
              sale.cashAmount
            ),

          onlineAmount:
            Number(
              sale.onlineAmount
            ),

          saleAmount:
            Number(
              sale.saleAmount
            ),

          onlineAccount:
            sale.onlineAccount ===
            "EASYPAISA"
              ? "EasyPaisa"
              : sale.onlineAccount ===
                "BANK_ISLAMI"
              ? "Bank Islami"
              : "",
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/sales error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save sale.",
      },
      {
        status: 500,
      }
    );
  }
}

