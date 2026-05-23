'use client'

import { useEffect, useRef } from 'react'

interface FabricCanvasProps {
  fabric: string
  colors: string[]
  speed?: number
  rotation?: number
}

export default function FabricCanvas({
  fabric,
  colors,
  speed = 1,
  rotation = 0,
}: FabricCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const spRef = useRef(speed)
  const rotRef = useRef(rotation)

  useEffect(() => {
    spRef.current = speed
  }, [speed])

  useEffect(() => {
    rotRef.current = rotation
  }, [rotation])

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let frame = 0
    let raf: number

    const p: Record<
      string,
      { amp: number; speed: number; shimmer: boolean; flutter: boolean }
    > = {
      silk: { amp: 7, speed: 1.0, shimmer: true, flutter: false },
      linen: { amp: 11, speed: 0.8, shimmer: false, flutter: false },
      satin: { amp: 5, speed: 0.6, shimmer: true, flutter: false },
      chiffon: { amp: 15, speed: 1.4, shimmer: false, flutter: true },
      structured: { amp: 2, speed: 0.3, shimmer: false, flutter: false },
    }
    const fp = p[fabric] ?? p.silk
    const [c0, c1, c2] = colors

    const draw = () => {
      frame++
      const t = frame * 0.018 * fp.speed * spRef.current
      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)

      ctx.fillStyle = c0
      ctx.fillRect(0, 0, W, H)

      const cx = W * 0.5
      const cy = H * 0.12
      const bH = H * 0.28
      const sH = H * 0.43
      const tw = W * 0.2
      const sw = W * 0.4

      const rot = rotRef.current
      const scaleX = 0.35 + Math.abs(Math.cos(rot)) * 0.65
      const skew = Math.sin(rot) * 0.22

      const w1 = Math.sin(t) * fp.amp
      const w2 = Math.sin(t + 1.3) * fp.amp * 0.75
      const w3 = Math.sin(t + 2.6) * fp.amp * 0.5
      const w4 = Math.sin(t + 3.9) * fp.amp * 0.6

      ctx.save()
      ctx.translate(cx, cy + bH * 0.5 + sH * 0.25)
      ctx.transform(scaleX, skew * 0.15, skew * 0.08, 1, 0, 0)
      ctx.translate(-cx, -(cy + bH * 0.5 + sH * 0.25))

      const g = ctx.createLinearGradient(cx - sw, 0, cx + sw, 0)
      g.addColorStop(0, c2)
      g.addColorStop(0.3, c1)
      g.addColorStop(0.65, c0)
      g.addColorStop(1, c2)
      ctx.fillStyle = g

      ctx.beginPath()
      ctx.moveTo(cx - tw, cy)
      ctx.bezierCurveTo(
        cx - tw * 1.15,
        cy + bH * 0.35,
        cx - sw * 0.75 + w1,
        cy + bH * 0.7,
        cx - sw + w2,
        cy + bH
      )
      ctx.bezierCurveTo(
        cx - sw * 1.15 + w3,
        cy + bH + sH * 0.35,
        cx - sw * 0.85 + w4,
        cy + bH + sH * 0.7,
        cx - sw * 0.55 + w1,
        cy + bH + sH
      )
      ctx.quadraticCurveTo(cx, cy + bH + sH + w2 * 0.25, cx + sw * 0.55 + w3, cy + bH + sH)
      ctx.bezierCurveTo(
        cx + sw * 0.85 + w2,
        cy + bH + sH * 0.7,
        cx + sw * 1.15 + w1,
        cy + bH + sH * 0.35,
        cx + sw + w4,
        cy + bH
      )
      ctx.bezierCurveTo(
        cx + sw * 0.75 + w3,
        cy + bH * 0.7,
        cx + tw * 1.15,
        cy + bH * 0.35,
        cx + tw,
        cy
      )
      ctx.closePath()
      ctx.fill()

      const sh = ctx.createLinearGradient(cx - sw, 0, cx - sw * 0.15, 0)
      sh.addColorStop(0, 'rgba(0,0,0,0.14)')
      sh.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = sh
      ctx.fill()

      if (fp.shimmer) {
        const sl = ctx.createLinearGradient(cx - tw, cy, cx + tw, cy + bH + sH)
        const al = 0.07 + Math.sin(t * 0.5) * 0.055
        sl.addColorStop(0, 'rgba(255,255,255,0)')
        sl.addColorStop(0.45 + Math.sin(t * 0.3) * 0.08, `rgba(255,255,255,${al})`)
        sl.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = sl
        ctx.fill()
      }

      if (fp.flutter) {
        ctx.globalAlpha = 0.18 + Math.sin(t * 1.8) * 0.12
        ctx.fillStyle = c1
        ctx.beginPath()
        ctx.moveTo(cx - sw * 0.6 + w1, cy + bH + sH * 0.6)
        ctx.quadraticCurveTo(cx, cy + bH + sH + w3 * 1.5, cx + sw * 0.6 + w2, cy + bH + sH * 0.6)
        ctx.fill()
        ctx.globalAlpha = 1
      }

      ctx.strokeStyle = `rgba(${fabric === 'structured' ? '255,255,255' : '120,100,80'},0.2)`
      ctx.lineWidth = 0.8
      ctx.beginPath()
      ctx.moveTo(cx - tw * 0.88, cy + bH * 0.64)
      ctx.quadraticCurveTo(cx, cy + bH * 0.58 + Math.sin(t * 0.9) * 2, cx + tw * 0.88, cy + bH * 0.64)
      ctx.stroke()

      const ng = ctx.createRadialGradient(cx, cy - 7, 0, cx, cy - 7, tw * 0.88)
      ng.addColorStop(0, c1)
      ng.addColorStop(1, c2)
      ctx.fillStyle = ng
      ctx.beginPath()
      ctx.ellipse(cx, cy - 7, tw * 0.74, tw * 0.2, 0, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()

      for (let i = 0; i < 8; i++) {
        const px = cx + Math.sin(t * 0.4 + i * 0.9) * W * 0.38
        const py = cy + Math.cos(t * 0.3 + i * 1.3) * H * 0.32 + H * 0.28
        const op = 0.12 + Math.sin(t * 0.6 + i) * 0.1
        ctx.fillStyle = `rgba(201,169,110,${op})`
        ctx.beginPath()
        ctx.arc(px, py, 1 + Math.sin(t + i) * 0.6, 0, Math.PI * 2)
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [fabric, colors])

  return (
    <canvas
      ref={ref}
      width={300}
      height={400}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}
