import { useLocation } from "react-router-dom";

const LABELS = {
  dashboard: "Dashboard",
  order: "Order",
  katalog: "Katalog",
  blog: "Blog",
  cashflow: "Cashflow",
  create: "Tambah Baru",
  edit: "Edit",
};

export function useBreadcrumb() {
  const { pathname } = useLocation();

  const segments = pathname.split("/").filter(Boolean);

  return segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const label = LABELS[seg] ?? seg; // fallback ke segment asli (misal ID)
    const isLast = i === segments.length - 1;
    return { href, label, isLast };
  });
}