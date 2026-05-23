'use client'

const TICKER =
  'Free shipping on orders $75+ ✦ 3-7 Day US Delivery ✦ Easy 30-Day Returns ✦ Premium Quality Guaranteed'

export default function TopMarquee() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 30,
        zIndex: 110,
        background: '#0F1A14',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          whiteSpace: 'nowrap',
          animation: 'topTicker 40s linear infinite',
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            style={{
              fontFamily: 'Jost, sans-serif',
              fontSize: 9,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#C9A96E',
              paddingRight: 80,
            }}
          >
            {TICKER}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes topTicker {
          from { transform: translateX(0); }
          to { transform: translateX(-25%); }
        }
      `}</style>
    </div>
  )
}
