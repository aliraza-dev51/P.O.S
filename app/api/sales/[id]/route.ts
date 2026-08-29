import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/* =========================================================
   HELPERS
========================================================= */

function getId(value: string) {
  const id = Number(value);

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    return null;
  }

  return id;
}

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

async function getVendorExpenseForDate(
  date: Date,
  userId: number
) {
  const start = dayStart(date);
  const end = nextDay(date);

  const result =
    await prisma.vendorBill.aggregate({
      _sum: {
        billAmount: true,
      },

      where: {
        userId,
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
   RECALCULATE MONTH
========================================================= */

async function recalculateMonth(
  salesMonthId: number,
  userId: number
) {
  const month =
    await prisma.salesMonth.findFirst({
      where: {
        id: salesMonthId,
        userId,
      },
    });

  if (!month) {
    throw new Error(
      "Sales month not found."
    );
  }

  const sales =
    await prisma.sale.findMany({
      where: {
        userId,
        salesMonthId,
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

  const start = new Date(
    month.year,
    month.month - 1,
    1,
    0,
    0,
    0,
    0
  );

  const end =
    month.month === 12
      ? new Date(
          month.year + 1,
          0,
          1,
          0,
          0,
          0,
          0
        )
      : new Date(
          month.year,
          month.month,
          1,
          0,
          0,
          0,
          0
        );

  const vendor =
    await prisma.vendorBill.aggregate({
      _sum: {
        billAmount: true,
      },

      where: {
        userId,
        dateTime: {
          gte: start,
          lt: end,
        },
      },
    });

  const vendorExpense =
    Number(
      vendor._sum.billAmount ?? 0
    );

  const opening =
    Number(
      month.openingBalance
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
   GET SINGLE SALE
========================================================= */

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      id: idParam,
    } = await context.params;

    const id =
      getId(idParam);

    if (id === null) {
      return NextResponse.json(
        {
          error:
            "Invalid sale ID.",
        },
        {
          status: 400,
        }
      );
    }

    const sale =
      await prisma.sale.findFirst({
        where: {
          id,
          userId: currentUser.id,
        },

        include: {
          salesMonth: true,
        },
      });

    if (!sale) {
      return NextResponse.json(
        {
          error:
            "Sale not found.",
        },
        {
          status: 404,
        }
      );
    }

    const expense =
      await getVendorExpenseForDate(
        new Date(sale.date),
        currentUser.id
      );

    return NextResponse.json({
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

        expense,

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

      salesMonth: {
        id:
          sale.salesMonth.id,

        month:
          sale.salesMonth.month,

        year:
          sale.salesMonth.year,

        openingBalance:
          Number(
            sale.salesMonth
              .openingBalance
          ),

        closingBalance:
          sale.salesMonth
            .closingBalance ===
          null
            ? null
            : Number(
                sale.salesMonth
                  .closingBalance
              ),

        isClosed:
          sale.salesMonth
            .isClosed,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/sales/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load sale.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   UPDATE SALE
========================================================= */

export async function PUT(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      id: idParam,
    } = await context.params;

    const id =
      getId(idParam);

    if (id === null) {
      return NextResponse.json(
        {
          error:
            "Invalid sale ID.",
        },
        {
          status: 400,
        }
      );
    }

    const body =
      await request.json();

    const date =
      body.date;

    const openingAmount =
      normalizeAmount(
        body.openingAmount
      );

    const rawCash =
      body.cashAmount;

    const rawOnline =
      body.onlineAmount;

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

    const onlineAccount =
      body.onlineAccount;

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
            "Please select EasyPaisa or Bank Islami.",
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

    const existingSale =
      await prisma.sale.findUnique({
        where: {
          id,
        },

        include: {
          salesMonth: true,
        },
      });

    if (!existingSale) {
      return NextResponse.json(
        {
          error:
            "Sale not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      existingSale.salesMonth
        .isClosed
    ) {
      return NextResponse.json(
        {
          error:
            "This month is closed. Closed month sales cannot be edited.",
        },
        {
          status: 400,
        }
      );
    }

    const saleDate =
      new Date(
        `${date}T00:00:00`
      );

    /*
     * IMPORTANT:
     *
     * Recalculate expense based
     * on the NEW sale date.
     */
    const dateExpense =
      await getVendorExpenseForDate(
        saleDate,
        currentUser.id
      );

    const updatedSale =
      await prisma.sale.update({
        where: {
          id,
        },

        data: {
          date:
            saleDate,

          openingAmount:
            openingAmount,

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
     * Recalculate month closing.
     */
    const closing =
      await recalculateMonth(
        existingSale
          .salesMonthId,
        currentUser.id
      );

    await prisma.salesMonth.update({
      where: {
        id:
          existingSale
            .salesMonthId,
      },

      data: {
        closingBalance:
          closing.closing,
      },
    });

    return NextResponse.json({
      success: true,

      sale: {
        id:
          updatedSale.id,

        salesMonthId:
          updatedSale
            .salesMonthId,

        date:
          updatedSale.date
            .toISOString()
            .split("T")[0],

        openingAmount:
          Number(
            updatedSale
              .openingAmount
          ),

        expense:
          dateExpense,

        cashAmount:
          Number(
            updatedSale
              .cashAmount
          ),

        onlineAmount:
          Number(
            updatedSale
              .onlineAmount
          ),

        saleAmount:
          Number(
            updatedSale
              .saleAmount
          ),

        onlineAccount:
          updatedSale
            .onlineAccount ===
          "EASYPAISA"
            ? "EasyPaisa"
            : updatedSale
                .onlineAccount ===
              "BANK_ISLAMI"
            ? "Bank Islami"
            : "",
      },
    });
  } catch (error) {
    console.error(
      "PUT /api/sales/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update sale.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   DELETE SALE
========================================================= */

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      id: idParam,
    } = await context.params;

    const id =
      getId(idParam);

    if (id === null) {
      return NextResponse.json(
        {
          error:
            "Invalid sale ID.",
        },
        {
          status: 400,
        }
      );
    }

    const existingSale =
      await prisma.sale.findFirst({
        where: {
          id,
          userId: currentUser.id,
        },

        include: {
          salesMonth: true,
        },
      });

    if (!existingSale) {
      return NextResponse.json(
        {
          error:
            "Sale not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      existingSale.salesMonth
        .isClosed
    ) {
      return NextResponse.json(
        {
          error:
            "This month is closed. Closed month sales cannot be deleted.",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.sale.delete({
      where: {
        id,
      },
    });

    /*
     * Vendor bills remain untouched.
     *
     * Recalculate month after
     * deleting the sale.
     */
    const closing =
      await recalculateMonth(
        existingSale
          .salesMonthId,
        currentUser.id
      );

    await prisma.salesMonth.update({
      where: {
        id:
          existingSale
            .salesMonthId,
      },

      data: {
        closingBalance:
          closing.closing,
      },
    });

    return NextResponse.json({
      success: true,

      message:
        "Sale deleted successfully.",

      deletedId: id,
    });
  } catch (error) {
    console.error(
      "DELETE /api/sales/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to delete sale.",
      },
      {
        status: 500,
      }
    );
  }
}

