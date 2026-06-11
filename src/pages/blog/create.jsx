// pages/blog/create.jsx
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { usePostForm } from "@/hooks/useBlog";
import { ErrorAlert } from "@/components/shared";

export default function BlogCreatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    form,
    handleChange,
    handleImageUpload,
    categories,
    previewUrl,
    loading,
    saving,
    error,
    save,
  } = usePostForm(id ?? null);

  // Auto-check kategori "blog" (case-insensitive) saat categories tersedia
  // Ini dijalankan di dalam hook idealnya, tapi bisa juga di sini dengan useEffect
  // Pastikan di useBlog.js saat init form, categories yg bernama "blog" sudah di-include

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleSubmit = async () => {
    const ok = await save();
    if (ok) navigate("/blog");
  };

  return (
    <div className="   mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/blog">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">
          {id ? "Edit Post" : "Tulis Post Baru"}
        </h1>
      </div>

      <ErrorAlert message={error} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main Content ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Judul */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Judul <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Judul post..."
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />
          </div>

          {/* Konten */}
          <div className="space-y-2">
            <Label htmlFor="content">
              Konten <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="content"
              placeholder="Tulis konten post di sini..."
              value={form.content}
              onChange={(e) => handleChange("content", e.target.value)}
              rows={14}
            />
          </div>

          {/* Ringkasan */}
          <div className="space-y-2">
            <Label htmlFor="excerpt">Ringkasan</Label>
            <p className="text-xs text-muted-foreground -mt-1">
              Tuliskan kalimat ringkasan yang menjelaskan isi artikel.
            </p>
            <Textarea
              id="excerpt"
              placeholder="Tulis ringkasan di sini..."
              value={form.excerpt}
              onChange={(e) => handleChange("excerpt", e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">
          {/* Gambar Utama */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Gambar Utama
              </CardTitle>
            </CardHeader>
            <CardContent>
              {previewUrl ? (
                <div className="relative group">
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="w-full rounded-md object-cover aspect-video"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleChange("featured_media", null)}
                    className="absolute top-2 right-2 bg-black/60 text-white hover:bg-black/80 rounded-full h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6 cursor-pointer hover:bg-muted/30 transition-colors">
                  <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground">
                    Upload gambar
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files[0])
                        handleImageUpload(e.target.files[0]);
                    }}
                  />
                </label>
              )}
            </CardContent>
          </Card>

          {/* Publikasi */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Publikasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => handleChange("status", v)}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="publish">Publish</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1" asChild>
                  <Link to="/blog">Batal</Link>
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={saving || !form.title || !form.content}
                >
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {id ? "Simpan" : "Publikasikan"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Kategori — hidden dari UI, auto-check "blog" */}
          {/* 
            Di usePostForm, pastikan saat init:
            const blogCat = categories.find(c => c.slug === "blog" || c.name.toLowerCase() === "blog");
            if (blogCat && !form.categories.includes(blogCat.id)) {
              handleChange("categories", [...form.categories, blogCat.id]);
            }
          */}
        </div>
      </div>
    </div>
  );
}
