const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG ?? "picksy-21";

export type ProductForAffiliate = {
  affiliateUrl?: string | null;
  amazonAsin?: string | null;
  name?: string;
};

export function buildAffiliateUrl(product: ProductForAffiliate): string | null {
  if (product.affiliateUrl) {
    try {
      const url = new URL(product.affiliateUrl);
      url.searchParams.set("tag", AMAZON_TAG);
      return url.toString();
    } catch {
      return product.affiliateUrl;
    }
  }
  if (product.amazonAsin) {
    return `https://www.amazon.fr/dp/${product.amazonAsin}?tag=${AMAZON_TAG}`;
  }
  return null;
}
