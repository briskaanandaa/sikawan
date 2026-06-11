import { Link } from "react-router-dom";
import { useState } from "react";
import {
  PlusCircle,
  Trash2,
  TrendingUp,
  TrendingDown,
  Wallet,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { useCashflows } from "@/hooks/useCashflow";
import { getMetaValue } from "@/lib/woocommerce";
import { parseWPDate, formatDateTime } from "@/lib/date";
import {
  PageHeader,
  DataTable,
  StatusBadge,
  CurrencyDisplay,
  ErrorAlert,
  formatIDR,
} from "@/components/shared";
import StatCard from "@/components/StatCard";
import CashflowFilterBar from "@/components/cashflow/CashflowFilter";

const ITEMS_PER_PAGE = 10;

function isSameWIBDate(dateStr, filterDate) {
  if (!filterDate) return true;
  const d = parseWPDate(dateStr);
  if (!d || isNaN(d)) return false;
  const wib = d.toLocaleDateString("sv-SE", { timeZone: "Asia/Jakarta" });
  const ref = filterDate.toLocaleDateString("sv-SE", {
    timeZone: "Asia/Jakarta",
  });
  return wib === ref;
}

// ── Helper: render nomor halaman dengan ellipsis ──
function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3)
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export default function CashflowPage() {
  const { cashflows, salesOrders, summary, loading, error, remove } =
    useCashflows();

  // ── Filter state ──
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState(null);
  const [searchNote, setSearchNote] = useState("");

  // ── Pagination state (terpisah per tab) ──
  const [cashflowPage, setCashflowPage] = useState(1);
  const [salesPage, setSalesPage] = useState(1);

  // ── Filter cashflows ──
  const filteredCashflows = cashflows.filter((row) => {
    const type = getMetaValue(row.meta_data, "cashflow_type");
    const note = (
      getMetaValue(row.meta_data, "cashflow_note") ||
      row.fee_lines?.[0]?.name ||
      ""
    ).toLowerCase();

    if (typeFilter !== "all" && type !== typeFilter) return false;
    if (!isSameWIBDate(row.date_created, dateFilter)) return false;
    if (searchNote.trim() && !note.includes(searchNote.trim().toLowerCase()))
      return false;
    return true;
  });

  // ── Reset halaman saat filter berubah ──
  // (bisa pakai useEffect jika mau, tapi cara sederhana: clamp saja)
  const cashflowTotalPages = Math.max(
    1,
    Math.ceil(filteredCashflows.length / ITEMS_PER_PAGE),
  );
  const safeCashflowPage = Math.min(cashflowPage, cashflowTotalPages);

  const salesTotalPages = Math.max(
    1,
    Math.ceil(salesOrders.length / ITEMS_PER_PAGE),
  );
  const safeSalesPage = Math.min(salesPage, salesTotalPages);

  // ── Slice data sesuai halaman aktif ──
  const pagedCashflows = filteredCashflows.slice(
    (safeCashflowPage - 1) * ITEMS_PER_PAGE,
    safeCashflowPage * ITEMS_PER_PAGE,
  );

  const pagedSalesOrders = salesOrders.slice(
    (safeSalesPage - 1) * ITEMS_PER_PAGE,
    safeSalesPage * ITEMS_PER_PAGE,
  );

  // ── Kolom: cashflow manual ──
  const cashflowColumns = [
    {
      key: "date",
      label: "Tanggal",
      render: (row) => (
        <span className="text-sm">{formatDateTime(row.date_created)}</span>
      ),
    },
    {
      key: "type",
      label: "Jenis",
      render: (row) => {
        const type = getMetaValue(row.meta_data, "cashflow_type");
        return <StatusBadge status={type ?? "-"} />;
      },
    },
    {
      key: "note",
      label: "Keterangan",
      render: (row) => (
        <span className="text-sm line-clamp-1">
          {getMetaValue(row.meta_data, "cashflow_note") ||
            row.fee_lines?.[0]?.name ||
            "-"}
        </span>
      ),
    },
    {
      key: "amount",
      label: "Jumlah",
      render: (row) => {
        const type = getMetaValue(row.meta_data, "cashflow_type");
        return (
          <CurrencyDisplay
            amount={row.total}
            className={`font-semibold ${type === "income" ? "text-green-600" : "text-red-500"}`}
          />
        );
      },
    },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <div className="flex justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus Catatan?</AlertDialogTitle>
                <AlertDialogDescription>
                  Catatan arus kas ini akan dihapus permanen.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500 hover:bg-red-600"
                  onClick={() => remove(row.id)}
                >
                  Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  // ── Kolom: order WooCommerce ──
  const salesColumns = [
    {
      key: "date",
      label: "Tanggal",
      render: (row) => (
        <span className="text-sm">{formatDateTime(row.date_created)}</span>
      ),
    },
    {
      key: "id",
      label: "Order #",
      render: (row) => <span className="text-sm font-medium">#{row.id}</span>,
    },
    {
      key: "customer",
      label: "Pembeli",
      render: (row) => (
        <span className="text-sm line-clamp-1">
          {row.billing?.first_name
            ? `${row.billing.first_name} ${row.billing.last_name ?? ""}`.trim()
            : "-"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "total",
      label: "Total",
      render: (row) => (
        <CurrencyDisplay
          amount={row.total}
          className="font-semibold text-green-600"
        />
      ),
    },
  ];

  const hasFilter = typeFilter !== "all" || dateFilter || searchNote.trim();

  // ── Komponen Pagination shadcn ──
  function TablePagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;
    const pages = getPageNumbers(currentPage, totalPages);

    return (
      <Pagination className="mt-4 justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              className={
                currentPage === 1
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>

          {pages.map((page, idx) =>
            page === "..." ? (
              <PaginationItem key={`ellipsis-${idx}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={page === currentPage}
                  onClick={() => onPageChange(page)}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ),
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() =>
                onPageChange(Math.min(totalPages, currentPage + 1))
              }
              className={
                currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  }

  return (
    <div>
      {/* PageHeader: hanya title & deskripsi */}
      <PageHeader
        title="Arus Kas (Cashflow)"
        description="Rekap pemasukan, pengeluaran, dan transaksi WooCommerce"
      />

      {/* Toolbar: tombol catat — di luar PageHeader */}
      <div className="flex justify-end mb-4">
        <Button asChild className="w-full sm:w-auto">
          <Link to="/cashflow/create">
            <PlusCircle className="w-4 h-4 mr-2" />
            Catat Arus Kas
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={TrendingUp}
          label="Total Pemasukan"
          value={formatIDR(summary.income)}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          icon={TrendingDown}
          label="Total Pengeluaran"
          value={formatIDR(summary.outcome)}
          color="bg-red-100 text-red-500"
        />
        <StatCard
          icon={Wallet}
          label="Saldo"
          value={formatIDR(summary.balance)}
          color={
            summary.balance >= 0
              ? "bg-blue-100 text-blue-600"
              : "bg-orange-100 text-orange-600"
          }
        />
      </div>

      <ErrorAlert message={error} />

      <Tabs defaultValue="cashflow">
        <TabsList className="mb-4">
          <TabsTrigger value="cashflow" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Arus Kas
            {cashflows.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {cashflows.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sales" className="gap-2">
            <ShoppingCart className="w-4 h-4" />
            Penjualan
            {salesOrders.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {salesOrders.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Cashflow manual */}
        <TabsContent value="cashflow">
          <CashflowFilterBar
            searchNote={searchNote}
            onSearchNote={(v) => {
              setSearchNote(v);
              setCashflowPage(1);
            }}
            typeFilter={typeFilter}
            onTypeFilter={(v) => {
              setTypeFilter(v);
              setCashflowPage(1);
            }}
            dateFilter={dateFilter}
            onDateFilter={(v) => {
              setDateFilter(v);
              setCashflowPage(1);
            }}
          />

          {hasFilter && (
            <p className="text-xs text-muted-foreground mb-3">
              Menampilkan{" "}
              <span className="font-semibold text-foreground">
                {filteredCashflows.length}
              </span>{" "}
              dari{" "}
              <span className="font-semibold text-foreground">
                {cashflows.length}
              </span>{" "}
              catatan
            </p>
          )}

          <DataTable
            columns={cashflowColumns}
            data={pagedCashflows}
            loading={loading}
            emptyMessage="Tidak ada catatan yang sesuai filter."
          />
          <TablePagination
            currentPage={safeCashflowPage}
            totalPages={cashflowTotalPages}
            onPageChange={setCashflowPage}
          />
        </TabsContent>

        {/* Tab 2: Order penjualan */}
        <TabsContent value="sales">
          <DataTable
            columns={salesColumns}
            data={pagedSalesOrders}
            loading={loading}
            emptyMessage="Belum ada order yang selesai (completed) dari WooCommerce."
          />
          <TablePagination
            currentPage={safeSalesPage}
            totalPages={salesTotalPages}
            onPageChange={setSalesPage}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
