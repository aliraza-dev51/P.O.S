import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const paymentMethodMap = {
  Cash: "CASH",
  Online: "ONLINE",
} as const;

const onlineAccountMap = {
  EasyPaisa: "EASYPAISA",
  "Bank Islami": "BANK_ISLAMI",
} as const;

function serializeSale(sale: any) {
  return {
    id: sale.id,
    date: new Date(sale.date).toISOString().split("T")[0],
    openingAmount: Number(sale.openingAmount),
    expense: Number(sale.expense),
    saleAmount: Number(sale.saleAmount),
    paymentMethod: sale.paymentMethod === "CASH" ? "Cash" : "Online",
    onlineAccount:
      sale.onlineAccount === "EASYPAISA"
        ? "EasyPaisa"
        : sale.onlineAccount === "BANK_ISLAMI"
        ? "Bank Islami"
        : "",
  };
}

async function getVendorExpense() {
  const result = await prisma.vendorBill.aggregate({
    _sum: {
      billAmount: true,
    },
  });

  return Number(result._sum.billAmount ?? 0);
}

function parseId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseId(params.id);

    if (id === null) {
      return NextResponse.json({ error: "Invalid sale id" }, { status: 400 });
    }

    const body = await request.json();
    const openingAmount = Number(body.openingAmount);
    const saleAmount = Number(body.saleAmount);

    if (!body.date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    if (!Number.isFinite(openingAmount) || openingAmount < 0) {
      return NextResponse.json(
        { error: "Opening amount must be a valid positive number" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(saleAmount) || saleAmount <= 0) {
      return NextResponse.json(
        { error: "Sale amount must be greater than 0" },
        { status: 400 }
      );
    }

    const paymentMethod = paymentMethodMap[body.paymentMethod as keyof typeof paymentMethodMap];

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      );
    }

    let onlineAccount = null;

    if (paymentMethod === "ONLINE") {
      onlineAccount =
        onlineAccountMap[body.onlineAccount as keyof typeof onlineAccountMap];

      if (!onlineAccount) {
        return NextResponse.json(
          { error: "Online account is required" },
          { status: 400 }
        );
      }
    }

    const expense = await getVendorExpense();

    const sale = await prisma.sale.update({
      where: { id },
      data: {
        date: new Date(`${body.date}T00:00:00`),
        openingAmount,
        expense,
        saleAmount,
        paymentMethod,
        onlineAccount,
      },
    });

    return NextResponse.json(serializeSale(sale));
  } catch (error) {
    console.error("PUT /api/sales/[id] ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to update sale",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseId(params.id);

    if (id === null) {
      return NextResponse.json({ error: "Invalid sale id" }, { status: 400 });
    }

    await prisma.sale.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/sales/[id] ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to delete sale",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
