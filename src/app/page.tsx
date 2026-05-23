import { DEMO_PRODUCTS, resolveProductBadge, type DisplayProduct } from "@/lib/displayProducts";
import HomePageClient from "@/components/HomePageClient";

export const dynamic = "force-dynamic";

const STORE_DOMAIN =
  process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ?? "parve-7.myshopify.com";
const STOREFRONT_TOKEN =
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN ??
  "b4d48e18e3f03174e104efad206d042e";
const API_VERSION =
  process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION ?? "2025-01";

interface ShopifyProductNode {
  id: string;
  title: string;
  handle: string;
  description: string;
  tags: string[];
  priceRange: { minVariantPrice: { amount: string } };
  images: { edges: { node: { url: string; altText: string | null } }[] };
  variants: { edges: { node: { id: string; availableForSale: boolean } }[] };
}

interface ShopifyProductsResponse {
  data?: {
    products?: {
      edges: { node: ShopifyProductNode }[];
    };
  };
  errors?: unknown;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

async function getShopifyProducts(): Promise<DisplayProduct[]> {
  try {
    const response = await fetch(
      `https://${STORE_DOMAIN}/api/${API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
        },
        body: JSON.stringify({
          query: `{
            products(first: 20) {
              edges {
                node {
                  id
                  title
                  handle
                  description
                  tags
                  priceRange {
                    minVariantPrice {
                      amount
                    }
                  }
                  images(first: 1) {
                    edges {
                      node {
                        url
                        altText
                      }
                    }
                  }
                  variants(first: 1) {
                    edges {
                      node {
                        id
                        availableForSale
                      }
                    }
                  }
                }
              }
            }
          }`,
        }),
        cache: "no-store",
      }
    );

    const data = (await response.json()) as ShopifyProductsResponse;

    if (!response.ok || data.errors) {
      return [];
    }

    return (
      data.data?.products?.edges.map((e) => ({
        id: e.node.id,
        name: e.node.title,
        handle: e.node.handle,
        niche:
          e.node.tags.find((t) =>
            [
              "Corporate Luxe",
              "Coastal Grandmother",
              "Minimalist Bride",
              "Resort Luxury",
            ].includes(t)
          ) ?? "New Arrival",
        price: parseFloat(e.node.priceRange.minVariantPrice.amount),
        fabric:
          e.node.tags.find((t) =>
            ["silk", "linen", "satin", "chiffon", "structured"].includes(t)
          ) ?? "silk",
        tag: resolveProductBadge(e.node.tags[0] ?? "New Arrival"),
        imageUrl: e.node.images?.edges?.[0]?.node?.url ?? null,
        variantId: e.node.variants?.edges?.[0]?.node?.id ?? null,
        colors: ["#F5F0E8", "#E8DDD0", "#C8B8A0"],
        desc: e.node.description
          ? stripHtml(e.node.description).slice(0, 140)
          : "Luxury dress for the modern woman",
      })) ?? []
    );
  } catch {
    return [];
  }
}

export default async function Home() {
  const shopifyProducts = await getShopifyProducts();
  const displayProducts =
    shopifyProducts.length > 0 ? shopifyProducts : DEMO_PRODUCTS;

  const shopifyNotice =
    shopifyProducts.length === 0
      ? {
          type: "empty" as const,
          message:
            "No Shopify products returned yet — showing demo collection. Add products in Shopify Admin (Active + Online Store channel).",
        }
      : null;

  return (
    <HomePageClient
      products={displayProducts}
      shopifyNotice={shopifyNotice}
      shopifyMeta={{
        connected: true,
        productCount: shopifyProducts.length,
        apiVersion: API_VERSION,
      }}
    />
  );
}
