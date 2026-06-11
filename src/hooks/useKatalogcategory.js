// hooks/useKatalogCategory.js
import { useState, useEffect, useCallback } from "react";
import {
  getProductCategories,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
} from "@/lib/woocommerce";

export function useProductCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProductCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (name, parentId = 0) => {
    const cat = await createProductCategory(name, parentId);
    setCategories((prev) =>
      [...prev, cat].sort((a, b) => a.name.localeCompare(b.name))
    );
    return cat;
  };

  const update = async (id, name) => {
    const cat = await updateProductCategory(id, name);
    setCategories((prev) => prev.map((c) => (c.id === id ? cat : c)));
    return cat;
  };

  const remove = async (id) => {
    await deleteProductCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  return { categories, loading, error, reload: load, create, update, remove };
}