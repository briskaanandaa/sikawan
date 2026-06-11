// pages/order/create.jsx
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Plus,
  Minus,
  Trash2,
  Loader2,
  ShoppingCart,
  Package,
  MapPin,
  CreditCard,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useOrderForm, useProductPicker } from "@/hooks/useOrder";
import { ErrorAlert, CurrencyDisplay, formatIDR } from "@/components/shared";

export default function OrderCreatePage() {
  const navigate = useNavigate();
  const { id: editId } = useParams();

  const {
    billing,
    handleBillingChange,
    cart,
    addToCart,
    updateQty,
    removeFromCart,
    cartTotal,
    status,
    setStatus,
    paymentMethod,
    setPaymentMethod,
    customerNote,
    setCustomerNote,
    transactionId,
    setTransactionId,
    saving,
    loadingEdit,
    error,
    save,
    isEditMode,
  } = useOrderForm(editId ?? null);

  const {
    filtered: products,
    loading: loadingProducts,
    search,
    setSearch,
  } = useProductPicker();

  const handleSubmit = async () => {
    // Pastikan country selalu ID
    handleBillingChange("country", "ID");
    const order = await save();
    if (order) navigate("/order");
  };

  if (loadingEdit) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Memuat data order...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/order">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold">
            {isEditMode ? `Edit Order #${editId}` : "Buat Order Baru"}
          </h1>
          {isEditMode && (
            <p className="text-sm text-muted-foreground mt-0.5">
              Perubahan akan langsung tersimpan ke WooCommerce
            </p>
          )}
        </div>
      </div>

      <ErrorAlert message={error} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ══ KIRI ══ */}
        <div className="lg:col-span-3 space-y-4">
          {/* Katalog Produk */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Package className="w-4 h-4" />
                Produk dalam Order
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cari produk untuk ditambahkan..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              {loadingProducts ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : products.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Produk tidak ditemukan
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-1">
                  {products.map((product) => {
                    const inCart = cart.find(
                      (i) => i.product.id === product.id,
                    );
                    return (
                      <button
                        key={product.id}
                        onClick={() => addToCart(product)}
                        className="relative border rounded-lg p-3 text-left hover:border-primary hover:bg-primary/5 transition-colors group"
                      >
                        {inCart && (
                          <span className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {inCart.quantity}
                          </span>
                        )}
                        {product.images?.[0]?.src ? (
                          <img
                            src={product.images[0].src}
                            alt={product.name}
                            className="w-full aspect-square object-cover rounded-md mb-2"
                          />
                        ) : (
                          <div className="w-full aspect-square bg-muted rounded-md mb-2 flex items-center justify-center">
                            <Package className="w-8 h-8 text-muted-foreground/40" />
                          </div>
                        )}
                        <p className="text-xs font-medium line-clamp-2 mb-1">
                          {product.name}
                        </p>
                        <p className="text-xs text-primary font-semibold">
                          {formatIDR(
                            product.price || product.regular_price || 0,
                          )}
                        </p>
                        {product.manage_stock && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Stok: {product.stock_quantity ?? 0}
                          </p>
                        )}
                        <div className="absolute inset-0 rounded-lg flex items-center justify-center bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <Plus className="w-6 h-6 text-primary" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Alamat Billing */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Alamat Pelanggan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="first_name">
                    Nama Depan <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="first_name"
                    placeholder="Budi"
                    value={billing.first_name}
                    onChange={(e) =>
                      handleBillingChange("first_name", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Nama Belakang</Label>
                  <Input
                    id="last_name"
                    placeholder="Santoso"
                    value={billing.last_name}
                    onChange={(e) =>
                      handleBillingChange("last_name", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="budi@email.com"
                  value={billing.email}
                  onChange={(e) => handleBillingChange("email", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">No. Telepon</Label>
                <Input
                  id="phone"
                  placeholder="08xxxxxxxxxx"
                  value={billing.phone}
                  onChange={(e) => handleBillingChange("phone", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_1">Alamat</Label>
                <Input
                  id="address_1"
                  placeholder="Jl. Merdeka No. 1"
                  value={billing.address_1}
                  onChange={(e) =>
                    handleBillingChange("address_1", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_2">Kecamatan</Label>
                <Input
                  id="address_2"
                  placeholder="mis. Banyumanik"
                  value={billing.address_2}
                  onChange={(e) =>
                    handleBillingChange("address_2", e.target.value)
                  }
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="city">Kota</Label>
                  <Input
                    id="city"
                    placeholder="Semarang"
                    value={billing.city}
                    onChange={(e) =>
                      handleBillingChange("city", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Provinsi</Label>
                  <Input
                    id="state"
                    placeholder="Jawa Tengah"
                    value={billing.state}
                    onChange={(e) =>
                      handleBillingChange("state", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postcode">Kode Pos</Label>
                  <Input
                    id="postcode"
                    placeholder="50111"
                    value={billing.postcode}
                    onChange={(e) =>
                      handleBillingChange("postcode", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* country hidden, default ID */}
              <input type="hidden" value="ID" />
            </CardContent>
          </Card>
        </div>

        {/* ══ KANAN ══ */}
        <div className="lg:col-span-2 space-y-4">
          {/* Keranjang */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Keranjang
                {cart.length > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {cart.reduce((s, i) => s + i.quantity, 0)} item
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Belum ada produk dipilih
                </p>
              ) : (
                <div className="space-y-3">
                  {cart.map(({ product, quantity }) => (
                    <div key={product.id} className="flex items-center gap-2">
                      {product.images?.[0]?.src ? (
                        <img
                          src={product.images[0].src}
                          alt={product.name}
                          className="w-9 h-9 rounded object-cover border shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded bg-muted shrink-0 flex items-center justify-center">
                          <Package className="w-4 h-4 text-muted-foreground/50" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium line-clamp-1">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatIDR(
                            product.price || product.regular_price || 0,
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-6 h-6"
                          onClick={() => updateQty(product.id, quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-6 text-center text-xs font-medium">
                          {quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-6 h-6"
                          onClick={() => updateQty(product.id, quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6 text-destructive hover:text-destructive hover:bg-destructive/10 ml-1"
                          onClick={() => removeFromCart(product.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between items-center font-semibold text-sm">
                    <span>Total</span>
                    <CurrencyDisplay
                      amount={cartTotal}
                      className="text-primary"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pengaturan Order */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Pengaturan Order
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment">Metode Pembayaran</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="payment">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cod">Cash on Delivery</SelectItem>
                    <SelectItem value="bacs">Transfer Bank</SelectItem>
                    <SelectItem value="cheque">Tunai / Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transaction_id">
                  ID Transaksi{" "}
                  <span className="text-muted-foreground font-normal">
                    (opsional)
                  </span>
                </Label>
                <p className="text-xs text-muted-foreground -mt-1">
                  Nomor bukti transfer atau kode pembayaran
                </p>
                <Input
                  id="transaction_id"
                  placeholder="TRX-XXXXXXXX"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Catatan */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Catatan Pelanggan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Catatan khusus dari pelanggan (opsional)..."
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>

          {status === "completed" && !isEditMode && (
            <div className="rounded-lg bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm">
              ✅ Order <strong>Completed</strong> otomatis tercatat sebagai
              pemasukan di Cashflow.
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" asChild>
              <Link to="/order">Batal</Link>
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={saving || (!isEditMode && cart.length === 0)}
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditMode ? "Simpan Perubahan" : "Buat Order"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
