import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductByHandle } from "@/lib/shopify";
import ProductDetail from "@/components/ProductDetail";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    return { title: "Product Not Found — Parvé" };
  }

  return {
    title: `${product.title} — Parvé`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) notFound();

  return <ProductDetail product={product} />;
}
