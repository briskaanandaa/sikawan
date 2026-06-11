// hooks/useKatalog.js
import { useState, useEffect, useCallback, useRef } from "react";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadMedia,
} from "@/lib/woocommerce";

/* ─────────────────────────────────────────
   useProducts  — untuk halaman list katalog
───────────────────────────────────────── */
export function useProducts() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  // debounce search
  const searchRef = useRef(search);
  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = searchRef.current
        ? { search: searchRef.current }
        : {};
      const result = await getProducts(page, 10, filters);
      setProducts(result.data);
      setTotalPages(result.totalPages);
      setTotalItems(result.totalItems);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  // reset ke page 1 saat search berubah
  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load, search]);

  const remove = async (id) => {
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setTotalItems((n) => n - 1);
    } catch (e) {
      setError(e.message);
    }
  };

  return {
    products,
    page,
    setPage,
    totalPages,
    totalItems,
    loading,
    error,
    search,
    setSearch,
    remove,
  };
}

/* ─────────────────────────────────────────
   useProductForm  — untuk halaman create/edit
───────────────────────────────────────── */
const EMPTY_FORM = {
  name: "",
  short_description: "",
  description: "",
  regular_price: "",
  sale_price: "",
  sku: "",
  manage_stock: false,
  stock_quantity: "",
  status: "publish",
  images: [],
  // categories disimpan sebagai number[] di sini;
  // saat save dikirim sebagai [{ id }] ke WooCommerce
  categories: [],
};

export function useProductForm(id = null) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Load produk kalau mode edit
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    getProductById(id)
      .then((p) => {
        if (cancelled) return;
        setForm({
          name: p.name ?? "",
          short_description: p.short_description ?? "",
          description: p.description ?? "",
          regular_price: p.regular_price ?? "",
          sale_price: p.sale_price ?? "",
          sku: p.sku ?? "",
          manage_stock: p.manage_stock ?? false,
          stock_quantity: p.stock_quantity ?? "",
          status: p.status ?? "publish",
          // images: simpan { id, src } agar preview & upload konsisten
          images: (p.images ?? []).map((img) => ({
            id: img.id,
            src: img.src,
          })),
          // categories: ambil hanya id-nya
          categories: (p.categories ?? []).map((c) => c.id),
        });
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (file) => {
    // Placeholder dulu supaya user tahu sedang upload
    const placeholder = { id: null, src: null };
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, placeholder],
    }));

    try {
      const { id: mediaId, src } = await uploadMedia(file);
      setForm((prev) => {
        const images = [...prev.images];
        // ganti placeholder terakhir
        const idx = images.lastIndexOf(placeholder);
        if (idx !== -1) images[idx] = { id: mediaId, src };
        return { ...prev, images };
      });
    } catch (e) {
      // hapus placeholder kalau upload gagal
      setForm((prev) => ({
        ...prev,
        images: prev.images.filter((img) => img !== placeholder),
      }));
      setError(`Upload gagal: ${e.message}`);
    }
  };

  const removeImage = (index) => {
    setForm((prev) => {
      const images = [...prev.images];
      images.splice(index, 1);
      return { ...prev, images };
    });
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        short_description: form.short_description,
        description: form.description,
        regular_price: String(form.regular_price),
        sale_price: String(form.sale_price),
        sku: form.sku,
        manage_stock: form.manage_stock,
        stock_quantity: form.manage_stock
          ? Number(form.stock_quantity)
          : null,
        status: form.status,
        // WooCommerce menerima images sebagai [{ id }] atau [{ src }]
        images: form.images
          .filter((img) => img.id || img.src)
          .map((img) => (img.id ? { id: img.id } : { src: img.src })),
        // WooCommerce menerima categories sebagai [{ id }]
        categories: form.categories.map((catId) => ({ id: catId })),
      };

      if (id) {
        await updateProduct(id, payload);
      } else {
        await createProduct(payload);
      }
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    form,
    handleChange,
    handleImageUpload,
    removeImage,
    loading,
    saving,
    error,
    save,
  };
}