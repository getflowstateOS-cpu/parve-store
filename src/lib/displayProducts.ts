import type { ShopifyProduct } from "@/lib/shopify";

const NICHES = [
  "Corporate Luxe",
  "Coastal Grandmother",
  "Minimalist Bride",
  "Resort Luxury",
] as const;

const FABRICS = ["silk", "linen", "satin", "chiffon", "structured"] as const;

export type DisplayProduct = {
  id: string;
  name: string;
  handle: string;
  niche: string;
  price: number;
  fabric: string;
  tag: string;
  imageUrl: string | null;
  variantId: string | null;
  colors: string[];
  desc: string;
};

export const DEMO_PRODUCTS: DisplayProduct[] = [
  {
    id: "d1",
    handle: "ivory-wrap-dress",
    name: "Ivory Wrap Dress",
    niche: "Corporate Luxe",
    price: 148,
    fabric: "silk",
    tag: "Bestseller",
    imageUrl: null,
    variantId: "demo-1",
    colors: ["#F0EDE6", "#DDD5C4", "#C4B49A"],
    desc: "Effortlessly transitions from boardroom to dinner",
  },
  {
    id: "d2",
    handle: "linen-coastal-maxi",
    name: "Linen Coastal Maxi",
    niche: "Coastal Grandmother",
    price: 168,
    fabric: "linen",
    tag: "New Arrival",
    imageUrl: null,
    variantId: "demo-2",
    colors: ["#D8E8D8", "#B8CEB8", "#96B096"],
    desc: "Relaxed luxury for the effortlessly chic",
  },
  {
    id: "d3",
    handle: "satin-bridal-slip",
    name: "Satin Bridal Slip",
    niche: "Minimalist Bride",
    price: 298,
    fabric: "satin",
    tag: "Limited",
    imageUrl: null,
    variantId: "demo-3",
    colors: ["#F4F2E8", "#E8E4D4", "#D4CEBC"],
    desc: "Pure bridal elegance in bias-cut satin",
  },
  {
    id: "d4",
    handle: "resort-kaftan",
    name: "Resort Kaftan",
    niche: "Resort Luxury",
    price: 188,
    fabric: "chiffon",
    tag: "Summer Edit",
    imageUrl: null,
    variantId: "demo-4",
    colors: ["#E8F2E8", "#C8DEC8", "#A8CAA8"],
    desc: "Amalfi Coast energy wherever you are",
  },
  {
    id: "d5",
    handle: "power-sheath",
    name: "Power Sheath",
    niche: "Corporate Luxe",
    price: 178,
    fabric: "structured",
    tag: "Classic",
    imageUrl: null,
    variantId: "demo-5",
    colors: ["#1C2E20", "#142218", "#243826"],
    desc: "Command the room without saying a word",
  },
  {
    id: "d6",
    handle: "sage-linen-dress",
    name: "Sage Linen Dress",
    niche: "Coastal Grandmother",
    price: 218,
    fabric: "linen",
    tag: "Editor Pick",
    imageUrl: null,
    variantId: "demo-6",
    colors: ["#C8D8C4", "#A8BCA4", "#8CA48C"],
    desc: "Old-money aesthetic meets modern comfort",
  },
];

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function mapShopifyToDisplay(
  shopifyProducts: ShopifyProduct[]
): DisplayProduct[] {
  return shopifyProducts.map((p) => ({
    id: p.id,
    name: p.title,
    handle: p.handle,
    niche:
      p.tags.find((t) =>
        NICHES.includes(t as (typeof NICHES)[number])
      ) ?? "New Arrival",
    price: parseFloat(p.priceRange.minVariantPrice.amount),
    fabric:
      p.tags.find((t) =>
        FABRICS.includes(t as (typeof FABRICS)[number])
      ) ?? "silk",
    tag: p.tags[0] ?? "New",
    imageUrl: p.images?.edges?.[0]?.node?.url ?? null,
    variantId: p.variants?.edges?.[0]?.node?.id ?? null,
    colors: ["#F5F0E8", "#E8DDD0", "#C8B8A0"],
    desc: p.description
      ? stripHtml(p.description).slice(0, 140)
      : "Luxury dress for the modern woman",
  }));
}

export function resolveProducts(
  shopifyProducts: ShopifyProduct[]
): DisplayProduct[] {
  if (shopifyProducts.length > 0) {
    return mapShopifyToDisplay(shopifyProducts);
  }
  return DEMO_PRODUCTS;
}
