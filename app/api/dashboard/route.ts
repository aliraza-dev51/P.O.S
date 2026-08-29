import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getStartOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function getEndOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

function formatMoney(value: number) {
  return Number(value.toFixed(2));
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const userId = currentUser.id;

    const todayStart = getStartOfDay(now);
    const todayEnd = getEndOfDay(now);

    // ==========================================
    // LAST 7 DAYS
    // ==========================================

    const sevenDaysAgo = new Date(todayStart);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    // ==========================================
    // TODAY'S SALES
    // ==========================================

    const todaySales = await prisma.sale.findMany({
      where: {
        userId,
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    const todaySalesAmount = todaySales.reduce(
      (total, sale) => total + Number(sale.saleAmount),
      0
    );

    // ==========================================
    // TODAY'S VENDOR EXPENSE
    //
    // Paid + Unpaid dono include honge
    // ==========================================

    const todayVendorBills = await prisma.vendorBill.findMany({
      where: {
        userId,
        dateTime: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    const todayExpense = todayVendorBills.reduce(
      (total, bill) => total + Number(bill.billAmount),
      0
    );

    // ==========================================
    // DAILY CREDIT OUTSTANDING
    // Matches the Credit page "Daily Credit" summary logic:
    // outstanding = (previousBalance + currentAmount) - paidAmount
    // Only positive outstanding amounts are included.
    // ==========================================

    const dailyCreditCustomers = await prisma.creditCustomer.findMany({
      where: {
        userId,
        creditType: "DAILY",
      },
    });

    const totalCredit = dailyCreditCustomers.reduce(
      (total, customer) => {
        const totalAmount =
          Number(customer.previousBalance) + Number(customer.currentAmount);
        const balance = totalAmount - Number(customer.paidAmount);

        return total + (balance > 0 ? balance : 0);
      },
      0
    );

    // ==========================================
    // ALL VENDOR BILLS
    //
    // Expense = Paid + Unpaid
    // ==========================================

    const allVendorBills = await prisma.vendorBill.findMany({ where: { userId } });

    const totalExpense = allVendorBills.reduce(
      (total, bill) => total + Number(bill.billAmount),
      0
    );

    // ==========================================
    // UNPAID VENDOR BILLS
    // ==========================================

    const unpaidVendorBills = allVendorBills.filter(
      (bill) => bill.status === "UNPAID"
    );

    const unpaidVendorAmount = unpaidVendorBills.reduce(
      (total, bill) => total + Number(bill.billAmount),
      0
    );

    // ==========================================
    // INVESTMENTS
    // ==========================================

    const investments = await prisma.investment.findMany({
      where: { userId },
      orderBy: {
        dateTime: "desc",
      },
    });

    const calculateInvestment = (
      rate: unknown,
      quantity: unknown
    ) => {
      return Number(rate) * Number(quantity);
    };

    const totalInvestment = investments.reduce(
      (total, investment) =>
        total +
        calculateInvestment(
          investment.rate,
          investment.quantity
        ),
      0
    );

    // ==========================================
    // TODAY'S INVESTMENT
    // ==========================================

    const todayInvestments = investments.filter((investment) => {
      const investmentDate = new Date(investment.dateTime);

      return (
        investmentDate >= todayStart &&
        investmentDate <= todayEnd
      );
    });

    const todayInvestmentAmount = todayInvestments.reduce(
      (total, investment) =>
        total +
        calculateInvestment(
          investment.rate,
          investment.quantity
        ),
      0
    );

    // ==========================================
    // WEEKLY SALES
    // ==========================================

    const weeklySales = await prisma.sale.findMany({
      where: {
        userId,
        date: {
          gte: sevenDaysAgo,
          lte: todayEnd,
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // ==========================================
    // WEEKLY VENDOR EXPENSES
    // ==========================================

    const weeklyVendorBills = await prisma.vendorBill.findMany({
      where: {
        userId,
        dateTime: {
          gte: sevenDaysAgo,
          lte: todayEnd,
        },
      },
      orderBy: {
        dateTime: "asc",
      },
    });

    // ==========================================
    // WEEKLY INVESTMENTS
    // ==========================================

    const weeklyInvestments = await prisma.investment.findMany({
      where: {
        userId,
        dateTime: {
          gte: sevenDaysAgo,
          lte: todayEnd,
        },
      },
      orderBy: {
        dateTime: "asc",
      },
    });

    // ==========================================
    // CHART DATA
    // ==========================================

    const chartData = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);

      date.setDate(sevenDaysAgo.getDate() + i);

      const dayStart = getStartOfDay(date);
      const dayEnd = getEndOfDay(date);

      // ------------------------------------------
      // SALES
      // ------------------------------------------

      const daySales = weeklySales
        .filter((sale) => {
          const saleDate = new Date(sale.date);

          return (
            saleDate >= dayStart &&
            saleDate <= dayEnd
          );
        })
        .reduce(
          (total, sale) =>
            total + Number(sale.saleAmount),
          0
        );

      // ------------------------------------------
      // EXPENSES
      //
      // Vendor bills:
      // Paid + Unpaid
      // ------------------------------------------

      const dayExpense = weeklyVendorBills
        .filter((bill) => {
          const billDate = new Date(bill.dateTime);

          return (
            billDate >= dayStart &&
            billDate <= dayEnd
          );
        })
        .reduce(
          (total, bill) =>
            total + Number(bill.billAmount),
          0
        );

      // ------------------------------------------
      // INVESTMENTS
      // ------------------------------------------

      const dayInvestment = weeklyInvestments
        .filter((investment) => {
          const investmentDate = new Date(
            investment.dateTime
          );

          return (
            investmentDate >= dayStart &&
            investmentDate <= dayEnd
          );
        })
        .reduce(
          (total, investment) =>
            total +
            calculateInvestment(
              investment.rate,
              investment.quantity
            ),
          0
        );

      chartData.push({
        date: date.toISOString().split("T")[0],

        day: date.toLocaleDateString("en-US", {
          weekday: "short",
        }),

        sales: formatMoney(daySales),

        expense: formatMoney(dayExpense),

        investment: formatMoney(dayInvestment),
      });
    }

    // ==========================================
    // RECENT SALES
    // ==========================================

    const recentSales = await prisma.sale.findMany({
      orderBy: {
        date: "desc",
      },
      take: 5,
    });

    // ==========================================
    // RESPONSE
    // ==========================================

    return NextResponse.json({
      stats: {
        todaySales: formatMoney(todaySalesAmount),

        todayExpense: formatMoney(todayExpense),

        totalExpense: formatMoney(totalExpense),

        todayCredit: formatMoney(totalCredit),

        totalCredit: formatMoney(totalCredit),

        totalInvestment: formatMoney(totalInvestment),

        todayInvestment: formatMoney(
          todayInvestmentAmount
        ),

        unpaidVendorBills: formatMoney(
          unpaidVendorAmount
        ),

        transactions: todaySales.length,

        creditCustomers: dailyCreditCustomers.length,

        pendingBills: unpaidVendorBills.length,
      },

      chartData,

      pieData: [
        {
          id: 0,
          value: formatMoney(todaySalesAmount),
          label: "Sales",
        },
        {
          id: 1,
          value: formatMoney(todayExpense),
          label: "Expense",
        },
        {
          id: 2,
          value: formatMoney(todayInvestmentAmount),
          label: "Investment",
        },
      ],

      recentSales: recentSales.map((sale) => ({
        id: sale.id,

        date: sale.date.toISOString(),

        amount: formatMoney(
          Number(sale.saleAmount)
        ),

        paymentMethod: sale.paymentMethod,
      })),
    });
  } catch (error) {
    console.error(
      "Dashboard API Error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to load dashboard data",
      },
      {
        status: 500,
      }
    );
  }
}