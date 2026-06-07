'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

interface SceneData {
  eyebrow: string
  title: string[]
  body: string
  cta: { label: string; href: string } | null
}

const EN: SceneData[] = [
  { eyebrow: 'Welcome to Bordeaux', title: ['Your Perfect', 'Wine Day'], body: 'Timeless estates. Private tastings.\nOne extraordinary region.', cta: null },
  { eyebrow: 'The Collection', title: ['Grands Crus', 'of Excellence'], body: 'Six centuries of terroir\npoured into every glass.', cta: null },
  { eyebrow: 'The Experience', title: ['Exceptional Wines,', 'Exceptional Stories'], body: 'Private cellar tastings\nreserved for only a few.', cta: null },
  { eyebrow: 'Begin Your Journey', title: ['Craft Your Day,', 'Bottle by Bottle'], body: 'Let our AI sommelier design\nyour Bordeaux itinerary.', cta: { label: 'Build My Wine Day \u2192', href: '/build' } },
]

const FR: SceneData[] = [
  { eyebrow: 'Bienvenue \u00e0 Bordeaux', title: ['Votre Journ\u00e9e', 'du Vin Parfaite'], body: 'Domaines intemporels. D\u00e9gustations priv\u00e9es.\nUne r\u00e9gion extraordinaire.', cta: null },
  { eyebrow: 'La Collection', title: ['Grands Crus', "d'Excellence"], body: 'Six si\u00e8cles de terroir\nvers\u00e9s dans chaque verre.', cta: null },
  { eyebrow: "L'Exp\u00e9rience", title: ['Vins Exceptionnels,', 'Histoires Exceptionnelles'], body: 'D\u00e9gustations priv\u00e9es en cave,\nr\u00e9serv\u00e9es \u00e0 quelques \u00e9lus.', cta: null },
  { eyebrow: 'Commencez Votre Voyage', title: ['Cr\u00e9ez Votre Journ\u00e9e,', 'Bouteille par Bouteille'], body: 'Laissez notre sommelier IA concevoir\nvotre itin\u00e9raire bordelais.', cta: { label: 'Cr\u00e9er Ma Journ\u00e9e \u2192', href: '/build' } },
]

function useMouseParallax() {
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, { stiffness: 40, damping: 18 })
  const y = useSpring(rawY, { stiffness: 40, damping: 18 })
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    rawX.set(((e.clientX - r.left) / r.width) * 2 - 1)
    rawY.set(((e.clientY - r.top) / r.height) * 2 - 1)
  }, [rawX, rawY])
  const onMouseLeave = useCallback(() => { rawX.set(0); rawY.set(0) }, [rawX, rawY])
  return { x, y, onMouseMove, onMouseLeave }
}

function Vignette() {
  return (
    <div className="absolute inset-0 pointer-events-none z-10"
      style={{ background: 'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 25%, rgba(4,0,0,0.65) 100%)' }} />
  )
}

function SceneText({ scene, delay = 0 }: { scene: SceneData; delay?: number }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-24 z-20 pointer-events-none">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay }}
        className="max-w-lg"
      >
        <p style={{ fontFamily: 'system-ui', fontSize: '10px', letterSpacing: '0.5em', textTransform: 'uppercase', color: '#C4963A', marginBottom: '16px' }}>
          {scene.eyebrow}
        </p>
        <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 'clamp(2.8rem,6.5vw,5.5rem)', fontWeight: 400, lineHeight: 1.0, color: '#fff', textShadow: '0 2px 60px rgba(0,0,0,0.7)', marginBottom: '24px', letterSpacing: '-0.02em' }}>
          {scene.title.map((l, i) => <span key={i} style={{ display: 'block', fontStyle: i === 1 ? 'italic' : 'normal' }}>{l}</span>)}
        </h2>
        <p style={{ fontFamily: 'system-ui', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.9, whiteSpace: 'pre-line', letterSpacing: '0.02em' }}>
          {scene.body}
        </p>
      </motion.div>
    </div>
  )
}

// Scene 1 — Château ZOOMS IN on scroll (camera moving forward)
function Scene1({ data }: { data: SceneData }) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const { x, y, onMouseMove, onMouseLeave } = useMouseParallax()

  // ZOOM INTO château — scale 1 → 1.9 (feels like walking toward it)
  const chateauScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.9])
  const chateauMX = useTransform(x, [-1, 1], [-8, 8])
  const chateauMY = useTransform(y, [-1, 1], [-5, 5])

  // Bottle — large, right side, mouse parallax
  const bottleMX = useTransform(x, [-1, 1], [-28, 28])
  const bottleMY = useTransform(y, [-1, 1], [-14, 14])

  // Glass — left side, mouse parallax  
  const glassMX = useTransform(x, [-1, 1], [-35, 35])
  const glassMY = useTransform(y, [-1, 1], [-18, 18])

  // Fade out as scroll ends
  const exitOp = useTransform(scrollYProgress, [0.6, 0.95], [1, 0])

  return (
    <section ref={ref} className="relative h-screen overflow-hidden bg-black" onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
      <motion.div className="absolute inset-0" style={{ opacity: exitOp }}>

        {/* Château — ZOOMS IN */}
        <motion.div className="absolute inset-0 flex items-center justify-center"
          style={{ scale: chateauScale, x: chateauMX, y: chateauMY }}>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/chateau.png')" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/20" />
        </motion.div>

        {/* Bottle — 2x larger */}
        <motion.div className="absolute"
          style={{ right: '-2%', top: '45%', translateY: '-50%', width: 'clamp(320px,40vw,640px)', x: bottleMX, y: bottleMY, transformOrigin: 'bottom center', zIndex: 15 }}
          initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}>
          <img src="/images/bottle.png" alt="" draggable={false} className="w-full h-auto select-none drop-shadow-2xl"
            style={{ mixBlendMode: 'lighten', filter: 'drop-shadow(0 20px 60px rgba(139,26,26,0.4))' }} />
        </motion.div>

        {/* Glass — 2x larger */}
        <motion.div className="absolute"
          style={{ left: '2%', bottom: '5%', width: 'clamp(220px,30vw,480px)', x: glassMX, y: glassMY, zIndex: 15 }}
          initial={{ opacity: 0, x: -70 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}>
          <img src="/images/glass.png" alt="" draggable={false} className="w-full h-auto select-none"
            style={{ mixBlendMode: 'lighten', filter: 'drop-shadow(0 20px 40px rgba(196,150,58,0.2))' }} />
        </motion.div>

        <SceneText scene={data} delay={0.2} />

        {/* Scroll indicator */}
        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-30 pointer-events-none"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 1.0 }}>
          <span style={{ fontSize: '9px', letterSpacing: '0.5em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Scroll</span>
          <div className="relative w-px h-12 overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <motion.div className="absolute left-0 w-full" style={{ background: 'linear-gradient(to bottom, #C4963A, rgba(196,150,58,0.3))' }}
              animate={{ height: ['0%', '100%', '0%'], top: ['0%', '0%', '100%'] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }} />
          </div>
        </motion.div>
      </motion.div>

      <Vignette />
    </section>
  )
}

// Scene 2 — Bottle tilts, collection text
function Scene2({ data }: { data: SceneData }) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const { x, y, onMouseMove, onMouseLeave } = useMouseParallax()

  const chateauScale = useTransform(scrollYProgress, [0, 1], [1.9, 2.4])
  const chateauMX = useTransform(x, [-1, 1], [-8, 8])
  const bottleRot = useTransform(scrollYProgress, [0, 1], [0, -28])
  const bottleMX = useTransform(x, [-1, 1], [-28, 28])
  const bottleMY = useTransform(y, [-1, 1], [-14, 14])
  const glassMX = useTransform(x, [-1, 1], [-35, 35])
  const glassMY = useTransform(y, [-1, 1], [-18, 18])
  const enterOp = useTransform(scrollYProgress, [0, 0.12], [0, 1])
  const exitOp = useTransform(scrollYProgress, [0.65, 0.95], [1, 0])

  return (
    <section ref={ref} className="relative h-screen overflow-hidden bg-black" onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
      <motion.div className="absolute inset-0" style={{ opacity: exitOp }}>
        <motion.div className="absolute inset-0" style={{ opacity: enterOp }}>

          {/* Château continues zooming */}
          <motion.div className="absolute inset-0" style={{ scale: chateauScale, x: chateauMX }}>
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/chateau.png')" }} />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/85" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-transparent to-black/15" />
          </motion.div>

          {/* Bottle tilts on scroll */}
          <motion.div className="absolute"
            style={{ right: '-2%', top: '45%', translateY: '-50%', width: 'clamp(320px,40vw,640px)', x: bottleMX, y: bottleMY, rotate: bottleRot, transformOrigin: 'bottom center', zIndex: 15 }}>
            <img src="/images/bottle.png" alt="" draggable={false} className="w-full h-auto select-none"
              style={{ mixBlendMode: 'lighten', filter: 'drop-shadow(0 20px 60px rgba(139,26,26,0.4))' }} />
          </motion.div>

          <motion.div className="absolute"
            style={{ left: '2%', bottom: '5%', width: 'clamp(220px,30vw,480px)', x: glassMX, y: glassMY, zIndex: 15 }}>
            <img src="/images/glass.png" alt="" draggable={false} className="w-full h-auto select-none"
              style={{ mixBlendMode: 'lighten', filter: 'drop-shadow(0 20px 40px rgba(196,150,58,0.2))' }} />
          </motion.div>

          <SceneText scene={data} />
        </motion.div>
      </motion.div>
      <Vignette />
    </section>
  )
}

// Scene 3 — Pour scene crossfades in
function Scene3({ data }: { data: SceneData }) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const { x, y, onMouseMove, onMouseLeave } = useMouseParallax()

  const chateauScale = useTransform(scrollYProgress, [0, 0.5], [2.4, 2.8])
  const chateauFade = useTransform(scrollYProgress, [0.05, 0.45], [1, 0])
  const pourFade = useTransform(scrollYProgress, [0.05, 0.55], [0, 1])
  const pourMX = useTransform(x, [-1, 1], [-12, 12])
  const pourMY = useTransform(y, [-1, 1], [-7, 7])
  const objectsFade = useTransform(scrollYProgress, [0.05, 0.42], [1, 0])
  const bottleMX = useTransform(x, [-1, 1], [-28, 28])
  const bottleMY = useTransform(y, [-1, 1], [-14, 14])
  const glassMX = useTransform(x, [-1, 1], [-35, 35])
  const glassMY = useTransform(y, [-1, 1], [-18, 18])
  const enterOp = useTransform(scrollYProgress, [0, 0.12], [0, 1])
  const exitOp = useTransform(scrollYProgress, [0.65, 0.95], [1, 0])

  return (
    <section ref={ref} className="relative h-screen overflow-hidden bg-black" onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
      <motion.div className="absolute inset-0" style={{ opacity: exitOp }}>
        <motion.div className="absolute inset-0" style={{ opacity: enterOp }}>

          {/* Château fades out while still zooming */}
          <motion.div className="absolute inset-0" style={{ opacity: chateauFade }}>
            <motion.div className="absolute inset-0" style={{ scale: chateauScale }}>
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/chateau.png')" }} />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/85" />
            </motion.div>
          </motion.div>

          {/* Pour scene fades in — large, cinematic */}
          <motion.div className="absolute inset-0" style={{ opacity: pourFade }}>
            <motion.div className="absolute inset-0" style={{ x: pourMX, y: pourMY, scale: 1.06 }}>
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/pour-scene.png')" }} />
              <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/85" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/5 to-transparent" />
            </motion.div>
          </motion.div>

          {/* Bottle + glass dissolve as pour-scene appears */}
          <motion.div className="absolute inset-0" style={{ opacity: objectsFade, zIndex: 15 }}>
            <motion.div className="absolute" style={{ right: '-2%', top: '45%', translateY: '-50%', width: 'clamp(320px,40vw,640px)', x: bottleMX, y: bottleMY, rotate: -28, transformOrigin: 'bottom center' }}>
              <img src="/images/bottle.png" alt="" draggable={false} className="w-full h-auto select-none"
                style={{ mixBlendMode: 'lighten', filter: 'drop-shadow(0 20px 60px rgba(139,26,26,0.4))' }} />
            </motion.div>
            <motion.div className="absolute" style={{ left: '2%', bottom: '5%', width: 'clamp(220px,30vw,480px)', x: glassMX, y: glassMY }}>
              <img src="/images/glass.png" alt="" draggable={false} className="w-full h-auto select-none"
                style={{ mixBlendMode: 'lighten', filter: 'drop-shadow(0 20px 40px rgba(196,150,58,0.2))' }} />
            </motion.div>
          </motion.div>

          <SceneText scene={data} />
        </motion.div>
      </motion.div>
      <Vignette />
    </section>
  )
}

// Scene 4 — CTA, cards animate up from below
function Scene4({ data, lang }: { data: SceneData; lang: string }) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const { x, y, onMouseMove, onMouseLeave } = useMouseParallax()
  const enterOp = useTransform(scrollYProgress, [0, 0.12], [0, 1])
  const pourMX = useTransform(x, [-1, 1], [-12, 12])
  const pourMY = useTransform(y, [-1, 1], [-7, 7])

  const cards = [
    { icon: '🍷', label: lang === 'fr' ? '7 375 châteaux' : '7,375 châteaux' },
    { icon: '🚗', label: lang === 'fr' ? 'Transport inclus' : 'Transport included' },
    { icon: '⭐', label: lang === 'fr' ? 'Note 4.8 / 5' : 'Rated 4.8 / 5' },
    { icon: '🎁', label: lang === 'fr' ? 'Annulation gratuite' : 'Free cancellation' },
  ]

  return (
    <section ref={ref} className="relative h-screen overflow-hidden bg-black" onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
      <motion.div className="absolute inset-0" style={{ opacity: enterOp }}>

        <motion.div className="absolute inset-0" style={{ x: pourMX, y: pourMY, scale: 1.08 }}>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/pour-scene.png')" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/92" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />
        </motion.div>

        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-24 z-20">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }} className="max-w-lg">
            <p style={{ fontSize: '10px', letterSpacing: '0.5em', textTransform: 'uppercase', color: '#C4963A', marginBottom: '16px' }}>{data.eyebrow}</p>
            <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 'clamp(2.8rem,6.5vw,5.5rem)', fontWeight: 400, lineHeight: 1.0, color: '#fff', marginBottom: '24px' }}>
              {data.title.map((l, i) => <span key={i} style={{ display: 'block', fontStyle: i === 1 ? 'italic' : 'normal' }}>{l}</span>)}
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.9, whiteSpace: 'pre-line', marginBottom: '40px' }}>{data.body}</p>

            {/* Cards animate up from below */}
            <div className="flex gap-3 flex-wrap mb-10">
              {cards.map((c, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  style={{ border: '1px solid rgba(196,150,58,0.25)', padding: '10px 16px', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
                  <span style={{ fontSize: '14px', marginRight: '8px' }}>{c.icon}</span>
                  <span style={{ fontSize: '10px', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>{c.label}</span>
                </motion.div>
              ))}
            </div>

            {data.cta && (
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.5, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-5 items-start">
                <Link href={data.cta.href} className="group relative inline-flex overflow-hidden"
                  style={{ border: '1px solid rgba(196,150,58,0.7)', padding: '16px 42px', fontSize: '10px', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#C4963A', textDecoration: 'none' }}>
                  <span className="absolute inset-0 -translate-x-full transition-transform duration-700 ease-in-out group-hover:translate-x-0" style={{ background: '#C4963A' }} />
                  <span className="relative transition-colors duration-700 group-hover:text-[#1a0800]">{data.cta.label}</span>
                </Link>
                <Link href="/regions" style={{ alignSelf: 'center', fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '3px', textDecoration: 'none' }}>
                  {lang === 'fr' ? 'Explorer les appellations' : 'Explore appellations'}
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none"
        style={{ height: '1px', background: 'linear-gradient(90deg,transparent,rgba(196,150,58,0.4),transparent)' }} />
      <Vignette />
    </section>
  )
}

function SceneDots({ active }: { active: number }) {
  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-50 pointer-events-none">
      {[0,1,2,3].map(i => (
        <motion.div key={i} className="rounded-full"
          animate={{ height: active === i ? 28 : 7, width: 3, backgroundColor: active === i ? '#C4963A' : 'rgba(255,255,255,0.22)' }}
          transition={{ duration: 0.4, ease: 'easeOut' }} />
      ))}
    </div>
  )
}

export default function HeroScene() {
  const { lang } = useLanguage()
  const scenes = lang === 'fr' ? FR : EN
  const [active, setActive] = useState(0)

  useEffect(() => {
    const sections = document.querySelectorAll('[data-hero-scene]')
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.heroScene))
      }),
      { threshold: 0.5 }
    )
    sections.forEach(s => obs.observe(s))
    return () => obs.disconnect()
  }, [])

  return (
    <>
      <SceneDots active={active} />
      <div data-hero-scene="0"><Scene1 data={scenes[0]} /></div>
      <div data-hero-scene="1"><Scene2 data={scenes[1]} /></div>
      <div data-hero-scene="2"><Scene3 data={scenes[2]} /></div>
      <div data-hero-scene="3"><Scene4 data={scenes[3]} lang={lang} /></div>
    </>
  )
}
