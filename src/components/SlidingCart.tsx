'use client'
import { useCartStore } from '@/store/cartStore'

export default function SlidingCart() {
  const { items, isOpen, toggleCart, removeItem, total, checkoutUrl } = useCartStore()

  return (
    <>
      {isOpen && (
        <div
          onClick={toggleCart}
          style={{
            position: 'fixed', inset: 0, zIndex: 150,
            background: 'rgba(15,26,20,0.5)',
            backdropFilter: 'blur(4px)',
            transition: 'opacity 0.4s',
          }}
        />
      )}

      <div style={{
        position: 'fixed', top: 0, right: 0,
        width: '100%', maxWidth: 420, height: '100vh',
        background: '#FAFCFB', zIndex: 160,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)',
        display: 'flex', flexDirection: 'column',
        borderLeft: '0.5px solid rgba(96,180,130,0.15)',
      }}>

        <div style={{
          padding: '24px 28px',
          borderBottom: '0.5px solid rgba(96,180,130,0.15)',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <p style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 22, fontWeight: 300, color: '#0F1A14',
              letterSpacing: '0.05em',
            }}>Your Bag</p>
            <p style={{
              fontFamily: 'Jost, sans-serif', fontSize: 10,
              letterSpacing: '0.2em', color: '#5A6B60',
              textTransform: 'uppercase', marginTop: 2,
            }}>{items.length} {items.length === 1 ? 'piece' : 'pieces'}</p>
          </div>
          <button onClick={toggleCart} style={{
            background: 'none', border: 'none',
            fontSize: 20, color: '#5A6B60', lineHeight: 1,
          }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 28px' }}>
          {items.length === 0 ? (
            <div style={{
              height: '100%', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 16, textAlign: 'center',
            }}>
              <p style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 26, fontWeight: 300,
                color: '#0F1A14', fontStyle: 'italic',
              }}>Your bag is empty</p>
              <p style={{
                fontFamily: 'Jost, sans-serif', fontSize: 11,
                color: '#5A6B60', letterSpacing: '0.1em',
              }}>Add pieces to begin your edit</p>
              <button onClick={toggleCart} style={{
                marginTop: 8, padding: '12px 32px',
                background: '#4A9063', color: '#fff',
                border: 'none', fontFamily: 'Jost, sans-serif',
                fontSize: 10, letterSpacing: '0.25em',
                textTransform: 'uppercase',
              }}>Explore Collection</button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} style={{
                display: 'flex', gap: 16, marginBottom: 24,
                paddingBottom: 24,
                borderBottom: '0.5px solid rgba(96,180,130,0.1)',
              }}>
                <div style={{
                  width: 80, height: 100, flexShrink: 0,
                  background: '#E0EDE5', overflow: 'hidden',
                }}>
                  {item.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: 17, fontWeight: 300, marginBottom: 4,
                  }}>{item.title}</p>
                  <p style={{
                    fontFamily: 'Jost, sans-serif', fontSize: 12,
                    color: '#5A6B60', marginBottom: 12,
                  }}>${parseFloat(item.price).toFixed(2)}</p>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{
                      fontFamily: 'Jost, sans-serif', fontSize: 11,
                      color: '#5A6B60',
                    }}>Qty: {item.quantity}</span>
                    <button onClick={() => removeItem(item.id)} style={{
                      background: 'none', border: 'none',
                      fontFamily: 'Jost, sans-serif', fontSize: 9,
                      letterSpacing: '0.2em', textTransform: 'uppercase',
                      color: '#5A6B60',
                      textDecoration: 'underline',
                    }}>Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div style={{
            padding: '20px 28px 32px',
            borderTop: '0.5px solid rgba(96,180,130,0.15)',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              marginBottom: 20,
            }}>
              <span style={{
                fontFamily: 'Jost, sans-serif', fontSize: 11,
                letterSpacing: '0.2em', textTransform: 'uppercase',
                color: '#5A6B60',
              }}>Subtotal</span>
              <span style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 22, fontWeight: 300,
              }}>${total.toFixed(2)}</span>
            </div>
            <a
              href={checkoutUrl || '#'}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'block', width: '100%',
                padding: '15px', textAlign: 'center',
                background: '#4A9063', color: '#fff',
                fontFamily: 'Jost, sans-serif', fontSize: 10,
                letterSpacing: '0.3em', textTransform: 'uppercase',
                textDecoration: 'none',
                transition: 'background 0.3s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#357A4E')}
              onMouseLeave={e => (e.currentTarget.style.background = '#4A9063')}>
              Proceed to Checkout
            </a>
            <p style={{
              marginTop: 12, textAlign: 'center',
              fontFamily: 'Jost, sans-serif', fontSize: 10,
              color: '#5A6B60', letterSpacing: '0.1em',
            }}>Free shipping on orders over $75</p>
          </div>
        )}
      </div>
    </>
  )
}
