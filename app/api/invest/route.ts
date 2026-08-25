import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* =========================================================
   HELPER
========================================================= */

function serializeInvestment(investment: {
  id: number;
  dateTime: Date;
  itemName: string;
  weight: unknown;
  quantity: number;
  quantityPerPack: number;
  rate: unknown;
  marketRate: unknown;
}) {
  return {
    id: investment.id,
    dateTime: investment.dateTime.toISOString(),
    itemName: investment.itemName,

    weight: Number(investment.weight),

    quantity: investment.quantity,

    quantityPerPack:
      investment.quantityPerPack,

    rate: Number(investment.rate),

    marketRate: Number(
      investment.marketRate
    ),
  };
}

/* =========================================================
   VALIDATION
========================================================= */

function validateInvestment(body: unknown) {
  if (
    typeof body !== "object" ||
    body === null
  ) {
    return null;
  }

  const data = body as Record<
    string,
    unknown
  >;

  const itemName = String(
    data.itemName ?? ""
  ).trim();

  const weight = Number(
    data.weight
  );

  const quantity = Number(
    data.quantity
  );

  const quantityPerPack = Number(
    data.quantityPerPack
  );

  const rate = Number(
    data.rate
  );

  const marketRate = Number(
    data.marketRate
  );

  /* -----------------------------
     CHECK NUMBER VALUES
  ----------------------------- */

  if (
    !itemName ||
    !Number.isFinite(weight) ||
    !Number.isFinite(quantity) ||
    !Number.isFinite(
      quantityPerPack
    ) ||
    !Number.isFinite(rate) ||
    !Number.isFinite(marketRate)
  ) {
    return null;
  }

  /* -----------------------------
     CHECK POSITIVE VALUES
  ----------------------------- */

  if (
    weight <= 0 ||
    quantity <= 0 ||
    quantityPerPack <= 0 ||
    rate < 0 ||
    marketRate < 0
  ) {
    return null;
  }

  /* -----------------------------
     INTEGER VALUES
  ----------------------------- */

  if (
    !Number.isInteger(quantity) ||
    !Number.isInteger(
      quantityPerPack
    )
  ) {
    return null;
  }

  return {
    itemName,
    weight,
    quantity,
    quantityPerPack,
    rate,
    marketRate,
  };
}

/* =========================================================
   GET
   GET /api/investments

   PostgreSQL se tamam investments
========================================================= */

export async function GET() {
  try {
    const investments =
      await prisma.investment.findMany({
        orderBy: {
          dateTime: "desc",
        },
      });

    const data =
      investments.map(
        serializeInvestment
      );

    return NextResponse.json(data);
  } catch (error) {
    console.error(
      "GET INVESTMENTS ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch investments",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   POST
   POST /api/investments

   PostgreSQL mein new investment save
========================================================= */

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    const data =
      validateInvestment(body);

    if (!data) {
      return NextResponse.json(
        {
          error:
            "Invalid investment data",
        },
        {
          status: 400,
        }
      );
    }

    const investment =
      await prisma.investment.create({
        data: {
          itemName: data.itemName,

          weight: data.weight,

          quantity: data.quantity,

          quantityPerPack:
            data.quantityPerPack,

          rate: data.rate,

          marketRate:
            data.marketRate,
        },
      });

    return NextResponse.json(
      serializeInvestment(
        investment
      ),
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST INVESTMENT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to create investment",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   PUT
   PUT /api/investments

   Existing investment update
========================================================= */

export async function PUT(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    if (
      typeof body !== "object" ||
      body === null
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid request body",
        },
        {
          status: 400,
        }
      );
    }

    const data =
      body as Record<
        string,
        unknown
      >;

    const id = Number(
      data.id
    );

    /* -----------------------------
       CHECK ID
    ----------------------------- */

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid investment ID",
        },
        {
          status: 400,
        }
      );
    }

    /* -----------------------------
       VALIDATE DATA
    ----------------------------- */

    const investmentData =
      validateInvestment(body);

    if (!investmentData) {
      return NextResponse.json(
        {
          error:
            "Invalid investment data",
        },
        {
          status: 400,
        }
      );
    }

    /* -----------------------------
       CHECK EXISTING
    ----------------------------- */

    const existing =
      await prisma.investment.findUnique(
        {
          where: {
            id,
          },
        }
      );

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "Investment not found",
        },
        {
          status: 404,
        }
      );
    }

    /* -----------------------------
       UPDATE DATABASE
    ----------------------------- */

    const investment =
      await prisma.investment.update({
        where: {
          id,
        },

        data: {
          itemName:
            investmentData.itemName,

          weight:
            investmentData.weight,

          quantity:
            investmentData.quantity,

          quantityPerPack:
            investmentData.quantityPerPack,

          rate:
            investmentData.rate,

          marketRate:
            investmentData.marketRate,
        },
      });

    return NextResponse.json(
      serializeInvestment(
        investment
      )
    );
  } catch (error) {
    console.error(
      "PUT INVESTMENT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update investment",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   DELETE
   DELETE /api/investments

   PostgreSQL se investment delete
========================================================= */

export async function DELETE(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    const id = Number(
      body?.id
    );

    /* -----------------------------
       CHECK ID
    ----------------------------- */

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid investment ID",
        },
        {
          status: 400,
        }
      );
    }

    /* -----------------------------
       CHECK EXISTING
    ----------------------------- */

    const existing =
      await prisma.investment.findUnique(
        {
          where: {
            id,
          },
        }
      );

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "Investment not found",
        },
        {
          status: 404,
        }
      );
    }

    /* -----------------------------
       DELETE
    ----------------------------- */

    await prisma.investment.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,

      message:
        "Investment deleted successfully",

      id,
    });
  } catch (error) {
    console.error(
      "DELETE INVESTMENT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to delete investment",
      },
      {
        status: 500,
      }
    );
  }
}