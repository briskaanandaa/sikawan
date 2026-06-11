import axios from "axios";

/* =============================
   WORDPRESS CLIENT
============================= */
const wp = axios.create({
  baseURL: `${import.meta.env.VITE_WC_API_URL.replace("/wc/v3", "")}/wp/v2`,
  auth: {
    username: import.meta.env.VITE_WP_USERNAME,
    password: import.meta.env.VITE_WP_APP_PASSWORD,
  },
});

/* =============================
   HELPERS
============================= */
const normalizeArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

/**
 * FIX: WordPress REST API mengembalikan title/content/excerpt
 * sebagai objek { rendered: "..." }. Fungsi ini memastikan
 * kita selalu mengirim plain string ke API, bukan objek.
 */
const toPlainString = (value) => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "rendered" in value)
    return value.rendered ?? "";
  return "";
};

/* =============================
   POSTS (BLOG)
============================= */

export const getPosts = async (page = 1, perPage = 10, filters = {}) => {
  const params = {
    page,
    per_page: perPage,
    _embed: true,
    ...filters,
  };

  const res = await wp.get("/posts", { params });

  return {
    data: normalizeArray(res.data),
    totalPages: Number(res.headers["x-wp-totalpages"] || 1),
    totalItems: Number(res.headers["x-wp-total"] || 0),
  };
};

export const getPostById = async (id) => {
  const res = await wp.get(`/posts/${id}`, { params: { _embed: true } });
  return res.data;
};

export const getPostBySlug = async (slug) => {
  const res = await wp.get("/posts", {
    params: { slug, _embed: true },
  });
  const posts = normalizeArray(res.data);
  return posts[0] ?? null;
};

/**
 * Buat post baru.
 * FIX: Normalisasi title/content/excerpt ke plain string sebelum dikirim.
 * WP REST API menolak / salah proses jika nilai berupa objek {rendered}.
 */
export const createPost = async (payload) => {
  const safePayload = {
    ...payload,
    title:   toPlainString(payload.title),
    content: toPlainString(payload.content),
    excerpt: toPlainString(payload.excerpt ?? ""),
  };
  const res = await wp.post("/posts", safePayload);
  return res.data;
};

/**
 * Update post by ID.
 * FIX: Sama — normalisasi agar tidak mengirim objek rendered.
 */
export const updatePost = async (id, payload) => {
  const safePayload = {
    ...payload,
    title:   toPlainString(payload.title),
    content: toPlainString(payload.content),
    excerpt: toPlainString(payload.excerpt ?? ""),
  };
  const res = await wp.put(`/posts/${id}`, safePayload);
  return res.data;
};

export const deletePost = async (id, force = false) => {
  const res = await wp.delete(`/posts/${id}`, {
    params: { force },
  });
  return res.data;
};

/* =============================
   CATEGORIES
============================= */
export const getCategories = async () => {
  const res = await wp.get("/categories", {
    params: { per_page: 100 },
  });
  return normalizeArray(res.data);
};

export const createCategory = async ({ name, description = "", parent = 0 }) => {
  const res = await wp.post("/categories", { name, description, parent });
  return res.data;
};

export const deleteCategory = async (id) => {
  const res = await wp.delete(`/categories/${id}`, {
    params: { force: true },
  });
  return res.data;
};

/* =============================
   TAGS
============================= */
export const getTags = async () => {
  const res = await wp.get("/tags", {
    params: { per_page: 100 },
  });
  return normalizeArray(res.data);
};

export const createTag = async ({ name }) => {
  const res = await wp.post("/tags", { name });
  return res.data;
};

/* =============================
   MEDIA (FEATURED IMAGE)
============================= */
export const uploadPostMedia = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post(
    `${import.meta.env.VITE_WC_API_URL.replace("/wc/v3", "")}/wp/v2/media`,
    formData,
    {
      auth: {
        username: import.meta.env.VITE_WP_USERNAME,
        password: import.meta.env.VITE_WP_APP_PASSWORD,
      },
      headers: {
        "Content-Disposition": `attachment; filename="${file.name}"`,
      },
    }
  );

  return {
    id: res.data.id,
    url: res.data.source_url,
  };
};