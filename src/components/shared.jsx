// components/shared.jsx

import {
  Pagination as ShadPagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// components/shared/DataTable.jsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ─── PageHeader ───────────────────────────────────────────────────────────────

export function PageHeader({ title, description, children }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {children && <div className="flex gap-2">{children}</div>}
    </div>
  );
}

// ─── DataTable ────────────────────────────────────────────────────────────────

export function DataTable({ columns, data, loading }) {
  return (
    <div className="rounded-lg border overflow-x-auto">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={
                  col.key === "actions"
                    ? "sticky text-center center right-0 bg-background w-[100px]"
                    : ""
                }
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="py-8 text-center text-muted-foreground"
              >
                Memuat data…
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="py-8 text-center text-muted-foreground"
              >
                Tidak ada data
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, i) => (
              <TableRow key={row.id ?? i}>
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={
                      col.key === "actions"
                        ? "sticky right-0 bg-background shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)]"
                        : ""
                    }
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [1];

    if (page > 3) pages.push("...");

    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    ) {
      pages.push(i);
    }

    if (page < totalPages - 2) pages.push("...");

    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="mt-4 flex justify-end">
      <ShadPagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(page - 1)}
              className={
                page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
              }
            >
              Sebelumnya
            </PaginationPrevious>
          </PaginationItem>

          {getPages().map((p, i) => (
            <PaginationItem key={i}>
              {p === "..." ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  isActive={p === page}
                  onClick={() => onPageChange(p)}
                  className="cursor-pointer"
                >
                  {p}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(page + 1)}
              className={
                page >= totalPages
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            >
              Berikutnya
            </PaginationNext>
          </PaginationItem>
        </PaginationContent>
      </ShadPagination>
    </div>
  );
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────

const STATUS_COLORS = {
  publish: "bg-green-100 text-green-700",
  published: "bg-green-100 text-green-700",
  draft: "bg-yellow-100 text-yellow-700",
  pending: "bg-orange-100 text-orange-700",
  completed: "bg-green-100 text-green-700",
  processing: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-600",
  "on-hold": "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
  private: "bg-purple-100 text-purple-700",
  income: "bg-emerald-100 text-emerald-700",
  outcome: "bg-rose-100 text-rose-700",
};

const STATUS_LABELS = {
  publish: "Aktif",
  published: "Aktif",
  draft: "Draf",
  pending: "Menunggu",
  completed: "Selesai",
  processing: "Diproses",
  cancelled: "Dibatalkan",
  refunded: "Dikembalikan",
  "on-hold": "Ditahan",
  failed: "Gagal",
  private: "Privat",
  income: "Pemasukan",
  outcome: "Pengeluaran",
};

export function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600";
  const label = STATUS_LABELS[status] ?? status;
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${color}`}
    >
      {label}
    </span>
  );
}

// ─── FormField ────────────────────────────────────────────────────────────────

export function FormField({ label, required, children, hint }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

// ─── CurrencyDisplay ──────────────────────────────────────────────────────────

export function formatIDR(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function CurrencyDisplay({ amount, className = "" }) {
  return <span className={className}>{formatIDR(amount)}</span>;
}

// ─── ErrorAlert ───────────────────────────────────────────────────────────────

export function ErrorAlert({ message }) {
  if (!message) return null;
  return (
    <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm mb-4">
      {message}
    </div>
  );
}
