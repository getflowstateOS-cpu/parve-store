import { NextResponse } from "next/server";
import { fetchShopifyCatalog } from "@/lib/shopify";

export const dynamic = "force-dynamic";

export async function GET() {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;

  if (!domain || !token) {
    return NextResponse.json(
      {
        ok: false,
        connected: false,
        error: "Missing Shopify environment variables on server",
        hint: "Set NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN, NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN, and NEXT_PUBLIC_SHOPIFY_API_VERSION=2025-10 in Vercel → Settings → Environment Variables, then redeploy.",
        env: {
          domain: Boolean(domain),
          token: Boolean(token),
        },
        products: [],
      },
      { status: 500 }
    );
  }

  const result = await fetchShopifyCatalog();

  if (!result.connected) {
    return NextResponse.json(
      {
        ok: false,
        connected: false,
        store: domain,
        apiVersion: result.apiVersion,
        error: result.error,
        products: [],
        testedAt: new Date().toISOString(),
      },
      { status: 502 }
    );
  }

  const emptyCatalog = result.products.length === 0;

  return NextResponse.json({
    ok: true,
    connected: true,
    store: domain,
    shopName: result.shopName,
    apiVersion: result.apiVersion,
    productCount: result.products.length,
    products: result.products,
    usingDemoOnSite: emptyCatalog,
    message: emptyCatalog
      ? "Shopify is connected but returned 0 products. In Shopify Admin → Products: create a product, set Status to Active, and enable the Online Store sales channel (or Headless for custom storefronts)."
      : `${result.products.length} product(s) available to the storefront.`,
    testedAt: new Date().toISOString(),
  });
}
