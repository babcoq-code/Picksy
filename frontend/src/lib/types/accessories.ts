export type QualityBadge = 'official' | 'recommended' | 'compatibility_warning';
export type SafetyLevel = 'safe' | 'verify' | 'avoid';

export interface AccessoryCategory {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  parent_product_category?: string | null;
  danger_warning?: string | null;
  count?: number;
}

export interface AccessoryPrice {
  merchantName: string;
  merchantLogoUrl?: string | null;
  price: number;
  currency: string;
  url: string;
  affiliateUrl: string;
  inStock: boolean;
  checkedAt?: string;
}

export interface CompatibleProduct {
  id: string;
  slug: string;
  name: string;
  brand?: string | null;
  model?: string | null;
  compatibilityStatus: string;
  notes?: string | null;
}

export interface Accessory {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: AccessoryCategory | null;
  imageUrl?: string | null;
  description?: string | null;
  qualityBadge: QualityBadge;
  safetyLevel: SafetyLevel;
  isOfficial: boolean;
  isTroviioRecommended: boolean;
  hasDangerousCopies: boolean;
  whyAvoidCopies?: string | null;
  certifications: string[];
  scoreQuality: number;
  bestPrice?: AccessoryPrice | null;
  compatibleProducts?: CompatibleProduct[];
}

export interface AccessoriesForProductResponse {
  product: {
    id: string;
    slug: string;
    name: string;
    brand?: string | null;
    model?: string | null;
  };
  accessories: Accessory[];
  dangerousCopyWarnings: Array<{
    categorySlug: string;
    categoryName: string;
    warning: string;
  }>;
}

export interface AccessoriesChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}
