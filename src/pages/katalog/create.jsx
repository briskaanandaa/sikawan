// pages/katalog/create.jsx  (juga untuk edit: /katalog/edit/:id)
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, X, Loader2, Plus, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProductForm } from "@/hooks/useKatalog";
import { CategoryManager } from "@/components/category-manager";

// ---------------------------------------------------------------------------
// Helper: FormField wrapper untuk konsistensi label + hint di seluruh halaman
// ---------------------------------------------------------------------------
function FormField({ label, required, hint, children, htmlFor }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <Label
          htmlFor={htmlFor}
          className="text-sm font-medium text-foreground"
        >
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
      )}
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper: Alert error
// ---------------------------------------------------------------------------
function ErrorAlert({ message }) {
  if (!message) return null;
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

// ---------------------------------------------------------------------------
// Komponen utama
// ---------------------------------------------------------------------------
export default function KatalogCreatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    form,
    handleChange,
    handleImageUpload,
    removeImage,
    loading,
    saving,
    error,
    save,
  } = useProductForm(id ?? null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleSubmit = async () => {
    const ok = await save();
    if (ok) navigate("/katalog");
  };

  return (
    <div className=" mx-auto  ">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link to="/katalog">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">
          {id ? "Edit Produk" : "Tambah Produk Baru"}
        </h1>
      </div>

      <ErrorAlert message={error} />

      {/*
        Layout:
        - Mobile  : 1 kolom (sidebar turun ke bawah)
        - Desktop : 2/3 konten utama + 1/3 sidebar
      */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* ── Kolom Utama ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-5">
          {/* Informasi Dasar */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground  tracking-wide">
                Informasi Produk
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <FormField label="Nama produk" required htmlFor="product-name">
                <Input
                  id="product-name"
                  placeholder="Tuliskan nama produk disini..."
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </FormField>

              <FormField
                label="Deskripsi singkat"
                // hint="Tampil sebagai ringkasan di halaman daftar produk."
                htmlFor="short-desc"
              >
                <Textarea
                  id="short-desc"
                  placeholder="Tuliskan ringkasan produk di sini..."
                  value={form.short_description}
                  onChange={(e) =>
                    handleChange("short_description", e.target.value)
                  }
                  rows={3}
                  className="resize-none text-sm"
                />
              </FormField>

              <FormField
                label="Deskripsi lengkap"
                // hint="Mendukung HTML. Contoh: <ul><li>Bahan cotton 30s</li></ul>"
                htmlFor="full-desc"
              >
                <Textarea
                  id="full-desc"
                  placeholder="Tuliskan detail produk..."
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={8}
                  className="text-sm resize-y"
                />
              </FormField>
            </CardContent>
          </Card>

          {/* Harga — hanya harga normal, sale price dihapus */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground  tracking-wide">
                Harga
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                label="Harga jual"
                required
                hint="Masukkan harga dalam Rupiah, tanpa titik atau koma. Contoh: 150000"
                htmlFor="regular-price"
              >
                <Input
                  id="regular-price"
                  type="number"
                  min="0"
                  placeholder="Contoh: 150000"
                  value={form.regular_price}
                  onChange={(e) =>
                    handleChange("regular_price", e.target.value)
                  }
                />
              </FormField>
            </CardContent>
          </Card>

          {/* Inventori */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground  tracking-wide">
                Inventori
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <FormField
                label="SKU"
                // hint="Kode unik untuk identifikasi produk di sistem. Contoh: KAO-POLO-M-WHT"
                htmlFor="sku"
              >
                <Input
                  id="sku"
                  placeholder="Masukkan SKU di sini..."
                  value={form.sku}
                  onChange={(e) => handleChange("sku", e.target.value)}
                />
              </FormField>

              <div className="flex items-center gap-3">
                <Switch
                  id="manage-stock"
                  checked={form.manage_stock}
                  onCheckedChange={(v) => handleChange("manage_stock", v)}
                />
                <Label
                  htmlFor="manage-stock"
                  className="text-sm font-normal cursor-pointer"
                >
                  Manajemen Stok
                </Label>
              </div>

              {form.manage_stock && (
                <FormField
                  label="Jumlah stok"
                  // hint="Stok akan berkurang otomatis setiap ada pesanan masuk."
                  htmlFor="stock-qty"
                >
                  <Input
                    id="stock-qty"
                    type="number"
                    min="0"
                    placeholder="Masukkan jumlah stok di sini..."
                    value={form.stock_quantity}
                    onChange={(e) =>
                      handleChange("stock_quantity", e.target.value)
                    }
                  />
                </FormField>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        {/*
          Urutan sidebar: Gambar → Kategori → Publikasi
        */}
        <div className="flex flex-col gap-4">
          {/* 1. Gambar Produk */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground  tracking-wide">
                Gambar Produk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {form.images.map((img, i) => (
                  <div
                    key={i}
                    className="relative group aspect-square rounded-md overflow-hidden border border-border"
                  >
                    {img.src ? (
                      <img
                        src={img.src}
                        alt={`Gambar produk ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                        Mengunggah…
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      aria-label={`Hapus gambar ${i + 1}`}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Tombol tambah gambar */}
                <label className="aspect-square flex flex-col items-center justify-center gap-1 border-2 border-dashed border-border rounded-md cursor-pointer hover:bg-muted/40 transition-colors">
                  <ImagePlus className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Tambah</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      if (e.target.files?.[0])
                        handleImageUpload(e.target.files[0]);
                    }}
                  />
                </label>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Gambar pertama digunakan sebagai foto utama produk.
              </p>
            </CardContent>
          </Card>

          {/* 2. Kategori Produk */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground  tracking-wide">
                Kategori Produk
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/*
                CategoryManager membaca & menulis ke WooCommerce categories API.
                selected = array id kategori yang sudah di-assign ke produk ini.
                onChange = update form.categories; saat save kirim array of { id }.

                Pastikan useProductForm menyimpan categories sebagai number[]:
                  form.categories = product.categories.map(c => c.id)
                dan saat save:
                  categories: form.categories.map(id => ({ id }))
              */}
              <CategoryManager
                selected={form.categories ?? []}
                onChange={(ids) => handleChange("categories", ids)}
              />
            </CardContent>
          </Card>

          {/* 3. Publikasi */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground  tracking-wide">
                Publikasi
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <FormField label="Status" htmlFor="product-status">
                <Select
                  value={form.status}
                  onValueChange={(v) => handleChange("status", v)}
                >
                  <SelectTrigger id="product-status">
                    <SelectValue placeholder="Pilih status…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="publish">Publish</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {id ? "Simpan Perubahan" : "Tambah Produk"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
