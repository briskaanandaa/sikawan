import { Link } from "react-router-dom";
import {
  PlusCircle,
  Eye,
  Trash2,
  Pencil,
  MapPin,
  CreditCard,
  Package,
  User,
  Receipt,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useOrders } from "@/hooks/useOrder";
import {
  PageHeader,
  DataTable,
  Pagination,
  CurrencyDisplay,
  ErrorAlert,
} from "@/components/shared";
import { formatDateTime } from "@/lib/date";

// ─── Konstanta ────────────────────────────────────────────────────────────────

const ORDER_STATUSES = [
  "pending",
  "processing",
  "on-hold",
  "completed",
  "cancelled",
  "refunded",
  "failed",
];

const STATUS_LABELS = {
  pending: "Pending",
  processing: "Diproses",
  "on-hold": "Ditahan",
  completed: "Selesai",
  cancelled: "Dibatalkan",
  refunded: "Dikembalikan",
  failed: "Gagal",
};

const STATUS_COLORS = {
  pending: "bg-orange-100 text-orange-700",
  processing: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-600",
  "on-hold": "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
};

const PAYMENT_LABELS = {
  cod: "Cash on Delivery",
  bacs: "Transfer Bank",
  cheque: "Tunai / Manual",
};

// ─── Section ──────────────────────────────────────────────────────────────────

function Section({ icon: Icon, title, children }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
        <Icon className="w-3.5 h-3.5" />
        {title}
      </p>
      {children}
    </div>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 text-sm py-0.5">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

// ─── OrderDetail ──────────────────────────────────────────────────────────────

function OrderDetail({ order }) {
  if (!order) return null;

  const b = order.billing ?? {};
  const s = order.shipping ?? {};

  const billingAddress = [
    b.address_1,
    b.address_2,
    b.city,
    b.state,
    b.postcode,
    b.country,
  ]
    .filter(Boolean)
    .join(", ");
  const shippingAddress = [
    s.address_1,
    s.address_2,
    s.city,
    s.state,
    s.postcode,
    s.country,
  ]
    .filter(Boolean)
    .join(", ");
  const isSameAddress = billingAddress === shippingAddress || !shippingAddress;
  const paymentLabel =
    order.payment_method_title ||
    PAYMENT_LABELS[order.payment_method] ||
    order.payment_method ||
    "-";
  const statusColor =
    STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600";
  const statusLabel = STATUS_LABELS[order.status] ?? order.status;

  return (
    <div className="space-y-5 text-sm p-4">
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor}`}
        >
          {statusLabel}
        </span>
        <p className="text-xs text-muted-foreground">
          {formatDateTime(order.date_created)}
        </p>
      </div>

      <Separator />

      <Section icon={User} title="Data Pembeli">
        <Row
          label="Nama"
          value={`${b.first_name ?? ""} ${b.last_name ?? ""}`.trim() || "-"}
        />
        <Row label="Email" value={b.email} />
        <Row label="Telepon" value={b.phone} />
      </Section>

      <Separator />

      <Section icon={MapPin} title="Alamat">
        {billingAddress ? (
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Billing</p>
            <p className="text-sm">{billingAddress}</p>
          </div>
        ) : (
          <p className="text-muted-foreground text-xs">-</p>
        )}
        {!isSameAddress && (
          <div className="mt-2">
            <p className="text-xs text-muted-foreground mb-0.5">Pengiriman</p>
            <p className="text-sm">{shippingAddress}</p>
          </div>
        )}
        {isSameAddress && shippingAddress && (
          <p className="text-xs text-muted-foreground mt-1 italic">
            Alamat pengiriman sama dengan billing
          </p>
        )}
      </Section>

      <Separator />

      <Section icon={CreditCard} title="Pembayaran">
        <Row label="Metode" value={paymentLabel} />
        <Row label="Kode Transaksi" value={order.transaction_id || null} />
        <Row label="Catatan" value={order.customer_note || null} />
      </Section>

      <Separator />

      <Section icon={Package} title="Item Pesanan">
        {order.line_items?.length > 0 ? (
          <div className="space-y-2">
            {order.line_items.map((item) => (
              <div key={item.id} className="flex justify-between gap-2">
                <span>
                  {item.name}
                  <span className="text-muted-foreground ml-1">
                    ×{item.quantity}
                  </span>
                </span>
                <CurrencyDisplay amount={item.total} className="shrink-0" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-xs">Tidak ada item produk</p>
        )}
      </Section>

      <Section icon={Receipt} title="Total Pesanan">
        {parseFloat(order.discount_total) > 0 && (
          <div className="flex justify-between text-sm py-0.5">
            <span className="text-muted-foreground">Diskon</span>
            <CurrencyDisplay
              amount={order.discount_total}
              className="text-green-600"
            />
          </div>
        )}
        {parseFloat(order.shipping_total) > 0 && (
          <div className="flex justify-between text-sm py-0.5">
            <span className="text-muted-foreground">Ongkir</span>
            <CurrencyDisplay amount={order.shipping_total} />
          </div>
        )}
        {parseFloat(order.total_tax) > 0 && (
          <div className="flex justify-between text-sm py-0.5">
            <span className="text-muted-foreground">Pajak</span>
            <CurrencyDisplay amount={order.total_tax} />
          </div>
        )}
        <div className="flex justify-between font-bold text-base pt-1 mt-1 border-t">
          <span>Total</span>
          <CurrencyDisplay amount={order.total} className="text-primary" />
        </div>
      </Section>
    </div>
  );
}

// ─── OrderPage ────────────────────────────────────────────────────────────────

export default function OrderPage() {
  const {
    orders,
    page,
    setPage,
    totalPages,
    loading,
    error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    updateStatus,
    remove,
    refresh,
  } = useOrders();

  const columns = [
    {
      key: "id",
      label: "Order #",
      render: (row) => (
        <div>
          <p className="font-medium">#{row.id}</p>
          <span className="text-xs text-muted-foreground">
            {formatDateTime(row.date_created)}
          </span>
        </div>
      ),
    },
    {
      key: "customer",
      label: "Pembeli",
      render: (row) => (
        <div>
          <p>
            {row.billing?.first_name} {row.billing?.last_name}
          </p>
          <p className="text-xs text-muted-foreground">{row.billing?.email}</p>
        </div>
      ),
    },
    {
      key: "total",
      label: "Total",
      render: (row) => (
        <CurrencyDisplay amount={row.total} className="font-medium" />
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <Select
          value={row.status}
          onValueChange={(v) => updateStatus(row.id, v)}
        >
          <SelectTrigger className="w-36 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s] ?? s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "actions",
      label: "Aksi",
      render: (row) => (
        <div className="flex gap-1 justify-end">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" title="Lihat detail">
                <Eye className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
              <SheetHeader className="mb-4">
                <SheetTitle className="flex items-center gap-2">
                  Order #{row.id}
                  <span className="text-xs font-normal text-muted-foreground">
                    {PAYMENT_LABELS[row.payment_method] ?? row.payment_method}
                  </span>
                </SheetTitle>
              </SheetHeader>
              <OrderDetail order={row} />
            </SheetContent>
          </Sheet>

          <Button variant="ghost" size="icon" title="Edit order" asChild>
            <Link to={`/order/edit/${row.id}`}>
              <Pencil className="w-4 h-4" />
            </Link>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-600"
                title="Hapus order"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus Order #{row.id}?</AlertDialogTitle>
                <AlertDialogDescription>
                  Order ini akan dihapus permanen. Tindakan ini tidak dapat
                  diurungkan.
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

  return (
    <div>
      {/* PageHeader: hanya title & deskripsi */}
      <PageHeader title="Order" description="Kelola pesanan yang masuk" />

      {/* Toolbar: search + filter + tombol — di luar PageHeader */}
      <div className="flex flex-col justify-end sm:flex-row sm:items-center gap-2 mb-4">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau ID order..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 h-9 text-sm">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Semua Status</SelectItem>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s] ?? s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button asChild className="w-full sm:w-auto">
          <Link to="/order/create">
            <PlusCircle className="w-4 h-4 mr-2" />
            Buat Order
          </Link>
        </Button>
      </div>

      <ErrorAlert message={error} />

      <DataTable columns={columns} data={orders} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
