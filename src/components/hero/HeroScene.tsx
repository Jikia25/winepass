'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

const EN = [
  { eyebrow: 'Welcome to Bordeaux', h1: 'Your Perfect', h2: 'Wine Day', body: 'Timeless estates. Private tastings.\nOne extraordinary region.' },
  { eyebrow: 'The Collection', h1: 'Grands Crus', h2: 'of Excellence', body: 'Six centuries of terroir\npoured into every glass.' },
  { eyebrow: 'The Experience', h1: 'Exceptional Wines,', h2: 'Exceptional Stories', body: 'Private cellar tastings\nreserved for only a few.' },
  { eyebrow: 'Begin Your Journey', h1: 'Craft Your Day,', h2: 'Bottle by Bottle', body: 'Let our AI sommelier design\nyour Bordeaux itinerary.' },
]
const FR = [
  { eyebrow: 'Bienvenue \u00e0 Bordeaux', h1: 'Votre Journ\u00e9e', h2: 'du Vin Parfaite', body: 'Domaines intemporels.\nUne r\u00e9gion extraordinaire.' },
  { eyebrow: 'La Collection', h1: 'Grands Crus', h2: "d'Excellence", body: 'Six si\u00e8cles de terroir\nvers\u00e9s dans chaque verre.' },
  { eyebrow: "L'Exp\u00e9rience", h1: 'Vins Exceptionnels,', h2: 'Histoires Uniques', body: 'D\u00e9gustations priv\u00e9es en cave,\nr\u00e9serv\u00e9es \u00e0 quelques \u00e9lus.' },
  { eyebrow: 'Commencez Votre Voyage', h1: 'Cr\u00e9ez Votre Journ\u00e9e,', h2: 'Bouteille par Bouteille', body: 'Laissez notre sommelier IA\nconcevoir votre itin\u00e9raire.' },
]

export default function HeroScene() {
  const { lang } = useLanguage()
  const copy = lang === 'fr' ? FR : EN
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const mx = useSpring(mouseX, { stiffness: 40, damping: 18 })
  const my = useSpring(mouseY, { stiffness: 40, damping: 18 })
  const [scene, setScene] = useState(0)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // Update active scene dot
  useEffect(() => {
    return scrollYProgress.on('change', v => {
      setScene(v < 0.25 ? 0 : v < 0.5 ? 1 : v < 0.75 ? 2 : 3)
    })
  }, [scrollYProgress])

  // Mouse parallax
  const handleMouse = (e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    mouseX.set(((e.clientX - r.left) / r.width) * 2 - 1)
    mouseY.set(((e.clientY - r.top) / r.height) * 2 - 1)
  }

  // ── Château zoom: 1.0 → 2.5 across full scroll
  const chateauScale  = useTransform(scrollYProgress, [0, 0.75], [1.05, 2.6])
  const chateauOpacity= useTransform(scrollYProgress, [0, 0.02, 0.55, 0.75], [0, 1, 1, 0])
  const chBgX = useTransform(mx, [-1,1], [-10,10])
  const chBgY = useTransform(my, [-1,1], [-6,6])

  // ── Pour scene: fades in at 55%, persists
  const pourOpacity   = useTransform(scrollYProgress, [0.52, 0.72], [0, 1])
  const pourX = useTransform(mx, [-1,1], [-10,10])
  const pourY = useTransform(my, [-1,1], [-6,6])

  // ── Bottle: enters scene 0, tilts in scene 1, dissolves in scene 2
  const bottleOpacity = useTransform(scrollYProgress, [0, 0.04, 0.48, 0.62], [0, 1, 1, 0])
  const bottleRot     = useTransform(scrollYProgress, [0.25, 0.5], [0, -30])
  const bottleX = useTransform(mx, [-1,1], [-28,28])
  const bottleY = useTransform(my, [-1,1], [-14,14])

  // ── Glass: same lifecycle as bottle
  const glassOpacity  = useTransform(scrollYProgress, [0, 0.04, 0.48, 0.62], [0, 1, 1, 0])
  const glassX = useTransform(mx, [-1,1], [-35,35])
  const glassY = useTransform(my, [-1,1], [-18,18])

  // ── Text per scene
  const s0Op = useTransform(scrollYProgress, [0, 0.04, 0.20, 0.26], [0, 1, 1, 0])
  const s1Op = useTransform(scrollYProgress, [0.24, 0.28, 0.44, 0.50], [0, 1, 1, 0])
  const s2Op = useTransform(scrollYProgress, [0.49, 0.53, 0.69, 0.75], [0, 1, 1, 0])
  const s3Op = useTransform(scrollYProgress, [0.74, 0.78], [0, 1])

  const textStyle = {
    fontFamily: "'Playfair Display',Georgia,serif",
    fontSize: 'clamp(2.6rem,6vw,5.2rem)',
    fontWeight: 400, lineHeight: 1.0, color: '#fff',
    textShadow: '0 2px 60px rgba(0,0,0,0.8)',
    letterSpacing: '-0.02em',
  }

  const cards = lang === 'fr'
    ? ['7 375 ch\u00e2teaux', 'Transport inclus', 'Note 4.8/5', 'Annulation gratuite']
    : ['7,375 ch\u00e2teaux', 'Transport included', 'Rated 4.8/5', 'Free cancellation']
  const icons = ['\ud83c\udf77','\ud83d\ude97','\u2b50','\ud83c\udf81']

  return (
    <div ref={containerRef} style={{ height: '400vh' }}>
      {/* ── Sticky viewport ── */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black"
        onMouseMove={handleMouse} onMouseLeave={() => { mouseX.set(0); mouseY.set(0) }}>

        {/* Layer 1 — Château (zooms in) */}
        <motion.div className="absolute inset-0" style={{ opacity: chateauOpacity }}>
          <motion.div className="absolute inset-0"
            style={{ scale: chateauScale, x: chBgX, y: chBgY, transformOrigin: 'center center' }}>
            <div className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/images/chateau.png')" }} />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
        </motion.div>

        {/* Layer 2 — Pour scene (crossfades in) */}
        <motion.div className="absolute inset-0" style={{ opacity: pourOpacity }}>
          <motion.div className="absolute inset-0" style={{ x: pourX, y: pourY, scale: 1.06 }}>
            <div className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/images/pour-scene.png')" }} />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/85" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/10 to-transparent" />
        </motion.div>

        {/* Layer 3 — Bottle (large, tilts) */}
        <motion.div className="absolute pointer-events-none"
          style={{ right: '-2%', top: '45%', translateY: '-50%',
            width: 'clamp(300px,38vw,620px)',
            x: bottleX, y: bottleY, rotate: bottleRot,
            opacity: bottleOpacity, transformOrigin: 'bottom center', zIndex: 15 }}>
          <img src="/images/bottle.png" alt="" draggable={false} className="w-full h-auto"
            style={{ mixBlendMode: 'lighten',
              filter: 'drop-shadow(0 24px 64px rgba(139,26,26,0.5))' }} />
        </motion.div>

        {/* Layer 4 — Glass (large) */}
        <motion.div className="absolute pointer-events-none"
          style={{ left: '2%', bottom: '4%',
            width: 'clamp(200px,28vw,460px)',
            x: glassX, y: glassY,
            opacity: glassOpacity, zIndex: 15 }}>
          <img src="/images/glass.png" alt="" draggable={false} className="w-full h-auto"
            style={{ mixBlendMode: 'lighten',
              filter: 'drop-shadow(0 20px 44px rgba(196,150,58,0.25))' }} />
        </motion.div>

        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none z-10"
          style={{ background: 'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 22%, rgba(4,0,0,0.62) 100%)' }} />

        {/* ── Texts ── */}
        {[
          { op: s0Op, d: copy[0] },
          { op: s1Op, d: copy[1] },
          { op: s2Op, d: copy[2] },
        ].map(({ op, d }, i) => (
          <motion.div key={i} className="absolute inset-0 flex flex-col justify-center px-8 md:px-24 z-20 pointer-events-none"
            style={{ opacity: op }}>
            <div className="max-w-lg">
              <p style={{ fontSize: '10px', letterSpacing: '0.52em', textTransform: 'uppercase', color: '#C4963A', marginBottom: '14px' }}>{d.eyebrow}</p>
              <h2 style={textStyle}>
                <span style={{ display: 'block' }}>{d.h1}</span>
                <span style={{ display: 'block', fontStyle: 'italic' }}>{d.h2}</span>
              </h2>
              <p style={{ marginTop: '22px', fontSize: '0.88rem', color: 'rgba(255,255,255,0.48)', lineHeight: 1.9, whiteSpace: 'pre-line' }}>{d.body}</p>
            </div>
          </motion.div>
        ))}

        {/* Scene 4 — CTA */}
        <motion.div className="absolute inset-0 flex flex-col justify-center px-8 md:px-24 z-20"
          style={{ opacity: s3Op }}>
          <div className="max-w-lg">
            <p style={{ fontSize: '10px', letterSpacing: '0.52em', textTransform: 'uppercase', color: '#C4963A', marginBottom: '14px' }}>{copy[3].eyebrow}</p>
            <h2 style={textStyle}>
              <span style={{ display: 'block' }}>{copy[3].h1}</span>
              <span style={{ display: 'block', fontStyle: 'italic' }}>{copy[3].h2}</span>
            </h2>
            <p style={{ marginTop: '22px', fontSize: '0.88rem', color: 'rgba(255,255,255,0.48)', lineHeight: 1.9, whiteSpace: 'pre-line', marginBottom: '36px' }}>{copy[3].body}</p>

            {/* Cards animate up */}
            <div className="flex gap-3 flex-wrap mb-10">
              {cards.map((c, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16,1,0.3,1] }}
                  style={{ border: '1px solid rgba(196,150,58,0.3)', padding: '10px 16px', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(10px)' }}>
                  <span style={{ marginRight: '8px' }}>{icons[i]}</span>
                  <span style={{ fontSize: '10px', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>{c}</span>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <Link href="/build" className="group relative inline-flex overflow-hidden"
                style={{ border: '1px solid rgba(196,150,58,0.7)', padding: '16px 42px', fontSize: '10px', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#C4963A', textDecoration: 'none' }}>
                <span className="absolute inset-0 -translate-x-full transition-transform duration-700 group-hover:translate-x-0" style={{ background: '#C4963A' }} />
                <span className="relative transition-colors duration-700 group-hover:text-[#1a0800]">
                  {lang === 'fr' ? 'Cr\u00e9er Ma Journ\u00e9e \u2192' : 'Build My Wine Day \u2192'}
                </span>
              </Link>
              <Link href="/regions" style={{ alignSelf: 'center', fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '3px', textDecoration: 'none' }}>
                {lang === 'fr' ? 'Explorer les appellations' : 'Explore appellations'}
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator (scene 0 only) */}
        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-30 pointer-events-none"
          style={{ opacity: s0Op }}>
          <span style={{ fontSize: '9px', letterSpacing: '0.5em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Scroll</span>
          <div className="relative w-px h-12 overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <motion.div className="absolute left-0 w-full" style={{ background: '#C4963A' }}
              animate={{ height: ['0%','100%','0%'], top: ['0%','0%','100%'] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }} />
          </div>
        </motion.div>

        {/* Scene dots */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-50 pointer-events-none">
          {[0,1,2,3].map(i => (
            <motion.div key={i} className="rounded-full"
              animate={{ height: scene===i ? 28 : 7, width: 3, backgroundColor: scene===i ? '#C4963A' : 'rgba(255,255,255,0.22)' }}
              transition={{ duration: 0.4 }} />
          ))}
        </div>

        {/* Gold bottom line */}
        <div className="absolute bottom-0 left-0 right-0 z-30"
          style={{ height: '1px', background: 'linear-gradient(90deg,transparent,rgba(196,150,58,0.4),transparent)' }} />
      </div>
    </div>
  )
}
