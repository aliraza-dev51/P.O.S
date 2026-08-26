import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

/* =========================================================
   DATE HELPERS
========================================================= */

function monthStart(year: number, month: number) {
  return new Date(year, month - 1, 1, 0, 0, 0, 0);
}

function nextMonth(year: number, month: number) {
  if (month === 12) {
    return {
      year: year + 1,
      month: 1,
    };
  }

  return {
    year,
    month: month + 1,
  };
}

function previousMonth(year: number, month: number) {
  if (month === 1) {
    return {
      year: year - 1,
      month: 12,
    };
  }

  return {
    year,
    month: month - 1,
  };
}

/* =========================================================
   VENDOR EXPENSE
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
   GET OR CREATE ACTIVE MONTH
========================================================= */

async function getOrCreateActiveMonth() {
  /* -------------------------------------------------------
     Find latest open month
  ------------------------------------------------------- */

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

  /* -------------------------------------------------------
     Current calendar month
  ------------------------------------------------------- */

  const now = new Date();

  const year = now.getFullYear();

  const month =
    now.getMonth() + 1;

  /* -------------------------------------------------------
     Previous month
  ------------------------------------------------------- */

  const previous =
    previousMonth(year, month);

  const previousRecord =
    await prisma.salesMonth.findUnique({
      where: {
        year_month: {
          year: previous.year,
          month: previous.month,
        },
      },
    });

  const openingBalance = Number(
    previousRecord?.closingBalance ?? 0
  );

  /* -------------------------------------------------------
     Create current month
  ------------------------------------------------------- */

  const activeMonth =
    await prisma.salesMonth.upsert({
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
        openingBalance,
        isClosed: false,
      },
    });

  return activeMonth;
}

/* =========================================================
   GET
   Current month + previous months history
========================================================= */

export async function GET() {
  try {
    const activeMonth =
      await getOrCreateActiveMonth();

    /* -----------------------------------------------------
       Current month sales
    ----------------------------------------------------- */

    const sales =
      await prisma.sale.findMany({
        where: {
          salesMonthId: activeMonth.id,
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

    /* -----------------------------------------------------
       Vendor expense
    ----------------------------------------------------- */

    const vendorExpense =
      await getVendorExpense(
        activeMonth.year,
        activeMonth.month
      );

    /* -----------------------------------------------------
       Total sales
    ----------------------------------------------------- */

    const totalSales =
      sales.reduce(
        (total, sale) =>
          total +
          Number(sale.saleAmount),
        0
      );

    /* -----------------------------------------------------
       Current balance
    ----------------------------------------------------- */

    const currentBalance =
      Number(
        activeMonth.openingBalance
      ) +
      totalSales -
      vendorExpense;

    /* -----------------------------------------------------
       History
    ----------------------------------------------------- */

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

    /* -----------------------------------------------------
       Response
    ----------------------------------------------------- */

    return NextResponse.json({
      activeMonth: {
        id: activeMonth.id,

        month: activeMonth.month,

        year: activeMonth.year,

        openingBalance: Number(
          activeMonth.openingBalance
        ),

        closingBalance:
          activeMonth.closingBalance === null
            ? null
            : Number(
                activeMonth.closingBalance
              ),

        isClosed:
          activeMonth.isClosed,

        closedAt:
          activeMonth.closedAt,
      },

      /* ---------------------------------------------------
         SALES

         IMPORTANT:
         Do NOT use sale.salesMonthId here.
         Use activeMonth.id instead.
      --------------------------------------------------- */

      sales: sales.map((sale) => ({
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

        expense:
          Number(sale.expense),

        saleAmount:
          Number(
            sale.saleAmount
          ),

        paymentMethod:
          sale.paymentMethod === "CASH"
            ? "Cash"
            : "Online",

        onlineAccount:
          sale.onlineAccount ===
          "EASYPAISA"
            ? "EasyPaisa"
            : sale.onlineAccount ===
                "BANK_ISLAMI"
              ? "Bank Islami"
              : "",
      })),

      vendorExpense,

      totalSales,

      currentBalance,

      /* ---------------------------------------------------
         MONTH HISTORY
      --------------------------------------------------- */

      history: history.map(
        (item) => ({
          id: item.id,

          month: item.month,

          year: item.year,

          openingBalance:
            Number(
              item.openingBalance
            ),

          closingBalance:
            item.closingBalance === null
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
          "Unable to load sales.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   POST

   1. Add Sale
   2. Close Month
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

      /* ---------------------------------------------------
         Already closed
      --------------------------------------------------- */

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

      /* ---------------------------------------------------
         Get current month sales
      --------------------------------------------------- */

      const sales =
        await prisma.sale.findMany({
          where: {
            salesMonthId:
              activeMonth.id,
          },
        });

      const totalSales =
        sales.reduce(
          (total, sale) =>
            total +
            Number(
              sale.saleAmount
            ),
          0
        );

      /* ---------------------------------------------------
         Vendor expense
      --------------------------------------------------- */

      const vendorExpense =
        await getVendorExpense(
          activeMonth.year,
          activeMonth.month
        );

      /* ---------------------------------------------------
         Closing balance
      --------------------------------------------------- */

      const closingBalance =
        Number(
          activeMonth.openingBalance
        ) +
        totalSales -
        vendorExpense;

      /* ---------------------------------------------------
         Close current month
      --------------------------------------------------- */

      const closedMonth =
        await prisma.salesMonth.update({
          where: {
            id: activeMonth.id,
          },

          data: {
            closingBalance,

            isClosed: true,

            closedAt:
              new Date(),
          },
        });

      /* ---------------------------------------------------
         Create next month
      --------------------------------------------------- */

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
              closingBalance,

            isClosed: false,
          },

          create: {
            year: next.year,

            month: next.month,

            openingBalance:
              closingBalance,

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
       ADD SALE
    ===================================================== */

    const {
      date,
      openingAmount,
      saleAmount,
      paymentMethod,
      onlineAccount,
    } = body;

    /* -----------------------------------------------------
       Validate date
    ----------------------------------------------------- */

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

    /* -----------------------------------------------------
       Validate opening
    ----------------------------------------------------- */

    if (
      typeof openingAmount !==
        "number" ||
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

    /* -----------------------------------------------------
       Validate sale
    ----------------------------------------------------- */

    if (
      typeof saleAmount !==
        "number" ||
      !Number.isFinite(
        saleAmount
      ) ||
      saleAmount <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Sale amount must be greater than zero.",
        },
        {
          status: 400,
        }
      );
    }

    /* -----------------------------------------------------
       Validate payment
    ----------------------------------------------------- */

    if (
      paymentMethod !==
        "Cash" &&
      paymentMethod !==
        "Online"
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid payment method.",
        },
        {
          status: 400,
        }
      );
    }

    /* -----------------------------------------------------
       Validate online account
    ----------------------------------------------------- */

    if (
      paymentMethod ===
        "Online" &&
      onlineAccount !==
        "EasyPaisa" &&
      onlineAccount !==
        "Bank Islami"
    ) {
      return NextResponse.json(
        {
          error:
            "Please select EasyPaisa or Bank Islami.",
        },
        {
          status: 400,
        }
      );
    }

    /* -----------------------------------------------------
       Get active month
    ----------------------------------------------------- */

    const activeMonth =
      await getOrCreateActiveMonth();

    /* -----------------------------------------------------
       Do not allow sale in closed month
    ----------------------------------------------------- */

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

    /* -----------------------------------------------------
       First sale:
       update month opening balance
    ----------------------------------------------------- */

    const existingSales =
      await prisma.sale.count({
        where: {
          salesMonthId:
            activeMonth.id,
        },
      });

    if (
      existingSales === 0
    ) {
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

    /* -----------------------------------------------------
       Create sale

       IMPORTANT:
       salesMonthId IS used here because it is required
       by your Prisma schema.
    ----------------------------------------------------- */

    const sale =
      await prisma.sale.create({
        data: {
          salesMonthId:
            activeMonth.id,

          date: new Date(
            `${date}T00:00:00`
          ),

          openingAmount,

          expense: 0,

          saleAmount,

          paymentMethod:
            paymentMethod ===
            "Cash"
              ? "CASH"
              : "ONLINE",

          onlineAccount:
            paymentMethod ===
            "Online"
              ? onlineAccount ===
                "EasyPaisa"
                ? "EASYPAISA"
                : "BANK_ISLAMI"
              : null,
        },
      });

    /* -----------------------------------------------------
       IMPORTANT:
       Don't access sale.salesMonthId here.
    ----------------------------------------------------- */

    return NextResponse.json(
      {
        success: true,

        sale: {
          id: sale.id,

          salesMonthId:
            activeMonth.id,
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
          "Unable to save sale.",
      },
      {
        status: 500,
      }
    );
  }
}