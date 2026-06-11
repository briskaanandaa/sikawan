// lib/date.js

/**
 * WooCommerce & WordPress REST API mengembalikan tanggal dalam format
 * "2025-06-08T14:30:00" — tanpa timezone offset.
 * Browser akan memperlakukannya sebagai LOCAL time, bukan UTC.
 * Karena server WP biasanya di-set ke Asia/Jakarta (WIB = UTC+7),
 * kita paksa tambahkan "+07:00" agar parsing selalu benar.
 */
export function parseWPDate(dateStr) {
  if (!dateStr) return null;
  if (/Z|[+-]\d{2}:\d{2}$/.test(dateStr)) return new Date(dateStr);
  return new Date(dateStr + "Z"); // ← ganti "+07:00" jadi "Z" (UTC)
}

export function formatDate(dateStr) {
  const d = parseWPDate(dateStr);
  if (!d || isNaN(d)) return "-";
  return d.toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" });
}

export function formatDateTime(dateStr) {
  const d = parseWPDate(dateStr);
  if (!d || isNaN(d)) return "-";
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
}

