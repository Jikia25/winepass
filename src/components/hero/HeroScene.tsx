'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
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

const CARDS_EN = [
  { icon: '\ud83c\udf77', label: '7,375 Ch\u00e2teaux', sub: 'Across 6 appellations' },
  { icon: '\ud83d\ude97', label: 'Transport Included', sub: 'In every Bundle Pass' },
  { icon: '\u2b50', label: 'Rated 4.8 / 5', sub: 'By 4.3M visitors' },
  { icon: '\ud83c\udf81', label: 'Free Cancellation', sub: 'Up to 48h before' },
]
const CARDS_FR = [
  { icon: '\ud83c\udf77', label: '7 375 Ch\u00e2teaux', sub: '6 appellations' },
  { icon: '\ud83d\ude97', label: 'Transport Inclus', sub: 'Dans chaque pass' },
  { icon: '\u2b50', label: 'Note 4.8 / 5', sub: '4,3M visiteurs' },
  { icon: '\ud83c\udf81', label: 'Annulation Gratuite', sub: "Jusqu'\u00e0 48h avant" },
]

export default function HeroScene() {
  const { lang } = useLanguage()
  const copy = lang === 'fr' ? FR : EN
  const cards = lang === 'fr' ? CARDS_FR : CARDS_EN
  const containerRef = useRef<HTMLDivElement>(null)
  const [scene, setScene] = useState(0)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const mx = useSpring(mouseX, { stiffness: 38, damping: 16 })
  const my = useSpring(mouseY, { stiffness: 38, damping: 16 })

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  useEffect(() => {
    return scrollYProgress.on('change', v => {
      setScene(v < 0.25 ? 0 : v < 0.5 ? 1 : v < 0.75 ? 2 : 3)
    })
  }, [scrollYProgress])

  const handleMouse = (e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    mouseX.set(((e.clientX - r.left) / r.width) * 2 - 1)
    mouseY.set(((e.clientY - r.top) / r.height) * 2 - 1)
  }

  // Chateau: visible immediately, zooms in, fades at scene 3
  const chScale   = useTransform(scrollYProgress, [0, 0.72], [1.05, 2.5])
  const chOpacity = useTransform(scrollYProgress, [0, 0.52, 0.72], [1, 1, 0])
  const chX = useTransform(mx, [-1,1], [-10,10])
  const chY = useTransform(my, [-1,1], [-6,6])

  // Pour scene: fades in at 50%
  const pourOpacity = useTransform(scrollYProgress, [0.50, 0.70], [0, 1])
  const pourX = useTransform(mx, [-1,1], [-10,10])
  const pourY = useTransform(my, [-1,1], [-6,6])

  // Bottle: starts right-center, moves toward upper-LEFT as scroll progresses
  const bottleOpacity = useTransform(scrollYProgress, [0, 0.03, 0.52, 0.65], [0, 1, 1, 0])
  const bottleRot     = useTransform(scrollYProgress, [0.25, 0.52], [0, -32])
  const bottleTransX  = useTransform(scrollYProgress, [0, 0.52], ['0%', '-120%'])
  const bottleTransY  = useTransform(scrollYProgress, [0, 0.52], ['0%', '-80%'])
  const bottleMX = useTransform(mx, [-1,1], [-22,22])
  const bottleMY = useTransform(my, [-1,1], [-12,12])

  // Glass: starts left-bottom, moves toward RIGHT as scroll progresses
  const glassOpacity = useTransform(scrollYProgress, [0, 0.03, 0.52, 0.65], [0, 1, 1, 0])
  const glassTransX  = useTransform(scrollYProgress, [0, 0.52], ['0%', '140%'])
  const glassTransY  = useTransform(scrollYProgress, [0, 0.52], ['0%', '-40%'])
  const glassMX = useTransform(mx, [-1,1], [-30,30])
  const glassMY = useTransform(my, [-1,1], [-16,16])

  // Text opacities
  const t0 = useTransform(scrollYProgress, [0,0.04,0.20,0.26], [0,1,1,0])
  const t1 = useTransform(scrollYProgress, [0.24,0.28,0.44,0.50], [0,1,1,0])
  const t2 = useTransform(scrollYProgress, [0.49,0.53,0.69,0.75], [0,1,1,0])
  const t3 = useTransform(scrollYProgress, [0.74,0.79], [0,1])
  const t0Y = useTransform(scrollYProgress, [0,0.04], [30,0])
  const t1Y = useTransform(scrollYProgress, [0.24,0.28], [30,0])
  const t2Y = useTransform(scrollYProgress, [0.49,0.53], [30,0])
  const t3Y = useTransform(scrollYProgress, [0.74,0.79], [30,0])

  const titleStyle = {
    fontFamily: "'Playfair Display',Georgia,serif",
    fontSize: 'clamp(2.8rem,6.2vw,5.4rem)',
    fontWeight: 400, lineHeight: 1.02, color: '#fff',
    textShadow: '0 2px 60px rgba(0,0,0,0.8)',
    letterSpacing: '-0.02em',
  }

  return (
    <div ref={containerRef} style={{ height: '500vh' }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#0d0500]"
        onMouseMove={handleMouse}
        onMouseLeave={() => { mouseX.set(0); mouseY.set(0) }}>

        {/* === Chateau layer === */}
        <motion.div className="absolute inset-0" style={{ opacity: chOpacity }}>
          <motion.div className="absolute inset-0"
            style={{ scale: chScale, x: chX, y: chY, transformOrigin: 'center 60%' }}>
            <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: "url('/images/chateau.png')" }} />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/75" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-transparent" />
        </motion.div>

        {/* === Pour scene layer === */}
        <motion.div className="absolute inset-0" style={{ opacity: pourOpacity }}>
          <motion.div className="absolute inset-0" style={{ x: pourX, y: pourY, scale: 1.06 }}>
            <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: "url('/images/pour-scene.png')" }} />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/5 to-transparent" />
        </motion.div>

        {/* === Bottle moves to upper-left === */}
        <motion.div className="absolute pointer-events-none"
          style={{
            right: '-2%', top: '42%',
            width: 'clamp(280px,36vw,580px)',
            translateX: bottleTransX,
            translateY: bottleTransY,
            x: bottleMX, y: bottleMY,
            rotate: bottleRot,
            opacity: bottleOpacity,
            transformOrigin: 'bottom center',
            zIndex: 15,
          }}>
          <img src="/images/bottle.png" alt="" draggable={false} className="w-full h-auto"
            style={{ mixBlendMode: 'lighten', filter: 'drop-shadow(0 24px 64px rgba(139,26,26,0.5))' }} />
        </motion.div>

        {/* === Glass moves to right === */}
        <motion.div className="absolute pointer-events-none"
          style={{
            left: '2%', bottom: '4%',
            width: 'clamp(180px,26vw,420px)',
            translateX: glassTransX,
            translateY: glassTransY,
            x: glassMX, y: glassMY,
            opacity: glassOpacity,
            zIndex: 15,
          }}>
          <img src="/images/glass.png" alt="" draggable={false} className="w-full h-auto"
            style={{ mixBlendMode: 'lighten', filter: 'drop-shadow(0 20px 44px rgba(196,150,58,0.25))' }} />
        </motion.div>

        {/* === Vignette === */}
        <div className="absolute inset-0 pointer-events-none z-10"
          style={{ background: 'radial-gradient(ellipse 92% 92% at 50% 50%, transparent 20%, rgba(3,0,0,0.62) 100%)' }} />

        {/* === Texts 0-2 === */}
        {[
          { op: t0, y: t0Y, d: copy[0] },
          { op: t1, y: t1Y, d: copy[1] },
          { op: t2, y: t2Y, d: copy[2] },
        ].map(({ op, y: ty, d }, i) => (
          <motion.div key={i}
            className="absolute inset-0 flex flex-col justify-center px-8 md:px-24 z-20 pointer-events-none"
            style={{ opacity: op, y: ty }}>
            <div className="max-w-lg">
              <motion.p style={{ fontSize: '10px', letterSpacing: '0.52em', textTransform: 'uppercase', color: '#C4963A', marginBottom: '14px' }}>
                {d.eyebrow}
              </motion.p>
              <h2 style={titleStyle}>
                <span style={{ display: 'block' }}>{d.h1}</span>
                <span style={{ display: 'block', fontStyle: 'italic' }}>{d.h2}</span>
              </h2>
              <p style={{ marginTop: '22px', fontSize: '0.88rem', color: 'rgba(255,255,255,0.46)', lineHeight: 1.95, whiteSpace: 'pre-line' }}>{d.body}</p>
            </div>
          </motion.div>
        ))}

        {/* === Scene 4 CTA === */}
        <motion.div className="absolute inset-0 flex flex-col justify-center px-8 md:px-24 z-20"
          style={{ opacity: t3, y: t3Y }}>
          <div className="max-w-xl">
            <p style={{ fontSize: '10px', letterSpacing: '0.52em', textTransform: 'uppercase', color: '#C4963A', marginBottom: '14px' }}>{copy[3].eyebrow}</p>
            <h2 style={titleStyle}>
              <span style={{ display: 'block' }}>{copy[3].h1}</span>
              <span style={{ display: 'block', fontStyle: 'italic' }}>{copy[3].h2}</span>
            </h2>
            <p style={{ marginTop: '22px', fontSize: '0.88rem', color: 'rgba(255,255,255,0.46)', lineHeight: 1.95, whiteSpace: 'pre-line', marginBottom: '40px' }}>{copy[3].body}</p>

            {/* Cards animate up */}
            <div className="grid grid-cols-2 gap-3 mb-10 max-w-md">
              {cards.map((c, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16,1,0.3,1] }}
                  style={{ border: '1px solid rgba(196,150,58,0.28)', padding: '14px 16px', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)' }}>
                  <div style={{ fontSize: '20px', marginBottom: '6px' }}>{c.icon}</div>
                  <div style={{ fontSize: '10px', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', marginBottom: '2px' }}>{c.label}</div>
                  <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em' }}>{c.sub}</div>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <Link href="/build" className="group relative inline-flex overflow-hidden"
                style={{ border: '1px solid rgba(196,150,58,0.7)', padding: '16px 44px', fontSize: '10px', letterSpacing: '0.38em', textTransform: 'uppercase', color: '#C4963A', textDecoration: 'none' }}>
                <span className="absolute inset-0 -translate-x-full transition-transform duration-700 group-hover:translate-x-0" style={{ background: '#C4963A' }} />
                <span className="relative transition-colors duration-700 group-hover:text-[#1a0800]">
                  {lang === 'fr' ? 'Cr\u00e9er Ma Journ\u00e9e' : 'Build My Wine Day'} \u2192
                </span>
              </Link>
              <Link href="/regions" style={{ alignSelf: 'center', fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.32)', borderBottom: '1px solid rgba(255,255,255,0.14)', paddingBottom: '3px', textDecoration: 'none' }}>
                {lang === 'fr' ? 'Explorer les appellations' : 'Explore appellations'}
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-30 pointer-events-none"
          style={{ opacity: t0 }}>
          <span style={{ fontSize: '9px', letterSpacing: '0.5em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)' }}>Scroll</span>
          <div className="relative w-px h-12 overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <motion.div className="absolute left-0 w-full" style={{ background: '#C4963A' }}
              animate={{ height: ['0%','100%','0%'], top: ['0%','0%','100%'] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }} />
          </div>
        </motion.div>

        {/* Scene dots */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-50 pointer-events-none">
          {[0,1,2,3].map(i => (
            <motion.div key={i} className="rounded-full"
              animate={{ height: scene===i ? 28 : 7, width: 3, backgroundColor: scene===i ? '#C4963A' : 'rgba(255,255,255,0.2)' }}
              transition={{ duration: 0.4 }} />
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-30"
          style={{ height: '1px', background: 'linear-gradient(90deg,transparent,rgba(196,150,58,0.38),transparent)' }} />
      </div>
    </div>
  )
}
