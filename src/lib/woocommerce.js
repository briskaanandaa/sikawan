import axios from "axios";

/* =============================
   WOOCOMMERCE CLIENT
============================= */
export const wc = axios.create({
  baseURL: import.meta.env.VITE_WC_API_URL,
  auth: {
    username: import.meta.env.VITE_WC_CONSUMER_KEY,
    password: import.meta.env.VITE_WC_CONSUMER_SECRET,
  },
});

// Tangkap response HTML sebelum tersebar ke seluruh app
wc.interceptors.response.use(
  (res) => {
    if (typeof res.data === "string" && res.data.startsWith("<!")) {
      return Promise.reject(
        new Error("API mengembalikan HTML — cek VITE_WC_API_URL di .env")
      );
    }
    return res;
  },
  (err) => {
    const msg = err.response?.data?.message || err.message;
    return Promise.reject(new Error(msg));
  }
);

/* =============================
   HELPERS
============================= */
const normalizeArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

export const getMetaValue = (metaData = [], key) =>
  metaData?.find((m) => m.key === key)?.value ?? null;

/**
 * Fetch semua halaman dari sebuah endpoint WooCommerce secara paralel.
 * Digunakan oleh getCashflows dan getSalesOrders agar tidak ada data
 * yang terlewat akibat filter client-side memotong per-halaman.
 *
 * @param {string} endpoint  — misal "/orders"
 * @param {object} params    — query params tambahan
 * @returns {Promise<Array>} — semua item dari semua halaman
 */
async function fetchAllPages(endpoint, params = {}) {
  // Halaman pertama
  const first = await wc.get(endpoint, {
    params: { ...params, page: 1, per_page: 100 },
  });

  const all = [...normalizeArray(first.data)];
  const totalPages = Number(first.headers["x-wp-totalpages"] || 1);

  if (totalPages > 1) {
    const rest = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, i) =>
        wc.get(endpoint, { params: { ...params, page: i + 2, per_page: 100 } })
      )
    );
    rest.forEach((r) => all.push(...normalizeArray(r.data)));
  }

  return all;
}

/* =========================================================
   ===================== CORE WOOCOMMERCE ===================
   (JANGAN DIUBAH – UNTUK PRODUK & PENJUALAN)
========================================================= */

/* =============================
   PRODUCTS
============================= */
export const getProducts = async (page = 1, perPage = 10, filters = {}) => {
  const res = await wc.get("/products", {
    params: { page, per_page: perPage, ...filters },
  });
  return {
    data: res.data,
    totalPages: Number(res.headers["x-wp-totalpages"] || 1),
    totalItems: Number(res.headers["x-wp-total"] || 0),
  };
};

export const getProductById = async (id) => {
  const res = await wc.get(`/products/${id}`);
  return res.data;
};

export const createProduct = async (payload) => {
  const res = await wc.post("/products", payload);
  return res.data;
};

export const updateProduct = async (id, payload) => {
  const res = await wc.put(`/products/${id}`, payload);
  return res.data;
};

export const deleteProduct = async (id) => {
  const res = await wc.delete(`/products/${id}`, { params: { force: true } });
  return res.data;
};

/* =============================
   PRODUCT CATEGORIES
============================= */
export const getProductCategories = async () => {
  const res = await wc.get("/products/categories", {
    params: { per_page: 100, orderby: "name", order: "asc" },
  });
  return res.data;
};

export const createProductCategory = async (name, parentId = 0) => {
  const res = await wc.post("/products/categories", {
    name,
    parent: parentId,
  });
  return res.data;
};

export const updateProductCategory = async (id, name) => {
  const res = await wc.put(`/products/categories/${id}`, { name });
  return res.data;
};

export const deleteProductCategory = async (id) => {
  const res = await wc.delete(`/products/categories/${id}`, {
    params: { force: true },
  });
  return res.data;
};

/* =============================
   UPLOAD MEDIA
============================= */
export const uploadMedia = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post(
    `${import.meta.env.VITE_WC_API_URL.replace("/wc/v3", "")}/wp/v2/media`,
    formData,
    {
      auth: {
        username: import.meta.env.VITE_WP_USERNAME,
        password: import.meta.env.VITE_WP_APP_PASSWORD,
      },
      headers: {
        "Content-Disposition": `attachment; filename="${file.name}"`,
      },
    }
  );

  return {
    id: res.data.id,
    src: res.data.source_url,
  };
};

/* =============================
   ORDERS (PENJUALAN BIASA)
   — Pagination per-halaman, filter client-side per batch
============================= */
export const getOrders = async (page = 1, perPage = 100) => {
  const res = await wc.get("/orders", {
    params: { page, per_page: perPage },
  });

  const allOrders = normalizeArray(res.data).filter(
    (order) =>
      !order.meta_data?.some(
        (m) => m.key === "is_cashflow" && m.value === "yes"
      )
  );

  return {
    data: allOrders,
    totalPages: Number(res.headers["x-wp-totalpages"] || 1),
  };
};

export const getOrderById = async (id) => {
  const res = await wc.get(`/orders/${id}`);
  return res.data;
};

export const createOrder = async (payload) => {
  const res = await wc.post("/orders", payload);
  return res.data;
};

export const updateOrder = async (id, payload) => {
  const res = await wc.put(`/orders/${id}`, payload);
  return res.data;
};

export const deleteOrder = async (id) => {
  const res = await wc.delete(`/orders/${id}`, { params: { force: true } });
  return res.data;
};

/* =========================================================
   ===================== CASHFLOW SYSTEM ====================
   — Semua fungsi di bawah menggunakan fetchAllPages agar
     filter client-side tidak memotong data per-halaman
========================================================= */

/**
 * Ambil semua cashflow manual (is_cashflow=yes) dari semua halaman.
 * totalPages dikembalikan berdasarkan jumlah data hasil filter,
 * bukan dari header API — karena filter dilakukan client-side.
 */
export const getCashflows = async (page = 1, perPage = 100) => {
  const all = await fetchAllPages("/orders");

  const filtered = all.filter((order) =>
    order.meta_data?.some(
      (m) => m.key === "is_cashflow" && m.value === "yes"
    )
  );

  return {
    data: filtered,
    totalPages: Math.ceil(filtered.length / perPage) || 1,
  };
};

export const createCashflow = async ({ amount, type, note = "" }) => {
  const label =
    note.trim() || (type === "income" ? "Pemasukan" : "Pengeluaran");

  const payload = {
    status: "completed",
    currency: "IDR",
    fee_lines: [
      {
        name: label,
        total: String(amount),
        tax_class: "",
        tax_status: "none",
      },
    ],
    meta_data: [
      { key: "is_cashflow", value: "yes" },
      { key: "cashflow_type", value: type },
      { key: "cashflow_note", value: note },
    ],
  };

  const res = await wc.post("/orders", payload);
  return res.data;
};

export const deleteCashflow = async (id) => {
  const res = await wc.delete(`/orders/${id}`, { params: { force: true } });
  return res.data;
};

/**
 * Ambil semua order penjualan WooCommerce (status=completed,
 * bukan cashflow manual) dari semua halaman.
 */
export const getSalesOrders = async (page = 1, perPage = 100) => {
  const all = await fetchAllPages("/orders", { status: "completed" });

  const filtered = all.filter(
    (order) =>
      !order.meta_data?.some(
        (m) => m.key === "is_cashflow" && m.value === "yes"
      )
  );

  return {
    data: filtered,
    totalPages: Math.ceil(filtered.length / perPage) || 1,
  };
};