'use client'

import { useState } from 'react'
import type { DisplayProduct } from '@/lib/displayProducts'
import { useCartStore } from '@/store/cartStore'

interface MobileProductStickyBarProps {
  product: DisplayProduct | null
  visible: boolean
}

export default function MobileProductStickyBar({
  product,
  visible,
}: MobileProductStickyBarProps) {
  const [adding, setAdding] = useState(false)
  const { addItemWithShopify } = useCartStore()

  if (!product || !visible) return null

  const handleAdd = async () => {
    if (!product.variantId) return
    setAdding(true)
    await addItemWithShopify({
      variantId: product.variantId,
      productTitle: product.name,
      variantTitle: 'M',
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl ?? undefined,
    })
    setAdding(false)
  }

  return (
    <div
      className="mobile-sticky-bar"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 120,
        background: 'rgba(250,252,251,0.97)',
        backdropFilter: 'blur(16px)',
        borderTop: '0.5px solid rgba(201,169,110,0.35)',
        padding: '12px 16px calc(12px + env(safe-area-inset-bottom))',
        display: 'none',
        flexDirection: 'column',
        gap: 10,
        boxShadow: '0 -8px 32px rgba(15,26,20,0.08)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 16,
            fontWeight: 400,
            color: '#0F1A14',
            flex: 1,
            minWidth: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            paddingRight: 12,
          }}
        >
          {product.name}
        </p>
        <p
          style={{
            fontFamily: 'Jost, sans-serif',
            fontSize: 13,
            color: '#C9A96E',
            flexShrink: 0,
          }}
        >
          ${product.price.toFixed(2)}
        </p>
      </div>
      <button
        onClick={handleAdd}
        disabled={adding || !product.variantId}
        style={{
          width: '100%',
          padding: '14px 20px',
          background: adding ? '#357A4E' : '#0F1A14',
          color: '#FAFCFB',
          border: 'none',
          fontFamily: 'Jost, sans-serif',
          fontSize: 9,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
        }}
      >
        {adding ? 'Adding...' : 'Add to Bag'}
      </button>
      <style>{`
        @media (max-width: 768px) {
          .mobile-sticky-bar {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  )
}

