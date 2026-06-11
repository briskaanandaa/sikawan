import { useState, useEffect, useCallback } from "react";
import {
  getCashflows,
  createCashflow,
  deleteCashflow,
  getSalesOrders,
} from "@/lib/woocommerce";

/* ==============================
   LIST CASHFLOWS
   Menggabungkan:
   1. Cashflow manual (is_cashflow=yes) — pemasukan & pengeluaran manual
   2. Order penjualan WooCommerce (completed) — otomatis jadi pemasukan
============================== */
export function useCashflows() {
  const [cashflows, setCashflows]       = useState([]);
  const [salesOrders, setSalesOrders]   = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);

  // Ringkasan gabungan: cashflow manual + order penjualan
  const summary = (() => {
    let income  = 0;
    let outcome = 0;

    for (const cf of cashflows) {
      const type   = cf.meta_data?.find((m) => m.key === "cashflow_type")?.value;
      const amount = parseFloat(cf.total ?? "0") || 0;
      if (type === "income")  income  += amount;
      if (type === "outcome") outcome += amount;
    }

    for (const order of salesOrders) {
      income += parseFloat(order.total ?? "0") || 0;
    }

    return { income, outcome, balance: income - outcome };
  })();

  // Fetch SEMUA data sekaligus — pagination ditangani di CashflowPage
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch halaman pertama keduanya secara paralel
      const [cfFirst, salesFirst] = await Promise.all([
        getCashflows(1, 100),
        getSalesOrders(1, 100),
      ]);

      let allCashflows   = [...cfFirst.data];
      let allSalesOrders = [...salesFirst.data];

      // Jika ada lebih dari 1 halaman, fetch sisa secara paralel
      const cfExtraPages = cfFirst.totalPages > 1
        ? Array.from({ length: cfFirst.totalPages - 1 }, (_, i) => i + 2)
        : [];

      const salesExtraPages = salesFirst.totalPages > 1
        ? Array.from({ length: salesFirst.totalPages - 1 }, (_, i) => i + 2)
        : [];

      const [cfRest, salesRest] = await Promise.all([
        Promise.all(cfExtraPages.map((p) => getCashflows(p, 100))),
        Promise.all(salesExtraPages.map((p) => getSalesOrders(p, 100))),
      ]);

      cfRest.forEach((r)    => allCashflows.push(...r.data));
      salesRest.forEach((r) => allSalesOrders.push(...r.data));

      setCashflows(allCashflows);
      setSalesOrders(allSalesOrders);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []); // ← tidak ada dependency page; fetch ulang hanya saat refresh/remove

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const remove = async (id) => {
    await deleteCashflow(id);
    fetchAll();
  };

  return {
    cashflows,     // semua cashflow manual
    salesOrders,   // semua order penjualan WC
    summary,
    loading,
    error,
    refresh: fetchAll,
    remove,
  };
}

/* ==============================
   CASHFLOW FORM
============================== */
export function useCashflowForm() {
  const [form, setForm] = useState({
    amount: "",
    type:   "income",
    note:   "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState(null);

  const handleChange = (key, value) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    const amount = parseInt(form.amount, 10);

    if (!amount || amount <= 0) {
      setError("Jumlah harus lebih dari 0.");
      return false;
    }
    if (!form.note.trim()) {
      setError("Keterangan / judul tidak boleh kosong.");
      return false;
    }

    setSaving(true);
    setError(null);
    try {
      await createCashflow({
        amount,
        type: form.type,
        note: form.note,
      });
      return true;
    } catch (err) {
      const msg =
        err.response?.data?.message ?? err.message ?? "Gagal menyimpan.";
      setError(msg);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const reset = () =>
    setForm({ amount: "", type: "income", note: "" });

  return {
    form,
    handleChange,
    saving,
    error,
    save,
    reset,
  };
}