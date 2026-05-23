import { getAllProducts } from "@/lib/shopify";
import { resolveProducts } from "@/lib/displayProducts";
import HomePageClient from "@/components/HomePageClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  let shopifyProducts: Awaited<ReturnType<typeof getAllProducts>> = [];

  try {
    shopifyProducts = await getAllProducts();
  } catch {
    shopifyProducts = [];
  }

  const products = resolveProducts(shopifyProducts);

  return <HomePageClient products={products} />;
}
