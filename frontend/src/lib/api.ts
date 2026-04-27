import type { Product, ChatResponse, NewsletterResponse } from "@/types";

// Server-side API (inside Docker network): http://backend:8000
// Client-side: uses NEXT_PUBLIC_API_URL or public tunnel URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://troviio.com/api";

/**
 * Internal base for server-to-server calls within Docker.
 * Next.js Server Components can use this to call the backend directly.
 */
const INTERNAL_API_BASE = process.env.INTERNAL_API_URL || "http://172.19.0.4:8000/api";

/**
 * Generic fetch for API calls — used by accessory pages.
 * Works in both server and client components.
 * Server-side uses INTERNAL_API_BASE (Docker network).
 * Client-side uses NEXT_PUBLIC_API_URL.
 * Path should start with /api/ (e.g. /api/accessories/categories).
 */
export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  // Detect if running on server (SSR) or client
  const isServer = typeof window === "undefined";
  const base = isServer ? INTERNAL_API_BASE : API_BASE;
  const cleanPath = path.replace(/^\/api/, "");
  const url = `${base}${cleanPath}`;
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`API ${response.status}: ${text}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchProducts(category?: string, limit: number = 50): Promise<Product[]> {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  params.set("limit", String(limit));
  const res = await fetch(`${API_BASE}/products/?${params.toString()}`);
  if (!res.ok) throw new Error("Erreur chargement produits");
  return res.json();
}

/**
 * Fetch products on the server side (inside Docker network).
 * Used by Server Components for SSR/SEO.
 */
export async function fetchProductsSSR(category?: string, limit: number = 50): Promise<Product[]> {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  params.set("limit", String(limit));
  const res = await fetch(`${INTERNAL_API_BASE}/products/?${params.toString()}`, {
    next: { revalidate: 300 }, // 5 min CDN cache
  });
  if (!res.ok) throw new Error("Erreur chargement produits");
  return res.json();
}

export async function fetchTopProducts(category: string): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/products/top5/${encodeURIComponent(category)}`);
  if (!res.ok) throw new Error("Erreur chargement top produits");
  return res.json();
}

export async function fetchProduct(id: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}`);
  if (!res.ok) throw new Error("Produit introuvable");
  return res.json();
}

/**
 * Fetch a single product by slug.
 * Since the backend uses UUID ids, we fetch the full list and match by slug.
 * For production, the backend should expose GET /api/products/slug/{slug}.
 */
export async function fetchProductBySlug(slug: string): Promise<Product> {
  const res = await fetch(`${INTERNAL_API_BASE}/products/?limit=100`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error("Erreur chargement produit");
  const products: Product[] = await res.json();
  const product = products.find((p) => p.slug === slug);
  if (!product) throw new Error("Produit introuvable");
  return product;
}

export async function fetchProductById(id: string): Promise<Product> {
  const res = await fetch(`${INTERNAL_API_BASE}/products/${id}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error("Produit introuvable");
  return res.json();
}

/**
 * Fetch products by category on the server side, sorted by estimated_score descending.
 */
export async function fetchProductsByCategorySSR(
  categorySlug: string,
  limit: number = 50
): Promise<Product[]> {
  const res = await fetch(
    `${INTERNAL_API_BASE}/products/?category=${encodeURIComponent(categorySlug)}&limit=${limit}`,
    { next: { revalidate: 300 } }
  );
  if (!res.ok) throw new Error("Erreur chargement catégorie");
  return res.json();
}

export async function chatWithAI(
  message: string,
  history: { role: string; content: string }[] = []
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Erreur de communication avec l'IA");
  }
  return res.json();
}

export async function subscribeNewsletter(
  email: string,
  name?: string
): Promise<NewsletterResponse> {
  const res = await fetch(`${API_BASE}/newsletter/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name }),
  });
  return res.json();
}
