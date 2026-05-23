import { fetchShopifyCatalog } from "@/lib/shopify";
import { mapShopifyToDisplay, DEMO_PRODUCTS } from "@/lib/displayProducts";
import HomePageClient from "@/components/HomePageClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  const catalog = await fetchShopifyCatalog();

  const usingShopify = catalog.connected && catalog.products.length > 0;
  const products = usingShopify
    ? mapShopifyToDisplay(catalog.products)
    : DEMO_PRODUCTS;

  const shopifyNotice = !usingShopify
    ? catalog.connected
      ? {
          type: "empty" as const,
          message:
            "Shopify is connected, but your store has no products published to the Online Store yet. The grid below shows demo pieces until you add products in Shopify Admin.",
        }
      : {
          type: "error" as const,
          message:
            catalog.error ??
            "Could not reach Shopify. Check your API token in Vercel environment variables.",
        }
    : null;

  return (
    <HomePageClient
      products={products}
      shopifyNotice={shopifyNotice}
      shopifyMeta={{
        connected: catalog.connected,
        productCount: catalog.products.length,
        shopName: catalog.shopName,
        apiVersion: catalog.apiVersion,
      }}
    />
  );
}
