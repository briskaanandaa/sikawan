import { ShoppingCart, Package, FileText, Wallet } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { ErrorAlert, PageHeader, formatIDR } from "@/components/shared";

import StatCard from "@/components/StatCard";
import DateRangePicker from "@/components/dashboard/DateRangePicker";
import CashflowSummary from "@/components/dashboard/CashflowSummary";
import MonthlyChart from "@/components/dashboard/MonthlyChart";
import RecentOrders from "@/components/dashboard/RecentOrders";
import RecentCashflows from "@/components/dashboard/RecentCashflows";

/* ── Stat card definitions ───────────────────────────────────────────────── */
function buildStatCards(stats) {
  return [
    {
      icon: ShoppingCart,
      label: "Total Order",
      value: stats.totalOrders,
      color: "bg-blue-100 text-blue-600",
      href: "/order",
    },
    {
      icon: Package,
      label: "Total Produk",
      value: stats.totalProducts,
      color: "bg-violet-100 text-violet-600",
      href: "/katalog",
    },
    {
      icon: FileText,
      label: "Total Post",
      value: stats.totalPosts,
      color: "bg-amber-100 text-amber-600",
      href: "/blog",
    },
    {
      icon: Wallet,
      label: "Total Saldo",
      value: formatIDR(stats.balance),

      color:
        stats.balance >= 0
          ? "bg-green-100 text-green-600"
          : "bg-red-100 text-red-500",
      href: "/cashflow",
    },
  ];
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const {
    stats,
    loading,
    error,
    dateRange,
    setDateRange,
    chartYear,
    setChartYear,
    availableYears,
  } = useDashboard();

  if (loading) {
    return (
      <div className="flex items-center h-[90%] justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">
            Memuat data dashboard...
          </p>
        </div>
      </div>
    );
  }

  const statCards = buildStatCards(stats);

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-0 md:mb-0 mb-4 flex-wrap ">
        <PageHeader
          className="bg-blue-500"
          title="Dashboard"
          description="Ringkasan performa toko dan keuangan Anda"
        />
        <DateRangePicker dateRange={dateRange} onRangeChange={setDateRange} />
      </div>

      {/* <ErrorAlert message={error} /> */}

      <div className=" space-y-4">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        {/* Cashflow Summary */}
        <CashflowSummary
          cashIncome={stats.cashIncome}
          cashOutcome={stats.cashOutcome}
        />

        {/* Monthly Chart */}
        <MonthlyChart
          data={stats.monthlyChart}
          chartYear={chartYear}
          setChartYear={setChartYear}
          availableYears={availableYears}
        />

        {/* Recent Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <RecentOrders orders={stats.recentOrders} />
          <RecentCashflows cashflows={stats.recentCashflows} />
        </div>
      </div>
    </div>
  );
}
