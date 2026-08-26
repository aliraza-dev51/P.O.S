import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

/* =========================================================
   HELPERS
========================================================= */

function getId(value: string) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

/* =========================================================
   GET SINGLE SALE
========================================================= */

export async function GET(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id: idParam } = await context.params;

    const id = getId(idParam);

    if (id === null) {
      return NextResponse.json(
        {
          error: "Invalid sale ID.",
        },
        {
          status: 400,
        }
      );
    }

    /* -----------------------------------------------------
       Get sale + month
    ----------------------------------------------------- */

    const rows = await prisma.$queryRaw<
      Array<{
        id: number;
        salesMonthId: number;
        date: Date;
        openingAmount: string | number;
        expense: string | number;
        saleAmount: string | number;
        paymentMethod: string;
        onlineAccount: string | null;

        month: number;
        year: number;
        isClosed: boolean;
        closingBalance: string | number | null;
      }>
    >`
      SELECT
        s."id",
        s."salesMonthId",
        s."date",
        s."openingAmount",
        s."expense",
        s."saleAmount",
        s."paymentMethod",
        s."onlineAccount",

        sm."month",
        sm."year",
        sm."isClosed",
        sm."closingBalance"

      FROM "sales" s

      INNER JOIN "sales_months" sm
        ON sm."id" = s."salesMonthId"

      WHERE s."id" = ${id}

      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        {
          error: "Sale not found.",
        },
        {
          status: 404,
        }
      );
    }

    const sale = rows[0];

    return NextResponse.json({
      sale: {
        id: sale.id,

        salesMonthId:
          sale.salesMonthId,

        date: sale.date
          .toISOString()
          .split("T")[0],

        openingAmount:
          Number(sale.openingAmount),

        expense:
          Number(sale.expense),

        saleAmount:
          Number(sale.saleAmount),

        paymentMethod:
          sale.paymentMethod === "CASH"
            ? "Cash"
            : "Online",

        onlineAccount:
          sale.onlineAccount === "EASYPAISA"
            ? "EasyPaisa"
            : sale.onlineAccount === "BANK_ISLAMI"
              ? "Bank Islami"
              : "",

        salesMonth: {
          month: sale.month,
          year: sale.year,
          isClosed: sale.isClosed,

          closingBalance:
            sale.closingBalance === null
              ? null
              : Number(
                  sale.closingBalance
                ),
        },
      },
    });
  } catch (error) {
    console.error(
      "GET /api/sales/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to load sale.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   PUT / UPDATE SALE
========================================================= */

export async function PUT(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id: idParam } = await context.params;

    const id = getId(idParam);

    if (id === null) {
      return NextResponse.json(
        {
          error: "Invalid sale ID.",
        },
        {
          status: 400,
        }
      );
    }

    const body = await request.json();

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
          error: "Date is required.",
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
      typeof openingAmount !== "number" ||
      !Number.isFinite(openingAmount) ||
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
      typeof saleAmount !== "number" ||
      !Number.isFinite(saleAmount) ||
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
       Validate payment method
    ----------------------------------------------------- */

    if (
      paymentMethod !== "Cash" &&
      paymentMethod !== "Online"
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
      paymentMethod === "Online" &&
      onlineAccount !== "EasyPaisa" &&
      onlineAccount !== "Bank Islami"
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
       Check sale + month
    ----------------------------------------------------- */

    const existingRows =
      await prisma.$queryRaw<
        Array<{
          id: number;
          salesMonthId: number;
          isClosed: boolean;
        }>
      >`
        SELECT
          s."id",
          s."salesMonthId",
          sm."isClosed"

        FROM "sales" s

        INNER JOIN "sales_months" sm
          ON sm."id" = s."salesMonthId"

        WHERE s."id" = ${id}

        LIMIT 1
      `;

    if (existingRows.length === 0) {
      return NextResponse.json(
        {
          error: "Sale not found.",
        },
        {
          status: 404,
        }
      );
    }

    const existing =
      existingRows[0];

    /* -----------------------------------------------------
       Don't edit closed month
    ----------------------------------------------------- */

    if (existing.isClosed) {
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

    /* -----------------------------------------------------
       Convert payment values
    ----------------------------------------------------- */

    const dbPaymentMethod =
      paymentMethod === "Cash"
        ? "CASH"
        : "ONLINE";

    let dbOnlineAccount:
      | string
      | null = null;

    if (paymentMethod === "Online") {
      dbOnlineAccount =
        onlineAccount === "EasyPaisa"
          ? "EASYPAISA"
          : "BANK_ISLAMI";
    }

    /* -----------------------------------------------------
       Update sale
    ----------------------------------------------------- */

    await prisma.$executeRaw`
      UPDATE "sales"

      SET
        "date" = ${new Date(
          `${date}T00:00:00`
        )},

        "openingAmount" = ${openingAmount},

        "saleAmount" = ${saleAmount},

        "paymentMethod" = ${dbPaymentMethod},

        "onlineAccount" = ${dbOnlineAccount},

        "updatedAt" = NOW()

      WHERE "id" = ${id}
    `;

    /* -----------------------------------------------------
       Get updated sale
    ----------------------------------------------------- */

    const updatedRows =
      await prisma.$queryRaw<
        Array<{
          id: number;
          salesMonthId: number;
          date: Date;
          openingAmount: string | number;
          expense: string | number;
          saleAmount: string | number;
          paymentMethod: string;
          onlineAccount: string | null;
        }>
      >`
        SELECT
          "id",
          "salesMonthId",
          "date",
          "openingAmount",
          "expense",
          "saleAmount",
          "paymentMethod",
          "onlineAccount"

        FROM "sales"

        WHERE "id" = ${id}

        LIMIT 1
      `;

    if (updatedRows.length === 0) {
      return NextResponse.json(
        {
          error:
            "Sale was updated but could not be loaded.",
        },
        {
          status: 500,
        }
      );
    }

    const sale =
      updatedRows[0];

    return NextResponse.json({
      success: true,

      sale: {
        id: sale.id,

        salesMonthId:
          sale.salesMonthId,

        date: sale.date
          .toISOString()
          .split("T")[0],

        openingAmount:
          Number(sale.openingAmount),

        expense:
          Number(sale.expense),

        saleAmount:
          Number(sale.saleAmount),

        paymentMethod:
          sale.paymentMethod === "CASH"
            ? "Cash"
            : "Online",

        onlineAccount:
          sale.onlineAccount === "EASYPAISA"
            ? "EasyPaisa"
            : sale.onlineAccount === "BANK_ISLAMI"
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
          "Unable to update sale.",
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
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id: idParam } = await context.params;

    const id = getId(idParam);

    if (id === null) {
      return NextResponse.json(
        {
          error: "Invalid sale ID.",
        },
        {
          status: 400,
        }
      );
    }

    /* -----------------------------------------------------
       Check sale + month
    ----------------------------------------------------- */

    const rows =
      await prisma.$queryRaw<
        Array<{
          id: number;
          salesMonthId: number;
          isClosed: boolean;
        }>
      >`
        SELECT
          s."id",
          s."salesMonthId",
          sm."isClosed"

        FROM "sales" s

        INNER JOIN "sales_months" sm
          ON sm."id" = s."salesMonthId"

        WHERE s."id" = ${id}

        LIMIT 1
      `;

    if (rows.length === 0) {
      return NextResponse.json(
        {
          error: "Sale not found.",
        },
        {
          status: 404,
        }
      );
    }

    const sale = rows[0];

    /* -----------------------------------------------------
       Don't delete closed month sale
    ----------------------------------------------------- */

    if (sale.isClosed) {
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

    /* -----------------------------------------------------
       Delete
    ----------------------------------------------------- */

    await prisma.$executeRaw`
      DELETE FROM "sales"
      WHERE "id" = ${id}
    `;

    return NextResponse.json({
      success: true,

      message:
        "Sale deleted successfully.",

      id,
    });
  } catch (error) {
    console.error(
      "DELETE /api/sales/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to delete sale.",
      },
      {
        status: 500,
      }
    );
  }
}