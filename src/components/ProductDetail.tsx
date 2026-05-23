"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/store/cartStore";

interface ProductDetailProps {
  product: ShopifyProduct;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [adding, setAdding] = useState(false);
  const { addItemWithShopify } = useCartStore();
  const variant = product.variants.edges[0]?.node;
  const image = product.images.edges[0]?.node;

  const handleAdd = async () => {
    if (!variant) return;
    setAdding(true);
    await addItemWithShopify({
      variantId: variant.id,
      productTitle: product.title,
      variantTitle: variant.title,
      price: parseFloat(variant.price.amount),
      quantity: 1,
      imageUrl: image?.url,
    });
    setAdding(false);
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "120px 24px 80px",
        maxWidth: 1100,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 48,
        background: "var(--off-white)",
      }}
    >
      <div
        style={{
          aspectRatio: "3/4",
          position: "relative",
          background: "#E0EDE5",
          overflow: "hidden",
        }}
      >
        {image?.url && (
          <Image
            src={image.url}
            alt={image.altText ?? product.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit: "cover" }}
            priority
          />
        )}
      </div>

      <div>
        <Link
          href="/#collection"
          style={{
            fontFamily: "Jost, sans-serif",
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#4A9063",
          }}
        >
          ← Back to collection
        </Link>
        <h1
          style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 300,
            marginTop: 24,
            color: "#0F1A14",
          }}
        >
          {product.title}
        </h1>
        <p
          style={{
            fontFamily: "Jost, sans-serif",
            fontSize: 14,
            color: "#5A6B60",
            marginTop: 16,
            lineHeight: 1.8,
          }}
        >
          {product.description}
        </p>
        <p
          style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: 28,
            marginTop: 32,
            color: "#0F1A14",
          }}
        >
          $
          {parseFloat(
            variant?.price.amount ??
              product.priceRange.minVariantPrice.amount
          ).toFixed(2)}
        </p>
        <button
          type="button"
          onClick={handleAdd}
          disabled={adding || !variant?.availableForSale}
          style={{
            marginTop: 32,
            width: "100%",
            padding: "16px",
            background: "#4A9063",
            color: "#fff",
            border: "none",
            fontFamily: "Jost, sans-serif",
            fontSize: 10,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
          }}
        >
          {adding ? "Adding..." : "Add to Bag"}
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          main { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
