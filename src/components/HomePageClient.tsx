'use client'
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, HTMLAttributes } from 'react'
import type { DisplayProduct } from '@/lib/displayProducts'
import { useCartStore } from '@/store/cartStore'

const NICHES = ['All','Corporate Luxe','Coastal Grandmother','Minimalist Bride','Resort Luxury']

function FabricCanvas({ fabric, colors, speed = 1 }: {
  fabric: string, colors: string[], speed?: number
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const spRef = useRef(speed)
  useEffect(() => { spRef.current = speed }, [speed])

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let frame = 0, raf: number

    const p: Record<string,{amp:number,speed:number,shimmer:boolean,flutter:boolean}> = {
      silk:      { amp:7,  speed:1.0, shimmer:true,  flutter:false },
      linen:     { amp:11, speed:0.8, shimmer:false, flutter:false },
      satin:     { amp:5,  speed:0.6, shimmer:true,  flutter:false },
      chiffon:   { amp:15, speed:1.4, shimmer:false, flutter:true  },
      structured:{ amp:2,  speed:0.3, shimmer:false, flutter:false },
    }
    const fp = p[fabric] || p.silk
    const [c0,c1,c2] = colors

    const draw = () => {
      frame++
      const t = frame * 0.018 * fp.speed * spRef.current
      const W = canvas.width, H = canvas.height
      ctx.clearRect(0,0,W,H)

      // BG
      ctx.fillStyle = c0
      ctx.fillRect(0,0,W,H)

      const cx=W*.5, cy=H*.12
      const bH=H*.28, sH=H*.43
      const tw=W*.2, sw=W*.4

      const w1=Math.sin(t)*fp.amp
      const w2=Math.sin(t+1.3)*fp.amp*.75
      const w3=Math.sin(t+2.6)*fp.amp*.5
      const w4=Math.sin(t+3.9)*fp.amp*.6

      // Dress gradient
      const g = ctx.createLinearGradient(cx-sw,0,cx+sw,0)
      g.addColorStop(0,c2); g.addColorStop(0.3,c1)
      g.addColorStop(0.65,c0); g.addColorStop(1,c2)
      ctx.fillStyle=g

      ctx.beginPath()
      ctx.moveTo(cx-tw,cy)
      ctx.bezierCurveTo(cx-tw*1.15,cy+bH*.35, cx-sw*.75+w1,cy+bH*.7, cx-sw+w2,cy+bH)
      ctx.bezierCurveTo(cx-sw*1.15+w3,cy+bH+sH*.35, cx-sw*.85+w4,cy+bH+sH*.7, cx-sw*.55+w1,cy+bH+sH)
      ctx.quadraticCurveTo(cx,cy+bH+sH+w2*.25, cx+sw*.55+w3,cy+bH+sH)
      ctx.bezierCurveTo(cx+sw*.85+w2,cy+bH+sH*.7, cx+sw*1.15+w1,cy+bH+sH*.35, cx+sw+w4,cy+bH)
      ctx.bezierCurveTo(cx+sw*.75+w3,cy+bH*.7, cx+tw*1.15,cy+bH*.35, cx+tw,cy)
      ctx.closePath(); ctx.fill()

      // Shadow
      const sh=ctx.createLinearGradient(cx-sw,0,cx-sw*.15,0)
      sh.addColorStop(0,'rgba(0,0,0,0.14)'); sh.addColorStop(1,'rgba(0,0,0,0)')
      ctx.fillStyle=sh; ctx.fill()

      // Shimmer
      if (fp.shimmer) {
        const sl=ctx.createLinearGradient(cx-tw,cy,cx+tw,cy+bH+sH)
        const al=0.07+Math.sin(t*.5)*.055
        sl.addColorStop(0,'rgba(255,255,255,0)')
        sl.addColorStop(.45+Math.sin(t*.3)*.08,`rgba(255,255,255,${al})`)
        sl.addColorStop(1,'rgba(255,255,255,0)')
        ctx.fillStyle=sl; ctx.fill()
      }

      // Flutter for chiffon
      if (fp.flutter) {
        ctx.globalAlpha = .18+Math.sin(t*1.8)*.12
        ctx.fillStyle = c1
        ctx.beginPath()
        ctx.moveTo(cx-sw*.6+w1,cy+bH+sH*.6)
        ctx.quadraticCurveTo(cx,cy+bH+sH+w3*1.5, cx+sw*.6+w2,cy+bH+sH*.6)
        ctx.fill()
        ctx.globalAlpha=1
      }

      // Waist seam
      ctx.strokeStyle=`rgba(${fabric==='structured'?'255,255,255':'120,100,80'},0.2)`
      ctx.lineWidth=.8
      ctx.beginPath()
      ctx.moveTo(cx-tw*.88,cy+bH*.64)
      ctx.quadraticCurveTo(cx,cy+bH*.58+Math.sin(t*.9)*2, cx+tw*.88,cy+bH*.64)
      ctx.stroke()

      // Neckline
      const ng=ctx.createRadialGradient(cx,cy-7,0,cx,cy-7,tw*.88)
      ng.addColorStop(0,c1); ng.addColorStop(1,c2)
      ctx.fillStyle=ng
      ctx.beginPath()
      ctx.ellipse(cx,cy-7,tw*.74,tw*.2,0,0,Math.PI*2)
      ctx.fill()

      // Particles
      for(let i=0;i<8;i++){
        const px=cx+Math.sin(t*.4+i*.9)*W*.38
        const py=cy+Math.cos(t*.3+i*1.3)*H*.32+H*.28
        const op=.12+Math.sin(t*.6+i)*.1
        ctx.fillStyle=`rgba(74,144,99,${op})`
        ctx.beginPath()
        ctx.arc(px,py,1+Math.sin(t+i)*.6,0,Math.PI*2)
        ctx.fill()
      }

      raf=requestAnimationFrame(draw)
    }
    draw()
    return ()=>cancelAnimationFrame(raf)
  },[fabric,colors])

  return <canvas ref={ref} width={300} height={400}
    style={{width:'100%',height:'100%',display:'block'}} />
}

function HeroCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(()=>{
    const canvas=ref.current; if(!canvas) return
    const ctx=canvas.getContext('2d')!
    let frame=0,raf:number
    const resize=()=>{
      canvas.width=canvas.offsetWidth*devicePixelRatio
      canvas.height=canvas.offsetHeight*devicePixelRatio
      ctx.scale(devicePixelRatio,devicePixelRatio)
    }
    resize()
    window.addEventListener('resize',resize)
    const draw=()=>{
      frame++
      const t=frame*.012
      const W=canvas.offsetWidth, H=canvas.offsetHeight
      ctx.clearRect(0,0,W,H)

      // Radial bg
      const bg=ctx.createRadialGradient(W*.5,H*.4,0,W*.5,H*.4,W*.7)
      bg.addColorStop(0,'rgba(194,219,203,0.18)')
      bg.addColorStop(1,'rgba(242,247,244,0)')
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H)

      const cx=W*.5,cy=H*.1
      const bH=H*.28,sH=H*.46
      const tw=W*.17,sw=W*.41
      const w1=Math.sin(t*.8)*9, w2=Math.sin(t*.6+1.1)*13
      const w3=Math.sin(t*1.0+2.2)*7, w4=Math.sin(t*.7+.5)*11

      const g=ctx.createLinearGradient(cx-sw,0,cx+sw,0)
      g.addColorStop(0,'#96C4A4')
      g.addColorStop(.28,'#C2DBCB')
      g.addColorStop(.55,'#E0EDE5')
      g.addColorStop(.8,'#C2DBCB')
      g.addColorStop(1,'#96C4A4')
      ctx.fillStyle=g

      ctx.beginPath()
      ctx.moveTo(cx-tw,cy)
      ctx.bezierCurveTo(cx-tw*1.2,cy+bH*.3, cx-sw*.7+w1,cy+bH*.7, cx-sw+w2,cy+bH)
      ctx.bezierCurveTo(cx-sw*1.2+w3,cy+bH+sH*.4, cx-sw*.9+w4,cy+bH+sH*.75, cx-sw*.6+w1,cy+bH+sH)
      ctx.quadraticCurveTo(cx,cy+bH+sH+w2*.3, cx+sw*.6+w3,cy+bH+sH)
      ctx.bezierCurveTo(cx+sw*.9+w1,cy+bH+sH*.75, cx+sw*1.2+w2,cy+bH+sH*.4, cx+sw+w4,cy+bH)
      ctx.bezierCurveTo(cx+sw*.7+w3,cy+bH*.7, cx+tw*1.2,cy+bH*.3, cx+tw,cy)
      ctx.closePath(); ctx.fill()

      // Depth
      const dg=ctx.createLinearGradient(cx-sw,0,cx-sw*.2,0)
      dg.addColorStop(0,'rgba(15,26,20,.16)'); dg.addColorStop(1,'rgba(15,26,20,0)')
      ctx.fillStyle=dg; ctx.fill()

      // Green shimmer
      const sg=ctx.createLinearGradient(cx-tw,cy,cx+tw,cy+bH+sH)
      const al=.08+Math.sin(t*.4)*.065
      sg.addColorStop(0,'rgba(255,255,255,0)')
      sg.addColorStop(.45+Math.sin(t*.3)*.09,`rgba(255,255,255,${al})`)
      sg.addColorStop(1,'rgba(255,255,255,0)')
      ctx.fillStyle=sg; ctx.fill()

      // Waist
      ctx.strokeStyle='rgba(74,144,99,0.3)'; ctx.lineWidth=1
      ctx.beginPath()
      ctx.moveTo(cx-tw*.9,cy+bH*.66)
      ctx.quadraticCurveTo(cx,cy+bH*.6+Math.sin(t)*2, cx+tw*.9,cy+bH*.66)
      ctx.stroke()

      // Neckline
      const ng2=ctx.createRadialGradient(cx,cy-9,0,cx,cy-9,tw*.85)
      ng2.addColorStop(0,'#C2DBCB'); ng2.addColorStop(1,'#96C4A4')
      ctx.fillStyle=ng2
      ctx.beginPath(); ctx.ellipse(cx,cy-9,tw*.76,tw*.22,0,0,Math.PI*2); ctx.fill()

      // Orbiting particles
      for(let i=0;i<20;i++){
        const angle=t*.3+i*(Math.PI*2/20)
        const r=80+Math.sin(t+i*.7)*30
        const px=cx+Math.cos(angle)*r*1.4
        const py=cy+bH*.5+Math.sin(angle)*r*.7
        const op=.15+Math.sin(t*.5+i)*.12
        const size=1.2+Math.sin(t+i*.5)*.8
        ctx.fillStyle=`rgba(74,144,99,${op})`
        ctx.beginPath(); ctx.arc(px,py,size,0,Math.PI*2); ctx.fill()
      }

      raf=requestAnimationFrame(draw)
    }
    draw()
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',resize) }
  },[])
  return <canvas ref={ref} style={{width:'100%',height:'100%',display:'block'}}/>
}

function ProductCard({ product }: { product: DisplayProduct }) {
  const [hovered,setHovered]=useState(false)
  const [adding,setAdding]=useState(false)
  const { addItemWithShopify } = useCartStore()

  const handleAdd = async () => {
    if (!product.variantId) return
    setAdding(true)
    await addItemWithShopify({
      variantId: product.variantId,
      productTitle: product.name,
      variantTitle: 'Default',
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl ?? undefined,
    })
    setAdding(false)
  }

  return (
    <div
      onMouseEnter={()=>setHovered(true)}
      onMouseLeave={()=>setHovered(false)}
      style={{
        background:'#fff',
        transition:'transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.55s',
        transform: hovered ? 'translateY(-14px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 40px 80px rgba(15,26,20,0.1)'
          : '0 2px 24px rgba(15,26,20,0.04)',
      }}>

      {/* Image/Canvas area */}
      <div style={{
        aspectRatio:'3/4', position:'relative',
        overflow:'hidden', background:product.colors[0],
      }} data-cursor="view">

        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{
              width:'100%',height:'100%',
              objectFit:'cover',
              transition:'transform 0.6s ease',
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

        {/* Hover overlay */}
        <div style={{
          position:'absolute',inset:0,
          background:'rgba(15,26,20,0.48)',
          display:'flex',flexDirection:'column',
          alignItems:'center',justifyContent:'flex-end',
          padding:18,
          opacity: hovered ? 1 : 0,
          transition:'opacity 0.38s',
        }}>
          <p style={{
            fontFamily:'Cormorant Garamond,serif',
            fontSize:13,color:'rgba(250,252,251,0.82)',
            letterSpacing:'0.05em',textAlign:'center',
            marginBottom:16,lineHeight:1.6,
          }}>{product.desc}</p>
          <div style={{display:'flex',gap:8,width:'100%'}}>
            <button onClick={handleAdd} disabled={adding} style={{
              flex:1,padding:'12px 0',
              background: adding ? '#357A4E' : '#FAFCFB',
              color: adding ? '#fff' : '#0F1A14',
              border:'none',fontFamily:'Jost,sans-serif',
              fontSize:9,letterSpacing:'0.28em',
              textTransform:'uppercase',transition:'all 0.3s',
            }}>
              {adding ? 'Adding...' : 'Add to Bag'}
            </button>
            <button style={{
              padding:'12px 16px',background:'transparent',
              color:'#FAFCFB',border:'1px solid rgba(250,252,251,0.5)',
              fontFamily:'Jost,sans-serif',fontSize:9,
              letterSpacing:'0.1em',transition:'all 0.3s',
            }}>360°</button>
          </div>
        </div>

        {/* Tag */}
        <div style={{
          position:'absolute',top:14,left:14,
          background:'rgba(74,144,99,0.9)',color:'#fff',
          fontFamily:'Jost,sans-serif',fontSize:8,
          letterSpacing:'0.25em',textTransform:'uppercase',
          padding:'4px 12px',
        }}>{product.tag}</div>
      </div>

      {/* Info */}
      <div style={{padding:'20px 18px 22px'}}>
        <p style={{
          fontFamily:'Jost,sans-serif',fontSize:9,
          letterSpacing:'0.32em',textTransform:'uppercase',
          color:'#4A9063',marginBottom:8,
        }}>{product.niche}</p>
        <h3 style={{
          fontFamily:'Cormorant Garamond,serif',
          fontSize:21,fontWeight:300,color:'#0F1A14',
          marginBottom:12,lineHeight:1.2,
        }}>{product.name}</h3>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{
            fontFamily:'Jost,sans-serif',fontSize:14,
            color:'#5A6B60',letterSpacing:'0.04em',
          }}>
            ${product.price.toFixed(2)}
          </span>
          <div style={{display:'flex',gap:5}}>
            {product.colors.map((c,i)=>(
              <div key={i} style={{
                width:9,height:9,borderRadius:'50%',
                background:c,border:'0.5px solid rgba(15,26,20,0.12)',
              }}/>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface HomePageClientProps {
  products: DisplayProduct[]
}

export default function HomePageClient({ products }: HomePageClientProps) {
  const [activeNiche,setActiveNiche]=useState('All')
  const [scrollY,setScrollY]=useState(0)
  const [visible,setVisible]=useState<Set<string>>(new Set())

  useEffect(()=>{
    const fn=()=>setScrollY(window.scrollY)
    window.addEventListener('scroll',fn,{passive:true})
    return ()=>window.removeEventListener('scroll',fn)
  },[])

  useEffect(()=>{
    const obs=new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(e.isIntersecting) setVisible(v=>new Set([...v,e.target.id]))
      })
    },{threshold:.12})
    document.querySelectorAll('[data-anim]').forEach(el=>obs.observe(el))
    return ()=>obs.disconnect()
  },[])

  type AnimProps = HTMLAttributes<HTMLElement> & {
    style: CSSProperties
    'data-anim': string
  }
  const anim=(id:string,delay=0):AnimProps=>({
    id, 'data-anim':'1',
    style:{
      opacity: visible.has(id)?1:0,
      transform: visible.has(id)?'translateY(0)':'translateY(36px)',
      transition:`opacity .8s ease ${delay}s, transform .8s ease ${delay}s`,
    }
  })

  const filtered=activeNiche==='All'
    ? products
    : products.filter(p=>p.niche===activeNiche)

  return (
    <main style={{background:'var(--off-white)',minHeight:'100vh',overflowX:'hidden'}}>

      {/* ── HERO ──────────────────────────────────── */}
      <section style={{
        minHeight:'100vh',
        display:'grid',
        gridTemplateColumns:'1fr 1fr',
        alignItems:'center',
        padding:'90px 48px 60px',
        background:'linear-gradient(140deg,#F2F7F4 0%,#E0EDE5 55%,#F2F7F4 100%)',
        gap:48,position:'relative',
      }}>
        {/* Left text */}
        <div>
          <p style={{
            fontFamily:'Jost,sans-serif',fontSize:10,
            letterSpacing:'0.5em',textTransform:'uppercase',
            color:'#4A9063',marginBottom:22,
            opacity: scrollY<80?1:0.6, transition:'opacity .5s'
          }}>New Collection — Summer 2025</p>

          <h1 style={{
            fontFamily:'Cormorant Garamond,serif',
            fontSize:'clamp(44px,5.5vw,90px)',
            fontWeight:300,lineHeight:1.04,
            color:'#0F1A14',marginBottom:20,
          }}>
            Dressed for<br/>
            <em style={{
              color:'#4A9063',fontStyle:'italic',
              background:'linear-gradient(90deg,#4A9063,#6AAB80)',
              WebkitBackgroundClip:'text',
              WebkitTextFillColor:'transparent',
            }}>Every Chapter</em>
          </h1>

          <p style={{
            fontFamily:'Jost,sans-serif',fontSize:13,
            letterSpacing:'0.12em',color:'#5A6B60',
            marginBottom:44,maxWidth:380,lineHeight:1.85,
          }}>
            Ultra-premium dresses for the modern American woman —
            where luxury meets effortless confidence.
          </p>

          <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            <button style={{
              padding:'15px 40px',background:'#0F1A14',color:'#FAFCFB',
              border:'none',fontFamily:'Jost,sans-serif',fontSize:10,
              letterSpacing:'0.3em',textTransform:'uppercase',
              transition:'background .35s',
            }}
            onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}
            onMouseEnter={e=>e.currentTarget.style.background='#4A9063'}
            onMouseLeave={e=>e.currentTarget.style.background='#0F1A14'}>
              Explore Collection
            </button>
            <button style={{
              padding:'15px 40px',background:'transparent',
              color:'#0F1A14',border:'1px solid #0F1A14',
              fontFamily:'Jost,sans-serif',fontSize:10,
              letterSpacing:'0.3em',textTransform:'uppercase',
              transition:'all .35s',
            }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='#4A9063';e.currentTarget.style.color='#4A9063'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='#0F1A14';e.currentTarget.style.color='#0F1A14'}}>
              Our Story
            </button>
          </div>

          <div style={{
            marginTop:60,display:'flex',
            gap:40,flexWrap:'wrap',
          }}>
            {[['500+','Happy Clients'],['4','Premium Niches'],['3–7','Day Delivery']].map(([n,l])=>(
              <div key={l}>
                <p style={{fontFamily:'Cormorant Garamond,serif',
                  fontSize:34,fontWeight:300,color:'#4A9063'}}>{n}</p>
                <p style={{fontFamily:'Jost,sans-serif',fontSize:9,
                  letterSpacing:'0.28em',textTransform:'uppercase',
                  color:'#5A6B60',marginTop:2}}>{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right 3D canvas */}
        <div style={{
          height:'72vh',minHeight:500,maxHeight:750,
          transform:`translateY(${scrollY*.07}px)`,
          transition:'transform .1s linear',
          borderRadius:2,overflow:'hidden',
        }}>
          <HeroCanvas/>
        </div>

        {/* Scroll cue */}
        <div style={{
          position:'absolute',bottom:36,left:'50%',
          transform:'translateX(-50%)',
          display:'flex',flexDirection:'column',
          alignItems:'center',gap:8,
        }}>
          <span style={{fontFamily:'Jost,sans-serif',fontSize:9,
            letterSpacing:'0.35em',textTransform:'uppercase',
            color:'#5A6B60'}}>Scroll</span>
          <div style={{width:1,height:48,
            background:'linear-gradient(#4A9063,transparent)',
            animation:'scr 1.8s ease-in-out infinite'}}/>
        </div>
      </section>

      {/* ── MARQUEE ───────────────────────────────── */}
      <div style={{
        background:'#0F1A14',padding:'14px 0',
        overflow:'hidden',whiteSpace:'nowrap',
      }}>
        <div style={{
          display:'inline-flex',gap:56,
          animation:'mq 22s linear infinite',
        }}>
          {[...Array(4)].map((_,i)=>(
            <span key={i} style={{display:'inline-flex',gap:56,alignItems:'center'}}>
              {['Corporate Luxe','✦','Coastal Grandmother','✦',
                'Minimalist Bride','✦','Resort Luxury','✦'].map((t,j)=>(
                <span key={j} style={{
                  fontFamily:t==='✦'?'serif':'Jost,sans-serif',
                  fontSize:t==='✦'?13:10,
                  letterSpacing:'0.32em',textTransform:'uppercase',
                  color:t==='✦'?'#4A9063':'rgba(250,252,251,0.4)',
                }}>{t}</span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── NICHE TABS ────────────────────────────── */}
      <div style={{
        background:'#FAFCFB',
        borderBottom:'0.5px solid rgba(74,144,99,0.18)',
        position:'sticky',top:64,zIndex:50,
        overflowX:'auto',WebkitOverflowScrolling:'touch',
      }}>
        <div style={{
          display:'flex',minWidth:'max-content',
          borderTop:'0.5px solid rgba(74,144,99,0.18)',
        }}>
          {NICHES.map(n=>(
            <button key={n} onClick={()=>setActiveNiche(n)} style={{
              padding:'16px 30px',background:'none',border:'none',
              fontFamily:'Jost,sans-serif',fontSize:10,
              letterSpacing:'0.26em',textTransform:'uppercase',
              color: activeNiche===n ? '#4A9063' : '#5A6B60',
              borderBottom: activeNiche===n
                ? '2px solid #4A9063'
                : '2px solid transparent',
              transition:'all .3s',whiteSpace:'nowrap',
            }}>{n}</button>
          ))}
        </div>
      </div>

      {/* ── PRODUCT GRID ──────────────────────────── */}
      <section id="collection" style={{
        padding:'64px 28px',
        maxWidth:1340,margin:'0 auto',
      }}>
        <div {...anim('pgrid-title')} style={{
          ...anim('pgrid-title').style,
          textAlign:'center',marginBottom:52,
        }}>
          <p style={{fontFamily:'Jost,sans-serif',fontSize:10,
            letterSpacing:'0.45em',textTransform:'uppercase',
            color:'#4A9063',marginBottom:14}}>Curated For You</p>
          <h2 style={{fontFamily:'Cormorant Garamond,serif',
            fontSize:'clamp(30px,5vw,54px)',fontWeight:300,
            color:'#0F1A14'}}>The Parvé Edit</h2>
          <p style={{fontFamily:'Jost,sans-serif',fontSize:12,
            color:'#5A6B60',marginTop:12,letterSpacing:'0.08em',
            maxWidth:480,margin:'12px auto 0',lineHeight:1.8}}>
            An editorial selection of six signature silhouettes — 
            each rendered in its true fabric character.
          </p>
        </div>

        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fill,minmax(308px,1fr))',
          gap:28,
        }}>
          {filtered.map((p,i)=>(
            <div key={p.id} style={{
              opacity:0,
              animation:`fadeUp .7s ease ${i*.09}s forwards`,
            }}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>

      {/* ── PHILOSOPHY ────────────────────────────── */}
      <section style={{
        padding:'110px 24px',
        background:'#0F1A14',textAlign:'center',
      }}>
        <div {...anim('phil')}>
          <p style={{fontFamily:'Jost,sans-serif',fontSize:10,
            letterSpacing:'0.45em',textTransform:'uppercase',
            color:'#4A9063',marginBottom:28}}>Our Philosophy</p>
          <h2 style={{
            fontFamily:'Cormorant Garamond,serif',
            fontSize:'clamp(26px,4.5vw,62px)',
            fontWeight:300,lineHeight:1.28,
            color:'#FAFCFB',maxWidth:740,
            margin:'0 auto 28px',fontStyle:'italic',
          }}>
            "Every woman deserves to feel like the most 
            elegant person in the room"
          </h2>
          <p style={{fontFamily:'Jost,sans-serif',fontSize:13,
            letterSpacing:'0.1em',
            color:'rgba(250,252,251,0.5)',
            maxWidth:460,margin:'0 auto'}}>
            Parvé curates ultra-premium dresses for the modern 
            American woman — where luxury meets effortless confidence.
          </p>
        </div>
      </section>

      {/* ── EXPERIENCE STEPS ──────────────────────── */}
      <section style={{padding:'88px 24px',background:'#F2F7F4'}}>
        <div {...anim('steps')} style={{
          ...anim('steps').style,textAlign:'center',marginBottom:56,
        }}>
          <p style={{fontFamily:'Jost,sans-serif',fontSize:10,
            letterSpacing:'0.45em',textTransform:'uppercase',
            color:'#4A9063',marginBottom:14}}>How It Works</p>
          <h2 style={{fontFamily:'Cormorant Garamond,serif',
            fontSize:'clamp(28px,5vw,50px)',fontWeight:300,color:'#0F1A14'}}>
            The Parvé Experience
          </h2>
        </div>
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',
          gap:32,maxWidth:940,margin:'0 auto',
        }}>
          {[
            {n:'01',t:'Curated',d:'Every piece hand-selected for the discerning woman who refuses to compromise on quality'},
            {n:'02',t:'Crafted',d:'Premium fabrics with meticulous attention to drape, fit and finish'},
            {n:'03',t:'Delivered',d:'Straight to your door in 3-7 business days — elegantly packaged'},
          ].map(s=>(
            <div key={s.n} style={{
              textAlign:'center',padding:'36px 28px',
              background:'#fff',
              boxShadow:'0 2px 24px rgba(15,26,20,0.04)',
              transition:'transform .4s, box-shadow .4s',
            }}
            onMouseEnter={e=>{
              (e.currentTarget as HTMLElement).style.transform='translateY(-8px)'
              ;(e.currentTarget as HTMLElement).style.boxShadow='0 20px 60px rgba(15,26,20,0.08)'
            }}
            onMouseLeave={e=>{
              (e.currentTarget as HTMLElement).style.transform='translateY(0)'
              ;(e.currentTarget as HTMLElement).style.boxShadow='0 2px 24px rgba(15,26,20,0.04)'
            }}>
              <p style={{fontFamily:'Cormorant Garamond,serif',
                fontSize:54,fontWeight:300,
                color:'rgba(74,144,99,0.22)',marginBottom:6}}>{s.n}</p>
              <h3 style={{fontFamily:'Cormorant Garamond,serif',
                fontSize:28,fontWeight:300,color:'#0F1A14',marginBottom:14}}>{s.t}</h3>
              <p style={{fontFamily:'Jost,sans-serif',fontSize:12,
                color:'#5A6B60',lineHeight:1.85,letterSpacing:'0.05em'}}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TRUST BAR ─────────────────────────────── */}
      <div style={{
        padding:'36px 24px',
        borderTop:'0.5px solid rgba(74,144,99,0.18)',
        borderBottom:'0.5px solid rgba(74,144,99,0.18)',
        background:'#FAFCFB',
      }}>
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',
          gap:24,maxWidth:820,margin:'0 auto',textAlign:'center',
        }}>
          {[
            {ic:'✦',tx:'Free Shipping $75+'},
            {ic:'◈',tx:'3-7 Day US Delivery'},
            {ic:'◇',tx:'30-Day Returns'},
            {ic:'✧',tx:'Premium Fabrics'},
          ].map(item=>(
            <div key={item.tx}>
              <p style={{fontSize:17,color:'#4A9063',marginBottom:9}}>{item.ic}</p>
              <p style={{fontFamily:'Jost,sans-serif',fontSize:10,
                letterSpacing:'0.22em',textTransform:'uppercase',
                color:'#5A6B60'}}>{item.tx}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── EMAIL ─────────────────────────────────── */}
      <section style={{
        padding:'88px 24px',textAlign:'center',
        background:'#FAFCFB',
      }}>
        <div {...anim('email')}>
          <p style={{fontFamily:'Jost,sans-serif',fontSize:10,
            letterSpacing:'0.45em',textTransform:'uppercase',
            color:'#4A9063',marginBottom:18}}>Join The World</p>
          <h2 style={{fontFamily:'Cormorant Garamond,serif',
            fontSize:'clamp(28px,5vw,54px)',fontWeight:300,
            color:'#0F1A14',marginBottom:14}}>
            Enter the Parvé Circle
          </h2>
          <p style={{fontFamily:'Jost,sans-serif',fontSize:12,
            color:'#5A6B60',marginBottom:38,letterSpacing:'0.08em',
            maxWidth:400,margin:'0 auto 38px'}}>
            Early access, exclusive drops, and styling notes — 
            for the woman who leads.
          </p>
          <div style={{
            display:'flex',maxWidth:440,
            margin:'0 auto',
          }}>
            <input type="email" placeholder="Your email address" style={{
              flex:1,padding:'15px 20px',
              border:'1px solid rgba(15,26,20,0.2)',borderRight:'none',
              fontFamily:'Jost,sans-serif',fontSize:12,
              background:'#fff',outline:'none',color:'#0F1A14',
            }}/>
            <button style={{
              padding:'15px 28px',background:'#4A9063',color:'#fff',
              border:'none',fontFamily:'Jost,sans-serif',fontSize:10,
              letterSpacing:'0.26em',textTransform:'uppercase',
              whiteSpace:'nowrap',transition:'background .3s',
            }}
            onMouseEnter={e=>e.currentTarget.style.background='#357A4E'}
            onMouseLeave={e=>e.currentTarget.style.background='#4A9063'}>
              Join the Circle
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────── */}
      <footer style={{
        background:'#0F1A14',padding:'60px 24px 36px',
      }}>
        <div style={{textAlign:'center',marginBottom:44}}>
          <p style={{fontFamily:'Cormorant Garamond,serif',
            fontSize:28,fontWeight:300,letterSpacing:'0.42em',
            color:'#FAFCFB',marginBottom:32}}>PARVÉ</p>
          <div style={{
            display:'flex',justifyContent:'center',
            gap:28,flexWrap:'wrap',marginBottom:36,
          }}>
            {['About','Collections','Shipping',
              'Returns','Privacy','Contact'].map(l=>(
              <a key={l} href="#" style={{
                fontFamily:'Jost,sans-serif',fontSize:10,
                letterSpacing:'0.22em',textTransform:'uppercase',
                color:'rgba(250,252,251,0.35)',textDecoration:'none',
                transition:'color .3s',
              }}
              onMouseEnter={e=>e.currentTarget.style.color='#4A9063'}
              onMouseLeave={e=>e.currentTarget.style.color='rgba(250,252,251,0.35)'}>
                {l}
              </a>
            ))}
          </div>
          <p style={{fontFamily:'Jost,sans-serif',fontSize:9,
            letterSpacing:'0.2em',
            color:'rgba(250,252,251,0.2)'}}>
            © 2026 Parvé. All rights reserved. Luxury redefined.
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes mq { from{transform:translateX(0)} to{transform:translateX(-25%)} }
        @keyframes scr {
          0%{transform:scaleY(0);transform-origin:top}
          50%{transform:scaleY(1);transform-origin:top}
          51%{transform-origin:bottom}
          100%{transform:scaleY(0);transform-origin:bottom}
        }
        @keyframes fadeUp {
          from{opacity:0;transform:translateY(30px)}
          to{opacity:1;transform:translateY(0)}
        }
        @media(max-width:768px){
          section:first-of-type {
            grid-template-columns:1fr !important;
            padding:96px 20px 56px !important;
          }
          section:first-of-type > div:last-of-type {
            height:50vw !important;
            min-height:280px !important;
          }
        }
      `}</style>
    </main>
  )
}
