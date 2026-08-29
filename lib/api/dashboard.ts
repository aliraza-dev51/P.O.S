export type DashboardData = {
  stats: {
    todaySales: number;
    todayExpense: number;
    todayCredit: number;
    totalCredit: number;
    totalInvestment: number;
    todayInvestment: number;
    unpaidVendorBills: number;
    transactions: number;
    creditCustomers: number;
    pendingBills: number;
  };

  chartData: {
    date: string;
    day: string;
    sales: number;
    expense: number;
    investment: number;
  }[];

  pieData: {
    id: number;
    value: number;
    label: string;
  }[];

  recentSales: {
    id: number;
    date: string;
    amount: number;
    paymentMethod: string;
  }[];
};

export async function getDashboardData(): Promise<DashboardData> {
  const response = await fetch("/api/dashboard", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Dashboard data load failed");
  }

  return (await response.json()) as DashboardData;
}
