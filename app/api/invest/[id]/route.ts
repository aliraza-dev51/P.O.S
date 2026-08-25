import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

/* =========================================================
   UPDATE INVESTMENT
========================================================= */

export async function PUT(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } = await context.params;

    const investmentId = Number(id);

    if (!Number.isInteger(investmentId)) {
      return NextResponse.json(
        {
          message: "Invalid investment ID",
        },
        {
          status: 400,
        }
      );
    }

    const body = await request.json();

    const {
      itemName,
      weight,
      quantity,
      quantityPerPack,
      rate,
      marketRate,
    } = body;

    const parsedWeight = Number(weight);
    const parsedQuantity = Number(quantity);
    const parsedQuantityPerPack = Number(quantityPerPack);
    const parsedRate = Number(rate);
    const parsedMarketRate = Number(marketRate);

    /* ---------------- VALIDATION ---------------- */

    if (
      !itemName ||
      !Number.isFinite(parsedWeight) ||
      !Number.isFinite(parsedQuantity) ||
      !Number.isFinite(parsedQuantityPerPack) ||
      !Number.isFinite(parsedRate) ||
      !Number.isFinite(parsedMarketRate)
    ) {
      return NextResponse.json(
        {
          message: "Invalid investment data",
        },
        {
          status: 400,
        }
      );
    }

    if (
      parsedWeight <= 0 ||
      parsedQuantity <= 0 ||
      parsedQuantityPerPack <= 0 ||
      parsedRate < 0 ||
      parsedMarketRate < 0
    ) {
      return NextResponse.json(
        {
          message: "Invalid investment values",
        },
        {
          status: 400,
        }
      );
    }

    /* ---------------- CHECK EXISTS ---------------- */

    const existing = await prisma.investment.findUnique({
      where: {
        id: investmentId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          message: "Investment not found",
        },
        {
          status: 404,
        }
      );
    }

    /* ---------------- UPDATE ---------------- */

    const investment = await prisma.investment.update({
      where: {
        id: investmentId,
      },
      data: {
        itemName: String(itemName).trim(),
        weight: parsedWeight,
        quantity: parsedQuantity,
        quantityPerPack: parsedQuantityPerPack,
        rate: parsedRate,
        marketRate: parsedMarketRate,
      },
    });

    return NextResponse.json({
      id: investment.id,
      dateTime: investment.dateTime.toISOString(),
      itemName: investment.itemName,
      weight: Number(investment.weight),
      quantity: investment.quantity,
      quantityPerPack: investment.quantityPerPack,
      rate: Number(investment.rate),
      marketRate: Number(investment.marketRate),
    });
  } catch (error) {
    console.error("UPDATE INVESTMENT ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to update investment",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   DELETE INVESTMENT
========================================================= */

export async function DELETE(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } = await context.params;

    const investmentId = Number(id);

    if (!Number.isInteger(investmentId)) {
      return NextResponse.json(
        {
          message: "Invalid investment ID",
        },
        {
          status: 400,
        }
      );
    }

    const existing = await prisma.investment.findUnique({
      where: {
        id: investmentId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          message: "Investment not found",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.investment.delete({
      where: {
        id: investmentId,
      },
    });

    return NextResponse.json({
      message: "Investment deleted successfully",
    });
  } catch (error) {
    console.error("DELETE INVESTMENT ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to delete investment",
      },
      {
        status: 500,
      }
    );
  }
}