// components/category-manager.jsx
import { useState } from "react";
import {
  Pencil,
  Trash2,
  Plus,
  Check,
  X,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { cn } from "@/lib/utils";
import { useProductCategories } from "@/hooks/useKatalogcategory";

/**
 * @param {number[]} selected  - id kategori yang di-assign ke produk
 * @param {Function} onChange  - (newIds: number[]) => void
 */
export function CategoryManager({ selected = [], onChange }) {
  const { categories, loading, error, create, update, remove } =
    useProductCategories();

  const [addingParent, setAddingParent] = useState(false);
  const [addingChild, setAddingChild] = useState(null); // parentId | null
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [busy, setBusy] = useState(false);

  // ── tree helpers ──────────────────────────────────────────────────────────
  const parents = categories.filter((c) => c.parent === 0);
  const childrenOf = (pid) => categories.filter((c) => c.parent === pid);

  const toggleSelect = (id) => {
    onChange(
      selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id],
    );
  };

  const resetAdd = () => {
    setAddingParent(false);
    setAddingChild(null);
    setNewName("");
  };
  const resetEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  // ── actions ───────────────────────────────────────────────────────────────
  const handleCreate = async (parentId = 0) => {
    if (!newName.trim()) return;
    setBusy(true);
    try {
      await create(newName.trim(), parentId);
      resetAdd();
    } finally {
      setBusy(false);
    }
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) return;
    setBusy(true);
    try {
      await update(id, editName.trim());
      resetEdit();
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    setBusy(true);
    try {
      await remove(id);
      onChange(selected.filter((x) => x !== id));
    } finally {
      setBusy(false);
    }
  };

  // ── sub-components ────────────────────────────────────────────────────────
  const InlineInput = ({ onConfirm, onCancel, placeholder }) => (
    <div className="flex items-center gap-1 mt-1">
      <Input
        autoFocus
        className="h-7 text-xs"
        placeholder={placeholder}
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onConfirm();
          if (e.key === "Escape") onCancel();
        }}
      />
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7 shrink-0"
        onClick={onConfirm}
        disabled={busy}
      >
        {busy ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Check className="w-3 h-3 text-green-600" />
        )}
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7 shrink-0"
        onClick={onCancel}
      >
        <X className="w-3 h-3" />
      </Button>
    </div>
  );

  const EditInput = ({ id }) => (
    <div className="flex items-center gap-1 flex-1">
      <Input
        autoFocus
        className="h-7 text-xs flex-1"
        value={editName}
        onChange={(e) => setEditName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleUpdate(id);
          if (e.key === "Escape") resetEdit();
        }}
      />
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7 shrink-0"
        onClick={() => handleUpdate(id)}
        disabled={busy}
      >
        {busy ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Check className="w-3 h-3 text-green-600" />
        )}
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7 shrink-0"
        onClick={resetEdit}
      >
        <X className="w-3 h-3" />
      </Button>
    </div>
  );

  const DeleteBtn = ({ cat }) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600"
          disabled={busy}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus "{cat.name}"?</AlertDialogTitle>
          <AlertDialogDescription>
            Kategori ini akan dihapus permanen. Produk yang sudah di-assign
            tidak akan ikut terhapus.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-500 hover:bg-red-600"
            onClick={() => handleDelete(cat.id)}
          >
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  const CategoryRow = ({ cat, depth = 0 }) => {
    const isEditing = editingId === cat.id;
    const isSelected = selected.includes(cat.id);
    const children = childrenOf(cat.id);

    return (
      <div className={cn(depth > 0 && "ml-4 border-l border-border pl-3")}>
        <div className="group flex items-center gap-2 py-1 px-1 rounded-sm hover:bg-muted/50">
          <Checkbox
            id={`cat-${cat.id}`}
            checked={isSelected}
            onCheckedChange={() => toggleSelect(cat.id)}
          />

          {isEditing ? (
            <EditInput id={cat.id} />
          ) : (
            <>
              <label
                htmlFor={`cat-${cat.id}`}
                className="flex-1 text-xs leading-none cursor-pointer truncate"
              >
                {cat.name}
                {cat.count > 0 && (
                  <span className="ml-1 text-muted-foreground">
                    ({cat.count})
                  </span>
                )}
              </label>

              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => {
                    setEditingId(cat.id);
                    setEditName(cat.name);
                  }}
                >
                  <Pencil className="w-3 h-3" />
                </Button>
                <DeleteBtn cat={cat} />
                {depth === 0 && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-muted-foreground"
                    title="Tambah sub-kategori"
                    onClick={() => {
                      setAddingChild(cat.id);
                      setAddingParent(false);
                      setNewName("");
                    }}
                  >
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </>
          )}
        </div>

        {children.map((child) => (
          <CategoryRow key={child.id} cat={child} depth={depth + 1} />
        ))}

        {addingChild === cat.id && (
          <div className="ml-4 border-l border-border pl-3">
            <InlineInput
              placeholder="Nama sub-kategori..."
              onConfirm={() => handleCreate(cat.id)}
              onCancel={resetAdd}
            />
          </div>
        )}
      </div>
    );
  };

  // ── render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {error && <p className="text-xs text-red-500 mb-2 px-1">{error}</p>}

      {parents.length === 0 && !addingParent && (
        <p className="text-xs text-muted-foreground py-2 text-center">
          Belum ada kategori.
        </p>
      )}

      {parents.map((cat) => (
        <CategoryRow key={cat.id} cat={cat} />
      ))}

      {addingParent ? (
        <InlineInput
          placeholder="Nama kategori baru..."
          onConfirm={() => handleCreate(0)}
          onCancel={resetAdd}
        />
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-1 h-7 text-xs justify-start text-muted-foreground hover:text-foreground"
          onClick={() => {
            setAddingParent(true);
            setAddingChild(null);
            setNewName("");
          }}
        >
          <Plus className="w-3 h-3 mr-1" />
          Tambah kategori
        </Button>
      )}
    </div>
  );
}
