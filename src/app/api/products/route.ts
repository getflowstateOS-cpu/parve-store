import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/shopify";

export const dynamic = "force-dynamic";

export async function GET() {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;
  const apiVersion = process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION;

  if (!domain || !token || !apiVersion) {
    return NextResponse.json(
      {
        ok: false,
        connected: false,
        error: "Missing Shopify environment variables",
        env: {
          domain: Boolean(domain),
          token: Boolean(token),
          apiVersion: Boolean(apiVersion),
        },
        products: [],
      },
      { status: 500 }
    );
  }

  try {
    const products = await getAllProducts();

    return NextResponse.json({
      ok: true,
      connected: true,
      store: domain,
      apiVersion,
      productCount: products.length,
      products,
      testedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Shopify error";

    return NextResponse.json(
      {
        ok: false,
        connected: false,
        store: domain,
        apiVersion,
        error: message,
        products: [],
        testedAt: new Date().toISOString(),
      },
      { status: 502 }
    );
  }
}
