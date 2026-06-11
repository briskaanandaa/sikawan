import { useState, useEffect, useCallback } from "react";

// ── Simulated API (mirrors paymentSettings.js logic, uses live fetch) ──────────
const API_URL = "https://sikawan-pagersari.id/wp-json/sikawan/v1/bacs-accounts";
const HEADERS = {
  "X-Sikawan-Key": "sikawan-secret-2024",
  "Content-Type": "application/json",
};

async function getBankAccounts() {
  const res = await fetch(API_URL, { method: "GET", headers: HEADERS });
  if (!res.ok) throw new Error(`Gagal memuat data: ${res.statusText}`);
  return res.json();
}
async function createBankAccount(data) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ sort_code: "", iban: "", bic: "", ...data }),
  });
  if (!res.ok) throw new Error(`Gagal membuat akun: ${res.statusText}`);
  return res.json();
}
async function updateBankAccount(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: HEADERS,
    body: JSON.stringify({ sort_code: "", iban: "", bic: "", ...data }),
  });
  if (!res.ok) throw new Error(`Gagal memperbarui akun: ${res.statusText}`);
  return res.json();
}
async function deleteBankAccount(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: HEADERS,
  });
  if (!res.ok) throw new Error(`Gagal menghapus akun: ${res.statusText}`);
  return res.json();
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const BANKS = [
  "BCA",
  "BRI",
  "BNI",
  "Mandiri",
  "CIMB Niaga",
  "Danamon",
  "BSI",
  "Lainnya",
];

const EMPTY_FORM = {
  account_name: "",
  account_number: "",
  bank_name: "BCA",
  sort_code: "",
  iban: "",
  bic: "",
};

function bankInitials(name) {
  return (name || "?").slice(0, 3).toUpperCase();
}

function bankColor(name) {
  const map = {
    BCA: "#005baa",
    BRI: "#003d8f",
    BNI: "#ef7d00",
    Mandiri: "#003087",
    "CIMB Niaga": "#c00000",
    Danamon: "#e31837",
    BSI: "#006747",
  };
  return map[name] || "#6366f1";
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        background: type === "error" ? "#fef2f2" : "#f0fdf4",
        border: `1px solid ${type === "error" ? "#fca5a5" : "#86efac"}`,
        color: type === "error" ? "#dc2626" : "#16a34a",
        borderRadius: 10,
        padding: "12px 18px",
        fontFamily: "Inter,sans-serif",
        fontSize: 14,
        fontWeight: 500,
        maxWidth: 340,
        boxShadow: "0 4px 20px rgba(0,0,0,.10)",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <span>{type === "error" ? "✗" : "✓"}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          opacity: 0.5,
          fontSize: 16,
        }}
      >
        ×
      </button>
    </div>
  );
}

function Badge({ label, color }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        borderRadius: 10,
        background: color,
        color: "#fff",
        fontFamily: "Inter,sans-serif",
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: 0.5,
      }}
    >
      {label}
    </span>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "28px 32px",
          width: "100%",
          maxWidth: 480,
          boxShadow: "0 24px 60px rgba(0,0,0,.18)",
          fontFamily: "Inter,sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "#f1f5f9",
              border: "none",
              borderRadius: 8,
              width: 32,
              height: 32,
              cursor: "pointer",
              fontSize: 18,
              color: "#64748b",
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, required, children, hint }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label
        style={{
          display: "block",
          marginBottom: 6,
          fontSize: 13,
          fontWeight: 600,
          color: "#374151",
        }}
      >
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      {children}
      {hint && (
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#9ca3af" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "9px 12px",
  borderRadius: 8,
  border: "1.5px solid #e2e8f0",
  fontSize: 14,
  color: "#0f172a",
  background: "#fff",
  outline: "none",
  fontFamily: "Inter,sans-serif",
  transition: "border-color .15s",
};

function Input({ value, onChange, placeholder, type = "text", required }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      style={inputStyle}
      onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
      onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
    />
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{ ...inputStyle, cursor: "pointer" }}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function Btn({
  children,
  onClick,
  variant = "primary",
  disabled,
  style: extra = {},
}) {
  const base = {
    border: "none",
    borderRadius: 9,
    padding: "9px 18px",
    fontFamily: "Inter,sans-serif",
    fontWeight: 600,
    fontSize: 14,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    transition: "all .15s",
    ...extra,
  };
  const styles = {
    primary: { background: "#6366f1", color: "#fff" },
    ghost: { background: "#f1f5f9", color: "#475569" },
    danger: {
      background: "#fef2f2",
      color: "#dc2626",
      border: "1.5px solid #fca5a5",
    },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...styles[variant] }}
    >
      {children}
    </button>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <Modal title="Konfirmasi Hapus" onClose={onCancel}>
      <p style={{ color: "#475569", marginBottom: 24, lineHeight: 1.6 }}>
        {message}
      </p>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <Btn variant="ghost" onClick={onCancel}>
          Batal
        </Btn>
        <Btn variant="danger" onClick={onConfirm}>
          Hapus
        </Btn>
      </div>
    </Modal>
  );
}

function AccountForm({ initial = EMPTY_FORM, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(initial);
  const set = (field) => (e) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0 16px",
        }}
      >
        <Field label="Nama Pemilik Rekening" required>
          <Input
            value={form.account_name}
            onChange={set("account_name")}
            placeholder="Contoh: John Doe"
            required
          />
        </Field>
        <Field label="Nomor Rekening" required>
          <Input
            value={form.account_number}
            onChange={set("account_number")}
            placeholder="Contoh: 1234567890"
            required
          />
        </Field>
      </div>
      <Field label="Nama Bank" required>
        <Select
          value={form.bank_name}
          onChange={set("bank_name")}
          options={BANKS}
        />
      </Field>
      <div
        style={{
          borderTop: "1px solid #f1f5f9",
          paddingTop: 16,
          marginBottom: 16,
        }}
      >
        <p
          style={{
            fontSize: 12,
            color: "#94a3b8",
            marginBottom: 12,
            fontWeight: 600,
            letterSpacing: 0.5,
          }}
        >
          OPSIONAL — untuk transfer internasional
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "0 12px",
          }}
        >
          <Field label="Sort Code" hint="Format: 00-00-00">
            <Input
              value={form.sort_code}
              onChange={set("sort_code")}
              placeholder="00-00-00"
            />
          </Field>
          <Field label="IBAN">
            <Input
              value={form.iban}
              onChange={set("iban")}
              placeholder="IDxx..."
            />
          </Field>
          <Field label="BIC / SWIFT">
            <Input
              value={form.bic}
              onChange={set("bic")}
              placeholder="BCAIIDJA"
            />
          </Field>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <Btn variant="ghost" onClick={onCancel} disabled={loading}>
          Batal
        </Btn>
        <Btn
          onClick={() => onSubmit(form)}
          disabled={loading || !form.account_name || !form.account_number}
        >
          {loading ? "Menyimpan…" : "Simpan Rekening"}
        </Btn>
      </div>
    </div>
  );
}

function AccountCard({ account, onEdit, onDelete }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        border: "1.5px solid #e2e8f0",
        padding: "18px 20px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        transition: "box-shadow .15s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 4px 20px rgba(99,102,241,.08)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      <Badge
        label={bankInitials(account.bank_name)}
        color={bankColor(account.bank_name)}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontWeight: 700,
            fontSize: 15,
            color: "#0f172a",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {account.account_name}
        </p>
        <p style={{ margin: "3px 0 0", fontSize: 13, color: "#64748b" }}>
          {account.bank_name} ·{" "}
          <span style={{ fontFamily: "monospace", letterSpacing: 1 }}>
            {account.account_number}
          </span>
        </p>
        {(account.iban || account.bic) && (
          <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94a3b8" }}>
            {account.iban && `IBAN: ${account.iban}`}
            {account.iban && account.bic && " · "}
            {account.bic && `BIC: ${account.bic}`}
          </p>
        )}
      </div>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <Btn
          variant="ghost"
          onClick={() => onEdit(account)}
          style={{ padding: "6px 12px", fontSize: 13 }}
        >
          Edit
        </Btn>
        <Btn
          variant="danger"
          onClick={() => onDelete(account)}
          style={{ padding: "6px 12px", fontSize: 13 }}
        >
          Hapus
        </Btn>
      </div>
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "60px 24px",
        border: "2px dashed #e2e8f0",
        borderRadius: 16,
        background: "#fafafa",
      }}
    >
      <div style={{ fontSize: 40, marginBottom: 12 }}>🏦</div>
      <p
        style={{
          fontWeight: 700,
          fontSize: 16,
          color: "#0f172a",
          margin: "0 0 6px",
        }}
      >
        Belum ada rekening
      </p>
      <p style={{ color: "#94a3b8", fontSize: 14, margin: "0 0 20px" }}>
        Tambahkan rekening bank untuk menerima pembayaran.
      </p>
      <Btn onClick={onAdd}>+ Tambah Rekening</Btn>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PaymentSettings() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null); // null | "create" | "edit"
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState(null);

  const notify = (message, type = "success") => setToast({ message, type });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBankAccounts();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (e) {
      notify(e.message, "error");
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      await createBankAccount(form);
      notify("Rekening berhasil ditambahkan.");
      setModal(null);
      load();
    } catch (e) {
      notify(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (form) => {
    setSaving(true);
    try {
      await updateBankAccount(editing.id, form);
      notify("Rekening berhasil diperbarui.");
      setModal(null);
      setEditing(null);
      load();
    } catch (e) {
      notify(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteBankAccount(confirmDelete.id);
      notify("Rekening berhasil dihapus.");
      setConfirmDelete(null);
      load();
    } catch (e) {
      notify(e.message, "error");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily: "Inter,sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #e2e8f0",
          padding: "0 32px",
        }}
      >
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 64,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>💳</span>
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 17,
                  fontWeight: 800,
                  color: "#0f172a",
                }}
              >
                Pengaturan Pembayaran
              </h1>
              <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
                Kelola rekening bank penerima dana
              </p>
            </div>
          </div>
          <Btn
            onClick={() => setModal("create")}
            style={{ gap: 6, display: "flex", alignItems: "center" }}
          >
            + Tambah Rekening
          </Btn>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 32px" }}>
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 0",
              color: "#94a3b8",
              fontSize: 14,
            }}
          >
            <div
              style={{
                fontSize: 28,
                marginBottom: 10,
                animation: "spin 1s linear infinite",
              }}
            >
              ⟳
            </div>
            Memuat data rekening…
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : accounts.length === 0 ? (
          <EmptyState onAdd={() => setModal("create")} />
        ) : (
          <>
            <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>
              {accounts.length} rekening terdaftar
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {accounts.map((acc) => (
                <AccountCard
                  key={acc.id}
                  account={acc}
                  onEdit={(a) => {
                    setEditing(a);
                    setModal("edit");
                  }}
                  onDelete={(a) => setConfirmDelete(a)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Create Modal */}
      {modal === "create" && (
        <Modal title="Tambah Rekening Bank" onClose={() => setModal(null)}>
          <AccountForm
            onSubmit={handleCreate}
            onCancel={() => setModal(null)}
            loading={saving}
          />
        </Modal>
      )}

      {/* Edit Modal */}
      {modal === "edit" && editing && (
        <Modal
          title="Edit Rekening Bank"
          onClose={() => {
            setModal(null);
            setEditing(null);
          }}
        >
          <AccountForm
            initial={editing}
            onSubmit={handleUpdate}
            onCancel={() => {
              setModal(null);
              setEditing(null);
            }}
            loading={saving}
          />
        </Modal>
      )}

      {/* Delete Confirm */}
      {confirmDelete && (
        <ConfirmDialog
          message={`Hapus rekening "${confirmDelete.account_name}" (${confirmDelete.bank_name} · ${confirmDelete.account_number})? Tindakan ini tidak bisa dibatalkan.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
