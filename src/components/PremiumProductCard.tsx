'use client'

import { useState } from 'react'
import type { DisplayProduct } from '@/lib/displayProducts'
import {
  getReviewCount,
  resolveProductBadge,
} from '@/lib/displayProducts'
import { useCartStore } from '@/store/cartStore'
import FabricCanvas from '@/components/FabricCanvas'
import Viewer360Modal from '@/components/Viewer360Modal'

const SIZES = ['XS', 'S', 'M', 'L', 'XL'] as const
const GOLD = '#C9A96E'

interface PremiumProductCardProps {
  product: DisplayProduct
  cardRef?: (el: HTMLDivElement | null) => void
}

export default function PremiumProductCard({
  product,
  cardRef,
}: PremiumProductCardProps) {
  const [hovered, setHovered] = useState(false)
  const [adding, setAdding] = useState(false)
  const [buying, setBuying] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string>('M')
  const { addItemWithShopify, buyNowWithShopify } = useCartStore()

  const badge = resolveProductBadge(product.tag)
  const reviewCount = getReviewCount(product.id)

  const buildItem = () => ({
    variantId: product.variantId ?? '',
    productTitle: product.name,
    variantTitle: selectedSize,
    price: product.price,
    quantity: 1,
    imageUrl: product.imageUrl ?? undefined,
  })

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!product.variantId) return
    setAdding(true)
    await addItemWithShopify(buildItem())
    setAdding(false)
  }

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!product.variantId) return
    setBuying(true)
    await buyNowWithShopify(buildItem())
    setBuying(false)
  }

  const open360 = (e: React.MouseEvent) => {
    e.stopPropagation()
    setViewerOpen(true)
  }

  const btnBase: React.CSSProperties = {
    flex: 1,
    padding: '11px 0',
    border: 'none',
    fontFamily: 'Jost, sans-serif',
    fontSize: 8,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    transition: 'all 0.3s',
    cursor: 'pointer',
  }

  return (
    <>
      <div
        ref={cardRef}
        data-product-card={product.id}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: '#fff',
          transition:
            'transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.55s',
          transform: hovered ? 'translateY(-14px)' : 'translateY(0)',
          boxShadow: hovered
            ? '0 40px 80px rgba(15,26,20,0.1)'
            : '0 2px 24px rgba(15,26,20,0.04)',
        }}
      >
        <div
          style={{
            aspectRatio: '3/4',
            position: 'relative',
            overflow: 'hidden',
            background: product.colors[0],
          }}
          data-cursor="view"
        >
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.6s ease',
                transform: hovered ? 'scale(1.06)' : 'scale(1)',
              }}
            />
          ) : (
            <FabricCanvas
              fabric={product.fabric}
              colors={product.colors}
              speed={hovered ? 2 : 1}
            />
          )}

          <div
            style={{
              position: 'absolute',
              top: 14,
              left: 14,
              background: GOLD,
              color: '#0F1A14',
              fontFamily: 'Jost, sans-serif',
              fontSize: 8,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              padding: '5px 12px',
              fontWeight: 500,
            }}
          >
            {badge}
          </div>

          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(15,26,20,0.52)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              justifyContent: 'flex-end',
              padding: 16,
              gap: 10,
              opacity: hovered ? 1 : 0,
              transition: 'opacity 0.38s',
            }}
          >
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
              {SIZES.map((size) => (
                <button
                  key={size}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedSize(size)
                  }}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    border:
                      selectedSize === size
                        ? `1.5px solid ${GOLD}`
                        : '1px solid rgba(250,252,251,0.45)',
                    background:
                      selectedSize === size
                        ? 'rgba(201,169,110,0.25)'
                        : 'transparent',
                    color: '#FAFCFB',
                    fontFamily: 'Jost, sans-serif',
                    fontSize: 9,
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                  }}
                >
                  {size}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={handleAdd}
                disabled={adding || !product.variantId}
                style={{
                  ...btnBase,
                  background: adding ? '#357A4E' : '#FAFCFB',
                  color: adding ? '#fff' : '#0F1A14',
                }}
              >
                {adding ? 'Adding...' : 'Add to Bag'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={buying || !product.variantId}
                style={{
                  ...btnBase,
                  background: 'transparent',
                  color: '#FAFCFB',
                  border: '1px solid rgba(250,252,251,0.55)',
                }}
              >
                {buying ? '...' : 'Buy Now'}
              </button>
            </div>

            <button
              onClick={open360}
              style={{
                ...btnBase,
                flex: 'none',
                background: 'rgba(201,169,110,0.15)',
                color: GOLD,
                border: `1px solid ${GOLD}`,
              }}
            >
              360° View
            </button>
          </div>
        </div>

        <div style={{ padding: '20px 18px 22px' }}>
          <p
            style={{
              fontFamily: 'Jost, sans-serif',
              fontSize: 9,
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color: '#4A9063',
              marginBottom: 8,
            }}
          >
            {product.niche}
          </p>
          <h3
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 21,
              fontWeight: 300,
              color: '#0F1A14',
              marginBottom: 10,
              lineHeight: 1.2,
            }}
          >
            {product.name}
          </h3>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 10,
            }}
          >
            <span style={{ color: GOLD, fontSize: 12, letterSpacing: 2 }}>
              ★★★★★
            </span>
            <span
              style={{
                fontFamily: 'Jost, sans-serif',
                fontSize: 10,
                color: '#5A6B60',
                letterSpacing: '0.06em',
              }}
            >
              ({reviewCount} reviews)
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <span
              style={{
                fontFamily: 'Jost, sans-serif',
                fontSize: 14,
                color: '#5A6B60',
                letterSpacing: '0.04em',
              }}
            >
              ${product.price.toFixed(2)}
            </span>
            <div style={{ display: 'flex', gap: 5 }}>
              {product.colors.map((c, i) => (
                <div
                  key={i}
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    background: c,
                    border: '0.5px solid rgba(15,26,20,0.12)',
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: 'Jost, sans-serif',
                fontSize: 8,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: GOLD,
              }}
            >
              Free US Shipping
            </span>
            <span
              style={{
                fontFamily: 'Jost, sans-serif',
                fontSize: 8,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: GOLD,
              }}
            >
              Easy Returns
            </span>
          </div>
        </div>
      </div>

      <Viewer360Modal
        product={product}
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        selectedSize={selectedSize}
      />
    </>
  )
}

