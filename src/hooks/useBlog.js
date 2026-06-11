import { useState, useEffect, useCallback } from "react";
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getCategories,
  getTags,
  uploadPostMedia,
} from "@/lib/wordpress";

/* ==============================
   LIST POSTS
============================== */
export function usePosts(initialPage = 1, perPage = 10) {
  const [posts, setPosts]           = useState([]);
  const [page, setPage]             = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState("");

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
     // sesudah
const filters = { status: "any", ...(search && { search }) }
      const result  = await getPosts(page, perPage, filters);
      setPosts(result.data);
      setTotalPages(result.totalPages);
      setTotalItems(result.totalItems);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const remove = async (id) => {
    await deletePost(id, true);
    fetchPosts();
  };

  return {
    posts,
    page,
    setPage,
    totalPages,
    totalItems,
    loading,
    error,
    search,
    setSearch,
    refresh: fetchPosts,
    remove,
  };
}

/* ==============================
   HELPER — ekstrak plain string dari nilai WP
   WP REST API mengembalikan title/content/excerpt
   sebagai objek { rendered: "..." }.
   Fungsi ini menjamin form state selalu berupa string.
============================== */
function toPlain(value) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "rendered" in value)
    return value.rendered ?? "";
  return "";
}

function stripHtml(html = "") {
  return html.replace(/<[^>]*>/g, "");
}

/* ==============================
   SINGLE POST FORM (create / edit)
============================== */
export function usePostForm(id = null) {
  const [form, setForm] = useState({
    title:           "",
    content:         "",
    excerpt:         "",
    status:          "draft",
    featured_media:  0,
    categories:      [],
    tags:            [],
  });
  const [categories, setCategories] = useState([]);
  const [tags, setTags]             = useState([]);
  const [loading, setLoading]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [cats, tgs] = await Promise.all([getCategories(), getTags()]);
        setCategories(cats);
        setTags(tgs);

        if (id) {
          const post = await getPostById(id);
          setForm({
            // FIX: Selalu extract .rendered agar form menyimpan plain string,
            // bukan objek. Jika dikirim balik sebagai objek, WP akan gagal.
            title:          toPlain(post.title),
            content:        toPlain(post.content),
            excerpt:        stripHtml(toPlain(post.excerpt)),
            status:         post.status          ?? "draft",
            featured_media: post.featured_media  ?? 0,
            categories:     post.categories      ?? [],
            tags:           post.tags            ?? [],
          });
          if (post._embedded?.["wp:featuredmedia"]?.[0]?.source_url) {
            setPreviewUrl(post._embedded["wp:featuredmedia"][0].source_url);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  const handleChange = (key, value) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleImageUpload = async (file) => {
    try {
      const { id: mediaId, url } = await uploadPostMedia(file);
      setForm((f) => ({ ...f, featured_media: mediaId }));
      setPreviewUrl(url);
    } catch (err) {
      setError("Gagal upload gambar: " + err.message);
    }
  };

  const save = async () => {
    // Validasi — form.title & form.content sudah dijamin string
    if (!form.title.trim()) {
      setError("Judul tidak boleh kosong.");
      return false;
    }
    if (!form.content.trim()) {
      setError("Konten tidak boleh kosong.");
      return false;
    }

    setSaving(true);
    setError(null);
    try {
      // FIX: Payload menggunakan form state yang sudah pasti plain string.
      // lib/wordpress.js juga menjalankan toPlainString() sebagai lapisan kedua.
      const payload = {
        title:          form.title,
        content:        form.content,
        excerpt:        form.excerpt,
        status:         form.status,
        featured_media: form.featured_media ?? 0,
        categories:     form.categories,
        tags:           form.tags,
      };

      if (id) {
        await updatePost(Number(id), payload);
      } else {
        await createPost(payload);
      }
      return true;
    } catch (err) {
      const msg =
        err.response?.data?.message ?? err.message ?? "Gagal menyimpan post.";
      setError(msg);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    form,
    handleChange,
    handleImageUpload,
    categories,
    tags,
    previewUrl,
    loading,
    saving,
    error,
    save,
  };
}