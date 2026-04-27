import type { Product, ChatResponse, NewsletterResponse } from "@/types";

// URL API publique (client-side)
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://troviio.com/api";

/**
 * Internal base for server-to-server calls within Docker.
 * C'est le hostname Docker "backend" (stable), pas une IP dynamique.
 */
const INTERNAL_API_BASE =
  process.env.INTERNAL_API_URL || "http://backend:8000/api";

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
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

export async function fetchProducts(
  category?: string,
  limit: number = 50
): Promise<Product[]> {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  params.set("limit", String(limit));
  const res = await fetch(`${API_BASE}/products/?${params.toString()}`);
  if (!res.ok) throw new Error("Erreur chargement produits");
  return res.json();
}

export async function fetchProductsSSR(
  category?: string,
  limit: number = 50
): Promise<Product[]> {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  params.set("limit", String(limit));
  const res = await fetch(
    `${INTERNAL_API_BASE}/products/?${params.toString()}`,
    { next: { revalidate: 300 } }
  );
  if (!res.ok) throw new Error("Erreur chargement produits");
  return res.json();
}

export async function fetchTopProducts(category: string): Promise<Product[]> {
  const res = await fetch(
    `${API_BASE}/products/top5/${encodeURIComponent(category)}`
  );
  if (!res.ok) throw new Error("Erreur chargement top produits");
  return res.json();
}

export async function fetchProduct(id: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}`);
  if (!res.ok) throw new Error("Produit introuvable");
  return res.json();
}

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
  const endpoint = `${API_BASE}/chat`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { detail?: string }).detail || "Erreur de communication avec l'IA"
    );
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
