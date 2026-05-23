'use client'
import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: 0, y: 0 })
  const ring = useRef({ x: 0, y: 0 })
  const hovering = useRef(false)
  const viewing = useRef(false)

  useEffect(() => {
    if (window.matchMedia('(max-width: 768px)').matches) return

    const dot  = dotRef.current!
    const rng  = ringRef.current!
    const lbl  = labelRef.current!
    let raf: number

    const move = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
      dot.style.left = e.clientX + 'px'
      dot.style.top  = e.clientY + 'px'
      const target = e.target as HTMLElement
      const isBtn = target.closest('button, a, [data-cursor]')
      const isImg = target.closest('[data-cursor="view"]')
      const isTxt = target.closest('p, h1, h2, h3, span')
      hovering.current = !!isBtn
      viewing.current  = !!isImg
      if (isImg) {
        rng.style.width  = '80px'
        rng.style.height = '80px'
        rng.style.borderRadius = '50%'
        rng.style.borderColor = 'rgba(74,144,99,0.8)'
        lbl.textContent = 'View'
        lbl.style.opacity = '1'
      } else if (isBtn) {
        rng.style.width  = '60px'
        rng.style.height = '60px'
        rng.style.borderRadius = '50%'
        rng.style.borderColor = 'rgba(74,144,99,0.6)'
        lbl.style.opacity = '0'
      } else if (isTxt) {
        rng.style.width  = '2px'
        rng.style.height = '28px'
        rng.style.borderRadius = '1px'
        rng.style.borderColor = 'rgba(74,144,99,0.9)'
        lbl.style.opacity = '0'
      } else {
        rng.style.width  = '36px'
        rng.style.height = '36px'
        rng.style.borderRadius = '50%'
        rng.style.borderColor = 'rgba(74,144,99,0.5)'
        lbl.style.opacity = '0'
      }
    }

    const click = () => {
      rng.style.transform = 'translate(-50%,-50%) scale(0.7)'
      setTimeout(() => { rng.style.transform = 'translate(-50%,-50%) scale(1)' }, 150)
    }

    const loop = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.1
      ring.current.y += (pos.current.y - ring.current.y) * 0.1
      rng.style.left = ring.current.x + 'px'
      rng.style.top  = ring.current.y + 'px'
      raf = requestAnimationFrame(loop)
    }

    document.addEventListener('mousemove', move)
    document.addEventListener('click', click)
    loop()
    return () => {
      document.removeEventListener('mousemove', move)
      document.removeEventListener('click', click)
      cancelAnimationFrame(raf)
    }
  }, [])

  const base: React.CSSProperties = {
    position: 'fixed', pointerEvents: 'none',
    zIndex: 99999, transform: 'translate(-50%,-50%)',
  }

  return (
    <>
      <div ref={dotRef} style={{
        ...base, width: 6, height: 6,
        background: '#4A9063', borderRadius: '50%',
        transition: 'transform 0.15s',
      }} />
      <div ref={ringRef} style={{
        ...base, width: 36, height: 36,
        border: '1px solid rgba(74,144,99,0.5)',
        borderRadius: '50%',
        transition: 'width 0.4s cubic-bezier(0.25,0.46,0.45,0.94), height 0.4s cubic-bezier(0.25,0.46,0.45,0.94), border-color 0.4s, border-radius 0.4s, transform 0.15s',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div ref={labelRef} style={{
          fontFamily: 'Jost, sans-serif', fontSize: 8,
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: '#4A9063', opacity: 0,
          transition: 'opacity 0.3s', whiteSpace: 'nowrap',
          userSelect: 'none',
        }}>View</div>
      </div>
    </>
  )
}
