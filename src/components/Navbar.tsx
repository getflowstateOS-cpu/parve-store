'use client'
import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/cartStore'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { getCount, toggleCart } = useCartStore()
  const count = getCount()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const linkStyle: React.CSSProperties = {
    fontFamily: 'Jost, sans-serif', fontSize: 10,
    letterSpacing: '0.28em', textTransform: 'uppercase',
    color: '#0F1A14', textDecoration: 'none',
    paddingBottom: 2,
    borderBottom: '1px solid transparent',
    transition: 'border-color 0.3s, color 0.3s',
  }

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        zIndex: 100, padding: '0 32px',
        height: 64,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        background: scrolled
          ? 'rgba(250,252,251,0.96)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(24px)' : 'none',
        borderBottom: scrolled
          ? '0.5px solid rgba(96,180,130,0.2)'
          : 'none',
        transition: 'all 0.5s cubic-bezier(0.25,0.46,0.45,0.94)',
      }}>

        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <button
            onClick={() => setMenuOpen(true)}
            style={{
              background: 'none', border: 'none',
              display: 'flex', flexDirection: 'column',
              gap: 5, padding: 4,
            }}>
            {[0,1,2].map(i => (
              <span key={i} style={{
                display: 'block', width: i === 1 ? 16 : 22,
                height: 1, background: '#0F1A14',
                transition: 'width 0.3s',
              }} />
            ))}
          </button>
          <div style={{ display: 'flex', gap: 28 }}
            className="nav-links-desktop">
            {['New Arrivals', 'Collections', 'About'].map(l => (
              <a key={l} href="#" style={linkStyle}
                onMouseEnter={e => {
                  (e.target as HTMLElement).style.borderBottomColor = '#4A9063'
                  ;(e.target as HTMLElement).style.color = '#4A9063'
                }}
                onMouseLeave={e => {
                  (e.target as HTMLElement).style.borderBottomColor = 'transparent'
                  ;(e.target as HTMLElement).style.color = '#0F1A14'
                }}>
                {l}
              </a>
            ))}
          </div>
        </div>

        <div style={{
          position: 'absolute', left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 20, fontWeight: 300,
          letterSpacing: '0.45em', color: '#0F1A14',
          userSelect: 'none',
        }}>
          PARVÉ
        </div>

        <button onClick={toggleCart} style={{
          background: 'none', border: 'none',
          fontFamily: 'Jost, sans-serif', fontSize: 10,
          letterSpacing: '0.28em', textTransform: 'uppercase',
          color: '#0F1A14', display: 'flex',
          alignItems: 'center', gap: 8,
        }}>
          BAG
          {count > 0 && (
            <span style={{
              width: 18, height: 18, borderRadius: '50%',
              background: '#4A9063', color: '#fff',
              fontSize: 9, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontWeight: 400,
            }}>{count}</span>
          )}
        </button>
      </nav>

      {menuOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: '#0F1A14',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 36,
        }}>
          <button onClick={() => setMenuOpen(false)} style={{
            position: 'absolute', top: 24, right: 32,
            background: 'none', border: 'none',
            color: 'rgba(255,255,255,0.5)', fontSize: 24,
          }}>✕</button>
          {[
            'New Arrivals', 'Collections',
            'Corporate Luxe', 'Coastal Grandmother',
            'Minimalist Bride', 'Resort Luxury', 'About',
          ].map((link) => (
            <a key={link} href="#"
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 'clamp(28px, 5vw, 44px)',
                fontWeight: 300, letterSpacing: '0.08em',
                color: '#FAFCFB', textDecoration: 'none',
                transition: 'color 0.3s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#6AAB80')}
              onMouseLeave={e => (e.currentTarget.style.color = '#FAFCFB')}>
              {link}
            </a>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
        }
      `}</style>
    </>
  )
}
