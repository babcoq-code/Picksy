export type RecommendationItem = {
  rank: number;
  rank_label: string;
  name: string;
  brand: string;
  score: number;
  price_range: string;
  price_eur: number | null;
  image_url: string | null;
  affiliate_url: string | null;
  amazon_asin: string | null;
  why_perfect: string;
  pros: string[];
  cons: string[];
  use_case_scores: Record<string, number>;
  specs: Record<string, unknown>;
};

export type RecommendationResult = {
  result_id: string;
  created_at: string;
  profile: {
    categorie: string;
    budget_max: number;
    criteres: string[];
    resume: string;
  };
  recommendations: RecommendationItem[];
  metadata: Record<string, unknown>;
};
