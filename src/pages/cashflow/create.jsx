// pages/cashflow/create.jsx
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useCashflowForm } from "@/hooks/useCashflow";
import { ErrorAlert } from "@/components/shared";

export default function CashflowCreatePage() {
  const navigate = useNavigate();
  const { form, handleChange, saving, error, save } = useCashflowForm();

  const handleSubmit = async () => {
    const ok = await save();
    if (ok) navigate("/cashflow");
  };

  return (
    <div className="mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/cashflow">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">Catat Arus Kas</h1>
      </div>

      <ErrorAlert message={error} />

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-sm text-muted-foreground font-medium">
            Informasi Transaksi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Jenis Transaksi */}
          <div className="space-y-2">
            <Label>
              Jenis Transaksi <span className="text-destructive">*</span>
            </Label>
            <ToggleGroup
              type="single"
              value={form.type}
              onValueChange={(val) => val && handleChange("type", val)}
              className="grid grid-cols-2 gap-3"
            >
              <ToggleGroupItem
                value="income"
                className="w-full border data-[state=on]:bg-primary data-[state=on]:text-white data-[state=on]:border-primary"
              >
                Pemasukan
              </ToggleGroupItem>
              <ToggleGroupItem
                value="outcome"
                className="w-full border data-[state=on]:bg-destructive data-[state=on]:text-destructive-foreground data-[state=on]:text-white data-[state=on]:border-destructive"
              >
                Pengeluaran
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Jumlah */}
          <div className="space-y-2">
            <Label htmlFor="amount">
              Jumlah (IDR) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              min="1"
              placeholder="0"
              value={form.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
              className="text-lg"
            />
          </div>

          {/* Judul / Keterangan */}
          <div className="space-y-2">
            <Label htmlFor="note">
              Judul / Keterangan <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="note"
              placeholder={
                form.type === "income"
                  ? "mis. Penjualan offline, Jasa konsultasi..."
                  : "mis. Beli bahan baku, Bayar listrik..."
              }
              value={form.note}
              onChange={(e) => handleChange("note", e.target.value)}
              rows={3}
            />
          </div>

          {/* Tombol */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" asChild>
              <Link to="/cashflow">Batal</Link>
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={saving || !form.amount || !form.note.trim()}
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Simpan Catatan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
