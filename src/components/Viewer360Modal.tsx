'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { DisplayProduct } from '@/lib/displayProducts'
import { useCartStore } from '@/store/cartStore'
import FabricCanvas from '@/components/FabricCanvas'

interface Viewer360ModalProps {
  product: DisplayProduct
  open: boolean
  onClose: () => void
  selectedSize: string
}

export default function Viewer360Modal({
  product,
  open,
  onClose,
  selectedSize,
}: Viewer360ModalProps) {
  const [rotation, setRotation] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [adding, setAdding] = useState(false)
  const lastXRef = useRef(0)
  const rafRef = useRef(0)
  const { addItemWithShopify } = useCartStore()

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!open || dragging) return

    const tick = () => {
      setRotation((r) => r + 0.012)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [open, dragging])

  const onPointerDown = useCallback((clientX: number) => {
    setDragging(true)
    lastXRef.current = clientX
  }, [])

  const onPointerMove = useCallback(
    (clientX: number) => {
      if (!dragging) return
      const delta = clientX - lastXRef.current
      lastXRef.current = clientX
      setRotation((r) => r + delta * 0.018)
    },
    [dragging]
  )

  const onPointerUp = useCallback(() => setDragging(false), [])

  const handleAdd = async () => {
    if (!product.variantId) return
    setAdding(true)
    await addItemWithShopify({
      variantId: product.variantId,
      productTitle: product.name,
      variantTitle: selectedSize,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl ?? undefined,
    })
    setAdding(false)
    onClose()
  }

  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(15,26,20,0.82)',
          backdropFilter: 'blur(8px)',
        }}
      />

      <div
        className="viewer360-grid"
        style={{
          position: 'relative',
          width: 'min(920px, 100%)',
          maxHeight: '90vh',
          background: '#FAFCFB',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          overflow: 'hidden',
          boxShadow: '0 40px 120px rgba(15,26,20,0.35)',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 2,
            background: 'none',
            border: 'none',
            fontSize: 22,
            color: '#5A6B60',
            cursor: 'pointer',
          }}
          aria-label="Close"
        >
          ✕
        </button>

        <div
          style={{
            position: 'relative',
            background: product.colors[0],
            minHeight: 420,
            cursor: dragging ? 'grabbing' : 'grab',
            touchAction: 'none',
            userSelect: 'none',
          }}
          onMouseDown={(e) => onPointerDown(e.clientX)}
          onMouseMove={(e) => onPointerMove(e.clientX)}
          onMouseUp={onPointerUp}
          onMouseLeave={onPointerUp}
          onTouchStart={(e) => onPointerDown(e.touches[0].clientX)}
          onTouchMove={(e) => {
            e.preventDefault()
            onPointerMove(e.touches[0].clientX)
          }}
          onTouchEnd={onPointerUp}
        >
          <FabricCanvas
            fabric={product.fabric}
            colors={product.colors}
            speed={dragging ? 0.5 : 1.2}
            rotation={rotation}
          />
          <p
            style={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              fontFamily: 'Jost, sans-serif',
              fontSize: 9,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: 'rgba(15,26,20,0.45)',
              pointerEvents: 'none',
            }}
          >
            Drag to rotate · Auto-spin when idle
          </p>
        </div>

        <div style={{ padding: '40px 36px', overflowY: 'auto' }}>
          <p
            style={{
              fontFamily: 'Jost, sans-serif',
              fontSize: 9,
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color: '#C9A96E',
              marginBottom: 10,
            }}
          >
            360° View
          </p>
          <h2
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 32,
              fontWeight: 300,
              color: '#0F1A14',
              marginBottom: 8,
              lineHeight: 1.2,
            }}
          >
            {product.name}
          </h2>
          <p
            style={{
              fontFamily: 'Jost, sans-serif',
              fontSize: 16,
              color: '#5A6B60',
              marginBottom: 20,
            }}
          >
            ${product.price.toFixed(2)}
          </p>

          <div style={{ marginBottom: 24 }}>
            <p
              style={{
                fontFamily: 'Jost, sans-serif',
                fontSize: 9,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: '#5A6B60',
                marginBottom: 8,
              }}
            >
              Fabric
            </p>
            <p
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 18,
                fontStyle: 'italic',
                color: '#0F1A14',
                textTransform: 'capitalize',
              }}
            >
              {product.fabric}
            </p>
          </div>

          <p
            style={{
              fontFamily: 'Jost, sans-serif',
              fontSize: 12,
              color: '#5A6B60',
              lineHeight: 1.8,
              marginBottom: 28,
              letterSpacing: '0.04em',
            }}
          >
            {product.desc}
          </p>

          <p
            style={{
              fontFamily: 'Jost, sans-serif',
              fontSize: 9,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: '#5A6B60',
              marginBottom: 10,
            }}
          >
            Size · {selectedSize}
          </p>

          <button
            onClick={handleAdd}
            disabled={adding || !product.variantId}
            style={{
              width: '100%',
              padding: '16px 0',
              background: adding ? '#357A4E' : '#0F1A14',
              color: '#FAFCFB',
              border: 'none',
              fontFamily: 'Jost, sans-serif',
              fontSize: 10,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'background 0.3s',
            }}
            onMouseEnter={(e) => {
              if (!adding) e.currentTarget.style.background = '#C9A96E'
            }}
            onMouseLeave={(e) => {
              if (!adding) e.currentTarget.style.background = '#0F1A14'
            }}
          >
            {adding ? 'Adding...' : 'Add to Bag'}
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .viewer360-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
