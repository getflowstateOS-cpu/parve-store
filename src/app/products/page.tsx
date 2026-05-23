import { getAllProducts } from "@/lib/shopify";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "All Dresses — Parvé",
  description: "Browse our full collection of ultra-premium luxury dresses.",
};

export default async function ProductsPage() {
  const products = await getAllProducts();

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "120px 24px 80px",
        maxWidth: 1200,
        margin: "0 auto",
        background: "var(--off-white)",
      }}
    >
      <h1
        style={{
          fontFamily: "Cormorant Garamond, serif",
          fontSize: "clamp(2rem, 5vw, 3rem)",
          fontWeight: 300,
          marginBottom: 40,
          color: "#0F1A14",
        }}
      >
        All Dresses
      </h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 24,
        }}
      >
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.handle}`}
            style={{
              background: "#fff",
              padding: 20,
              boxShadow: "0 2px 24px rgba(15,26,20,0.06)",
            }}
          >
            <p
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: 20,
                color: "#0F1A14",
              }}
            >
              {product.title}
            </p>
            <p
              style={{
                fontFamily: "Jost, sans-serif",
                fontSize: 13,
                color: "#5A6B60",
                marginTop: 8,
              }}
            >
              $
              {parseFloat(
                product.priceRange.minVariantPrice.amount
              ).toFixed(2)}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
