// ─── Product Types ──────────────────────────────────────────

export interface ProductSpecs {
  [key: string]: string | number | null;
}

export interface UseCaseScores {
  [key: string]: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  image_url: string | null;
  estimated_score: number | null;
  price_eur: number | null;
  specs: ProductSpecs;
  use_case_scores: UseCaseScores;
  affiliate_url: string | null;
  amazon_asin: string | null;
  category_slug: string;
  category_name: string;
  category_emoji: string;
  pros: string[];
  cons: string[];
  summary: string | null;
  best_for: string | null;
  status: string;
  source_url: string | null;
  source_title: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Category Types ─────────────────────────────────────────

export interface Category {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  description: string | null;
  product_count?: number;
}

// ─── Chat Types ──────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
  user_id?: string;
}

export interface ChatResponse {
  reply: string;
  is_scope: boolean;
  action?: string | null;
  profile?: Record<string, unknown> | null;
  recommendations?: Product[] | null;
  result_id?: string | null;
<<<<<<< HEAD
=======
  options?: string[];
>>>>>>> 4e3d4795 (feat(chat): Chat IA v2 — clic catégorie → IA parle en premier)
}

// ─── Newsletter Types ────────────────────────────────────────

export interface NewsletterRequest {
  email: string;
  name?: string;
  categories?: string[];
}

export interface NewsletterResponse {
  success: boolean;
  message: string;
}

// ─── Site Config Types ───────────────────────────────────────

export interface SiteConfig {
  name: string;
  slogan: string;
  description: string;
  url: string;
  ogImage: string;
  publisherName: string;
  publisherSiret: string;
  publisherAddress: string;
  publisherEmail: string;
  publisherPhone: string;
  publisherRcs: string;
  publisherTva: string;
  hostName: string;
  hostAddress: string;
  hostEmail: string;
  cnilNumber: string;
  editorName: string;
  editorAddress: string;
  editorEmail: string;
  directorName: string;
  legalEmail?: string;
  // Champs objets pour compatibilité pages légales
  publisher: {
    name: string;
    siret: string;
    address: string;
    postalCode: string;
    city: string;
    country: string;
    phone: string;
  };
  hosting: {
    name: string;
    address: string;
    phone: string;
    website: string;
  };
}
