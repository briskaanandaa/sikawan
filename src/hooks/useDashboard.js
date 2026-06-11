import { useState, useEffect } from "react";
import {
  getOrders,
  getProducts,
  getCashflows,
  getSalesOrders,
  getMetaValue,
} from "@/lib/woocommerce";
import { getPosts } from "@/lib/wordpress";
import { parseWPDate } from "@/lib/date";

// ── Helpers ────────────────────────────────────────────────────────────────

function toWIBMonthKey(dateStr) {
  const d = parseWPDate(dateStr);
  if (!d || isNaN(d)) return null;
  return d.toLocaleDateString("sv-SE", { timeZone: "Asia/Jakarta" }).slice(0, 7);
}

function toWIBYearKey(dateStr) {
  const d = parseWPDate(dateStr);
  if (!d || isNaN(d)) return null;
  return parseInt(
    d.toLocaleDateString("sv-SE", { timeZone: "Asia/Jakarta" }).slice(0, 4),
    10
  );
}

function toWIBDateStr(dateStr) {
  const d = parseWPDate(dateStr);
  if (!d || isNaN(d)) return null;
  return d.toLocaleDateString("sv-SE", { timeZone: "Asia/Jakarta" });
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useDashboard() {
  const currentYear = new Date().getFullYear();

  const [rawData, setRawData] = useState({
    orders: [],
    cashflows: [],
    salesOrders: [],
    totalProducts: 0,
    totalPosts: 0,
  });
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  // Filter date range → untuk stat cards
  const [dateRange, setDateRange] = useState({ from: null, to: null });

  // Filter tahun → untuk chart
  const [chartYear, setChartYear] = useState(currentYear);

  // ── Fetch data sekali saat mount ──────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [ordersRes, productsRes, cashflowsRes, salesRes, postsRes] =
          await Promise.all([
            getOrders(1, 100),
            getProducts(1, 1),
            getCashflows(1, 100),
            getSalesOrders(1, 100),
            getPosts(1, 1),
          ]);

        setRawData({
          orders:        Array.isArray(ordersRes.data)    ? ordersRes.data    : [],
          cashflows:     Array.isArray(cashflowsRes.data) ? cashflowsRes.data : [],
          salesOrders:   Array.isArray(salesRes.data)     ? salesRes.data     : [],
          totalProducts: productsRes.totalItems ?? 0,
          totalPosts:    postsRes.totalItems    ?? 0,
        });
      } catch (err) {
        setError(err.message ?? "Gagal memuat data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Tahun yang tersedia untuk dropdown chart ───────────────────────────────
  // Selalu include 2026 s/d tahun sekarang,
  // ditambah tahun-tahun yang benar-benar ada di data.
  const availableYears = (() => {
    const { orders, cashflows, salesOrders } = rawData;
    const yearSet = new Set();

    // Baseline: 2026 → currentYear
    for (let y = 2026; y <= currentYear; y++) yearSet.add(y);

    // Dari data aktual
    [...orders, ...cashflows, ...salesOrders].forEach((item) => {
      const y = toWIBYearKey(item.date_created);
      if (y) yearSet.add(y);
    });

    return Array.from(yearSet).sort((a, b) => a - b);
  })();

  // ── Derived stats ─────────────────────────────────────────────────────────
  const stats = (() => {
    const { orders, cashflows, salesOrders, totalProducts, totalPosts } = rawData;

    // Guard — pastikan selalu array
    const safeOrders      = Array.isArray(orders)      ? orders      : [];
    const safeCashflows   = Array.isArray(cashflows)   ? cashflows   : [];
    const safeSalesOrders = Array.isArray(salesOrders) ? salesOrders : [];

    // ── Filter stat cards berdasarkan dateRange ──
    const fromStr = dateRange.from
      ? dateRange.from.toLocaleDateString("sv-SE")
      : null;
    const toStr = dateRange.to
      ? dateRange.to.toLocaleDateString("sv-SE")
      : null;

    const inRange = (dateStr) => {
      const d = toWIBDateStr(dateStr);
      if (!d) return false;
      if (fromStr && d < fromStr) return false;
      if (toStr   && d > toStr)   return false;
      return true;
    };

    const filteredOrders =
      fromStr || toStr ? safeOrders.filter((o) => inRange(o.date_created))      : safeOrders;
    const filteredCashflows =
      fromStr || toStr ? safeCashflows.filter((c) => inRange(c.date_created))   : safeCashflows;
    const filteredSales =
      fromStr || toStr ? safeSalesOrders.filter((o) => inRange(o.date_created)) : safeSalesOrders;

    // Stat cards
    const cashIncomeManual = filteredCashflows
      .filter((c) => getMetaValue(c.meta_data, "cashflow_type") === "income")
      .reduce((sum, c) => sum + parseFloat(c.total ?? 0), 0);

    const cashOutcome = filteredCashflows
      .filter((c) => getMetaValue(c.meta_data, "cashflow_type") === "outcome")
      .reduce((sum, c) => sum + parseFloat(c.total ?? 0), 0);

    const salesIncome = filteredSales
      .reduce((sum, o) => sum + parseFloat(o.total ?? 0), 0);

    const cashIncome = cashIncomeManual + salesIncome;
    const balance    = cashIncome - cashOutcome;

    // ── Monthly chart: 12 slot Jan–Des untuk chartYear ──────────────────────
    // Semua 12 bulan selalu muncul, nilai 0 jika tidak ada transaksi.
    const monthlyMap = {};
    for (let m = 1; m <= 12; m++) {
      const key = `${chartYear}-${String(m).padStart(2, "0")}`;
      monthlyMap[key] = { income: 0, outcome: 0 };
    }

    // Income manual
    safeCashflows
      .filter((c) => getMetaValue(c.meta_data, "cashflow_type") === "income")
      .forEach((c) => {
        const key = toWIBMonthKey(c.date_created);
        if (key && monthlyMap[key] !== undefined)
          monthlyMap[key].income += parseFloat(c.total ?? 0);
      });

    // Outcome manual
    safeCashflows
      .filter((c) => getMetaValue(c.meta_data, "cashflow_type") === "outcome")
      .forEach((c) => {
        const key = toWIBMonthKey(c.date_created);
        if (key && monthlyMap[key] !== undefined)
          monthlyMap[key].outcome += parseFloat(c.total ?? 0);
      });

    // Income dari sales orders WC
    safeSalesOrders.forEach((o) => {
      const key = toWIBMonthKey(o.date_created);
      if (key && monthlyMap[key] !== undefined)
        monthlyMap[key].income += parseFloat(o.total ?? 0);
    });

    const monthlyChart = Object.entries(monthlyMap).map(
      ([month, { income, outcome }]) => ({
        month,
        income,
        outcome,
        saldo: income - outcome,
      })
    );
    // sudah terurut Jan→Des karena key dibuat berurutan di loop atas

    return {
      totalOrders:    safeOrders.length,
      totalProducts:  totalProducts ?? 0,
      totalPosts:     totalPosts    ?? 0,
      cashIncome,
      cashOutcome,
      balance,
      recentOrders:    safeOrders.slice(0, 5),
      recentCashflows: safeCashflows.slice(0, 5),
      monthlyChart,
    };
  })();

  return {
    stats,
    loading,
    error,
    dateRange,
    setDateRange,
    chartYear,
    setChartYear,
    availableYears,
  };
}