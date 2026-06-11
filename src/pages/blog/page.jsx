// pages/blog/page.jsx
import { Link } from "react-router-dom";
import { PlusCircle, Pencil, Trash2, Search, Eye } from "lucide-react";
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
import { usePosts } from "@/hooks/useBlog";
import {
  PageHeader,
  DataTable,
  Pagination,
  StatusBadge,
  ErrorAlert,
} from "@/components/shared";
import { formatDateTime } from "@/lib/date";

// pages/blog/page.jsx
export default function BlogPage() {
  const {
    posts,
    page,
    setPage,
    totalPages,
    totalItems,
    loading,
    error,
    search,
    setSearch,
    remove,
  } = usePosts();

  const columns = [
    {
      key: "title",
      label: "Judul",
      render: (row) => (
        <div>
          <p className="font-medium line-clamp-1">
            {row.title?.rendered ?? "-"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDateTime(row.date_gmt)}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "author",
      label: "Penulis",
      render: (row) => row._embedded?.author?.[0]?.name ?? "-",
    },
    {
      key: "actions",
      label: "Aksi",
      render: (row) => (
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="icon" asChild>
            <a href={row.link} target="_blank" rel="noopener noreferrer">
              <Eye className="w-4 h-4" />
            </a>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/blog/edit/${row.id}`}>
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
                <AlertDialogTitle>Hapus Post?</AlertDialogTitle>
                <AlertDialogDescription>
                  Post ini akan dihapus permanen dan tidak dapat dikembalikan.
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
      {/* PageHeader hanya title + description, tanpa children */}
      <PageHeader title="Blog" description={`${totalItems} post tersedia`} />

      {/* Toolbar dipisah di luar PageHeader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-2 mb-4">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari post..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link to="/blog/create">
            <PlusCircle className="w-4 h-4 mr-2" />
            Tulis Post
          </Link>
        </Button>
      </div>

      <ErrorAlert message={error} />

      <DataTable columns={columns} data={posts} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
