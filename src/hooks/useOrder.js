import { useState, useEffect, useCallback } from "react";
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  getProducts,
  createCashflow,
} from "@/lib/woocommerce";

/* ==============================
   LIST ORDERS
============================== */
export function useOrders(perPage = 10) {
  const [orders, setOrders]             = useState([]);
  const [allOrders, setAllOrders]       = useState([]); // semua data mentah dari API
  const [page, setPage]                 = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("any");

  // Fetch SEMUA order sekaligus — tidak bergantung pada `page`
  // sehingga frontend filtering + pagination bisa bekerja penuh
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // per_page=100 adalah maksimum WooCommerce REST API.
      // Kalau total order > 100, lakukan multi-fetch di bawah.
      const first = await getOrders(1, 100);
      let all = [...first.data];

      // Jika ada lebih dari 1 halaman, ambil sisanya secara paralel
      if (first.totalPages > 1) {
        const pageNums = Array.from(
          { length: first.totalPages - 1 },
          (_, i) => i + 2
        );
        const rest = await Promise.all(
          pageNums.map((p) => getOrders(p, 100))
        );
        rest.forEach((r) => all.push(...r.data));
      }

      setAllOrders(all);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []); // ← tidak ada dependency page/perPage; fetch ulang hanya saat refresh

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filter frontend + slice untuk halaman aktif
  useEffect(() => {
    let filtered = [...allOrders];

    const q = search.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter((order) => {
        const fullName = `${order.billing?.first_name ?? ""} ${
          order.billing?.last_name ?? ""
        }`.toLowerCase();
        const id = String(order.id);
        return fullName.includes(q) || id.includes(q);
      });
    }

    if (statusFilter && statusFilter !== "any") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // totalPages dihitung dari data yang sudah difilter
    const total = Math.ceil(filtered.length / perPage) || 1;
    setTotalPages(total);

    // Pastikan page aktif tidak melebihi total halaman baru
    const safePage = page > total ? total : page;

    // Slice untuk halaman aktif
    const start = (safePage - 1) * perPage;
    setOrders(filtered.slice(start, start + perPage));
  }, [allOrders, search, statusFilter, page, perPage]);

  // Reset ke halaman 1 setiap kali filter/search berubah
  const handleSetSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleSetStatusFilter = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  const updateStatus = async (id, status) => {
    await updateOrder(id, { status });
    fetchOrders();
  };

  const remove = async (id) => {
    await deleteOrder(id);
    fetchOrders();
  };

  return {
    orders,
    page,
    setPage,
    totalPages,
    loading,
    error,
    search,
    setSearch: handleSetSearch,
    statusFilter,
    setStatusFilter: handleSetStatusFilter,
    refresh: fetchOrders,
    updateStatus,
    remove,
  };
}

/* ==============================
   PRODUCT PICKER untuk order
============================== */
export function useProductPicker() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getProducts(1, 50);
        setProducts(res.data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return { filtered, loading, search, setSearch };
}

/* ==============================
   ORDER FORM (create + edit)
============================== */
export function useOrderForm(editId = null) {
  const [billing, setBilling] = useState({
    first_name: "",
    last_name:  "",
    email:      "",
    phone:      "",
    address_1:  "",
    address_2:  "",
    city:       "",
    state:      "",
    postcode:   "",
    country:    "ID",
  });

  const [shipping, setShipping] = useState({
    first_name: "",
    last_name:  "",
    address_1:  "",
    address_2:  "",
    city:       "",
    state:      "",
    postcode:   "",
    country:    "ID",
  });

  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [cart, setCart]                     = useState([]);
  const [status, setStatus]                 = useState("pending");
  const [paymentMethod, setPaymentMethod]   = useState("cod");
  const [customerNote, setCustomerNote]     = useState("");
  const [transactionId, setTransactionId]   = useState("");
  const [saving, setSaving]                 = useState(false);
  const [loadingEdit, setLoadingEdit]       = useState(false);
  const [error, setError]                   = useState(null);

  useEffect(() => {
    if (!editId) return;

    const loadOrder = async () => {
      setLoadingEdit(true);
      try {
        const order = await getOrderById(editId);

        setBilling({
          first_name: order.billing?.first_name ?? "",
          last_name:  order.billing?.last_name  ?? "",
          email:      order.billing?.email      ?? "",
          phone:      order.billing?.phone      ?? "",
          address_1:  order.billing?.address_1  ?? "",
          address_2:  order.billing?.address_2  ?? "",
          city:       order.billing?.city       ?? "",
          state:      order.billing?.state      ?? "",
          postcode:   order.billing?.postcode   ?? "",
          country:    order.billing?.country    ?? "ID",
        });

        const s = order.shipping ?? {};
        setShipping({
          first_name: s.first_name ?? "",
          last_name:  s.last_name  ?? "",
          address_1:  s.address_1  ?? "",
          address_2:  s.address_2  ?? "",
          city:       s.city       ?? "",
          state:      s.state      ?? "",
          postcode:   s.postcode   ?? "",
          country:    s.country    ?? "ID",
        });

        const isSame =
          (!s.address_1 || s.address_1 === order.billing?.address_1) &&
          (!s.city      || s.city      === order.billing?.city);
        setSameAsShipping(isSame);

        setStatus(order.status ?? "pending");
        setPaymentMethod(order.payment_method ?? "cod");
        setCustomerNote(order.customer_note ?? "");
        setTransactionId(order.transaction_id ?? "");

        setCart(
          (order.line_items ?? []).map((item) => ({
            product: {
              id:            item.product_id,
              name:          item.name,
              price:         item.price,
              regular_price: item.price,
              images:        [],
            },
            quantity: item.quantity,
          }))
        );
      } catch (err) {
        setError("Gagal memuat data order: " + err.message);
      } finally {
        setLoadingEdit(false);
      }
    };

    loadOrder();
  }, [editId]);

  const handleBillingChange = (key, value) => {
    setBilling((b) => ({ ...b, [key]: value }));
    if (sameAsShipping) setShipping((s) => ({ ...s, [key]: value }));
  };

  const handleShippingChange = (key, value) =>
    setShipping((s) => ({ ...s, [key]: value }));

  const toggleSameAsShipping = (checked) => {
    setSameAsShipping(checked);
    if (checked) setShipping({ ...billing });
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQty = (productId, quantity) => {
    if (quantity < 1) { removeFromCart(productId); return; }
    setCart((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
    );
  };

  const removeFromCart = (productId) =>
    setCart((prev) => prev.filter((i) => i.product.id !== productId));

  const cartTotal = cart.reduce((sum, i) => {
    const price = parseFloat(i.product.price ?? i.product.regular_price ?? 0);
    return sum + price * i.quantity;
  }, 0);

  const save = async () => {
    if (!billing.first_name.trim()) {
      setError("Nama pembeli wajib diisi.");
      return null;
    }
    if (!editId && cart.length === 0) {
      setError("Tambahkan minimal 1 produk ke cart.");
      return null;
    }

    setSaving(true);
    setError(null);
    try {
      const payload = {
        billing,
        shipping: sameAsShipping ? billing : shipping,
        status,
        payment_method: paymentMethod,
        payment_method_title:
          paymentMethod === "cod"  ? "Cash on Delivery" :
          paymentMethod === "bacs" ? "Transfer Bank"    : "Pembayaran Manual",
        customer_note:  customerNote,
        transaction_id: transactionId,
        ...(cart.length > 0 && {
          line_items: cart.map((i) => ({
            product_id: Number(i.product.id),
            quantity:   Number(i.quantity),
          })),
        }),
      };

      const order = editId
        ? await updateOrder(editId, payload)
        : await createOrder(payload);

      if (!editId && status === "completed" && order.total) {
        await createCashflow({
          amount: parseInt(order.total, 10),
          type:   "income",
          note:   `Order #${order.id} – ${billing.first_name} ${billing.last_name}`,
        });
      }

      return order;
    } catch (err) {
      setError(err.response?.data?.message ?? err.message ?? "Gagal menyimpan order.");
      return null;
    } finally {
      setSaving(false);
    }
  };

  return {
    billing, handleBillingChange,
    shipping, handleShippingChange,
    sameAsShipping, toggleSameAsShipping,
    cart, addToCart, updateQty, removeFromCart, cartTotal,
    status, setStatus,
    paymentMethod, setPaymentMethod,
    customerNote, setCustomerNote,
    transactionId, setTransactionId,
    saving, loadingEdit, error,
    save,
    isEditMode: !!editId,
  };
}