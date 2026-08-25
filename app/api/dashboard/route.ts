import { NextResponse } from "next/server";
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
    const now = new Date();

    const todayStart = getStartOfDay(now);
    const todayEnd = getEndOfDay(now);

    // ==========================================
    // LAST 7 DAYS
    // ==========================================

    const sevenDaysAgo = new Date(todayStart);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    // ==========================================
    // SALES
    // ==========================================

    const todaySales = await prisma.sale.findMany({
      where: {
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

    const todayExpense = todaySales.reduce(
      (total, sale) => total + Number(sale.expense),
      0
    );

    // ==========================================
    // CREDIT
    // ==========================================

    const creditCustomers =
      await prisma.creditCustomer.findMany();

    const totalCredit = creditCustomers.reduce(
      (total, customer) =>
        total + Number(customer.currentAmount),
      0
    );

    // ==========================================
    // VENDOR BILLS
    // ==========================================

    const unpaidVendorBills =
      await prisma.vendorBill.findMany({
        where: {
          status: "UNPAID",
        },
      });

    const unpaidVendorAmount =
      unpaidVendorBills.reduce(
        (total, bill) =>
          total + Number(bill.billAmount),
        0
      );

    // ==========================================
    // INVESTMENTS
    // ==========================================

    const investments =
      await prisma.investment.findMany({
        orderBy: {
          dateTime: "desc",
        },
      });

    /*
      IMPORTANT

      Invest page mein:

      Total Investment = rate × quantity

      Example:

      Rate = 1200
      Quantity = 10
      Qty/Pack = 12

      Investment = 1200 × 10
                  = 12,000

      quantityPerPack ko investment amount
      mein multiply nahi karna.
    */

    const totalInvestment =
      investments.reduce(
        (total, investment) => {
          const amount =
            Number(investment.rate) *
            Number(investment.quantity);

          return total + amount;
        },
        0
      );

    // ==========================================
    // TODAY'S INVESTMENT
    // ==========================================

    const todayInvestments =
      investments.filter((investment) => {
        const investmentDate =
          new Date(investment.dateTime);

        return (
          investmentDate >= todayStart &&
          investmentDate <= todayEnd
        );
      });

    const todayInvestmentAmount =
      todayInvestments.reduce(
        (total, investment) => {
          const amount =
            Number(investment.rate) *
            Number(investment.quantity);

          return total + amount;
        },
        0
      );

    // ==========================================
    // WEEKLY SALES
    // ==========================================

    const weeklySales =
      await prisma.sale.findMany({
        where: {
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
    // WEEKLY INVESTMENTS
    // ==========================================

    const weeklyInvestments =
      await prisma.investment.findMany({
        where: {
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

      date.setDate(
        sevenDaysAgo.getDate() + i
      );

      const dayStart =
        getStartOfDay(date);

      const dayEnd =
        getEndOfDay(date);

      // ------------------------------
      // DAY SALES
      // ------------------------------

      const daySales =
        weeklySales
          .filter((sale) => {
            const saleDate =
              new Date(sale.date);

            return (
              saleDate >= dayStart &&
              saleDate <= dayEnd
            );
          })
          .reduce(
            (total, sale) =>
              total +
              Number(sale.saleAmount),
            0
          );

      // ------------------------------
      // DAY EXPENSE
      // ------------------------------

      const dayExpense =
        weeklySales
          .filter((sale) => {
            const saleDate =
              new Date(sale.date);

            return (
              saleDate >= dayStart &&
              saleDate <= dayEnd
            );
          })
          .reduce(
            (total, sale) =>
              total +
              Number(sale.expense),
            0
          );

      // ------------------------------
      // DAY INVESTMENT
      // ------------------------------

      const dayInvestment =
        weeklyInvestments
          .filter((investment) => {
            const investmentDate =
              new Date(
                investment.dateTime
              );

            return (
              investmentDate >= dayStart &&
              investmentDate <= dayEnd
            );
          })
          .reduce(
            (total, investment) => {
              const amount =
                Number(investment.rate) *
                Number(investment.quantity);

              return total + amount;
            },
            0
          );

      chartData.push({
        date: date
          .toISOString()
          .split("T")[0],

        day: date.toLocaleDateString(
          "en-US",
          {
            weekday: "short",
          }
        ),

        sales: formatMoney(daySales),

        expense: formatMoney(dayExpense),

        investment:
          formatMoney(dayInvestment),
      });
    }

    // ==========================================
    // RECENT SALES
    // ==========================================

    const recentSales =
      await prisma.sale.findMany({
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
        todaySales:
          formatMoney(todaySalesAmount),

        todayExpense:
          formatMoney(todayExpense),

        totalCredit:
          formatMoney(totalCredit),

        totalInvestment:
          formatMoney(totalInvestment),

        todayInvestment:
          formatMoney(
            todayInvestmentAmount
          ),

        unpaidVendorBills:
          formatMoney(
            unpaidVendorAmount
          ),

        transactions:
          todaySales.length,

        creditCustomers:
          creditCustomers.length,

        pendingBills:
          unpaidVendorBills.length,
      },

      // ========================================
      // BAR CHART
      // ========================================

      chartData,

      // ========================================
      // PIE CHART
      // ========================================

      pieData: [
        {
          id: 0,
          value:
            formatMoney(
              todaySalesAmount
            ),
          label: "Sales",
        },

        {
          id: 1,
          value:
            formatMoney(todayExpense),
          label: "Expense",
        },

        {
          id: 2,
          value:
            formatMoney(
              todayInvestmentAmount
            ),
          label: "Investment",
        },
      ],

      // ========================================
      // RECENT SALES
      // ========================================

      recentSales:
        recentSales.map((sale) => ({
          id: sale.id,

          date: sale.date,

          amount:
            formatMoney(
              Number(
                sale.saleAmount
              )
            ),

          paymentMethod:
            sale.paymentMethod,
        })),
    });
  } catch (error) {
    console.error(
      "Dashboard API Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load dashboard data",
      },
      {
        status: 500,
      }
    );
  }
}