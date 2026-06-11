import { Link } from "react-router-dom";
import { PlusCircle, Pencil, Trash2, Package, Search, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useProducts } from "@/hooks/useKatalog";
import {
  PageHeader,
  DataTable,
  Pagination,
  StatusBadge,
  CurrencyDisplay,
  ErrorAlert,
} from "@/components/shared";

export default function KatalogPage() {
  const {
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
  } = useProducts();

  const columns = [
    {
      key: "product",
      label: "Produk",
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.images?.[0]?.src ? (
            <img
              src={row.images[0].src}
              alt={row.name}
              className="w-10 h-10 rounded-md object-cover border"
            />
          ) : (
            <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
              <Package className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          <div>
            <p className="font-medium line-clamp-1">{row.name}</p>
            <p className="text-xs text-muted-foreground">
              SKU: {row.sku || "-"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      label: "Harga",
      render: (row) => (
        <div>
          <CurrencyDisplay amount={row.regular_price} />
          {row.sale_price && (
            <p className="text-xs text-green-600">
              Sale: <CurrencyDisplay amount={row.sale_price} />
            </p>
          )}
        </div>
      ),
    },
    {
      key: "stock",
      label: "Stok",
      render: (row) =>
        row.manage_stock ? (
          <span
            className={
              row.stock_quantity > 0 ? "text-green-600" : "text-red-500"
            }
          >
            {row.stock_quantity ?? 0}
          </span>
        ) : (
          <span className="text-muted-foreground">Tidak dikelola</span>
        ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      label: "Aksi  ",
      render: (row) => (
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="icon" asChild>
            <a href={row.permalink} target="_blank" rel="noopener noreferrer">
              <Eye className="w-4 h-4" />
            </a>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/katalog/edit/${row.id}`}>
              <Pencil className="w-4 h-4" />
            </Link>
          </Button>
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
                <AlertDialogTitle>Hapus Produk?</AlertDialogTitle>
                <AlertDialogDescription>
                  Produk ini akan dihapus permanen dari WooCommerce.
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
      <PageHeader
        title="Katalog Produk"
        description={`${totalItems} produk tersedia`}
      />

      {/* Toolbar: search + tombol tambah — di luar PageHeader */}
      <div className="flex flex-col justify-end sm:flex-row sm:items-center gap-2 mb-4 ">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link to="/katalog/create">
            <PlusCircle className="w-4 h-4 mr-2" />
            Tambah Produk
          </Link>
        </Button>
      </div>

      <ErrorAlert message={error} />

      <DataTable columns={columns} data={products} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
