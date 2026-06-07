'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from 'framer-motion'
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
  { eyebrow: 'Begin Your Journey', title: ['Craft Your Day,', 'Bottle by Bottle'], body: 'Let our AI sommelier design\nyour Bordeaux itinerary.', cta: { label: 'Build My Wine Day →', href: '/build' } },
]

const FR: SceneData[] = [
  { eyebrow: 'Bienvenue à Bordeaux', title: ['Votre Journée', 'du Vin Parfaite'], body: 'Domaines intemporels. Dégustations privées.\nUne région extraordinaire.', cta: null },
  { eyebrow: 'La Collection', title: ['Grands Crus', "d'Excellence"], body: 'Six siècles de terroir\nversés dans chaque verre.', cta: null },
  { eyebrow: "L'Expérience", title: ['Vins Exceptionnels,', 'Histoires Exceptionnelles'], body: 'Dégustations privées en cave,\nréservées à quelques élus.', cta: null },
  { eyebrow: 'Commencez Votre Voyage', title: ['Créez Votre Journée,', 'Bouteille par Bouteille'], body: 'Laissez notre sommelier IA concevoir\nvotre itinéraire bordelais.', cta: { label: 'Créer Ma Journée →', href: '/build' } },
]

function useMouseParallax() {
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, { stiffness: 55, damping: 20 })
  const y = useSpring(rawY, { stiffness: 55, damping: 20 })
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
    <div aria-hidden="true" className="absolute inset-0 pointer-events-none z-10"
      style={{ background: 'radial-gradient(ellipse 85% 85% at 50% 50%, transparent 28%, rgba(6,1,0,0.58) 100%)' }} />
  )
}

function SceneText({ scene, delay = 0 }: { scene: SceneData; delay?: number }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-20 z-20 pointer-events-none">
      <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1], delay }}
        className="max-w-lg">
        <p style={{ fontFamily: 'system-ui,sans-serif', fontSize: '11px', letterSpacing: '0.42em', textTransform: 'uppercase', color: '#C4963A', marginBottom: '14px' }}>
          {scene.eyebrow}
        </p>
        <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 'clamp(2.5rem,5.8vw,5rem)', fontWeight: 400, lineHeight: 1.0, color: '#fff', textShadow: '0 4px 56px rgba(0,0,0,0.6)', marginBottom: '22px' }}>
          {scene.title.map((l, i) => <span key={i} style={{ display: 'block' }}>{l}</span>)}
        </h2>
        <p style={{ fontFamily: 'system-ui,sans-serif', fontSize: 'clamp(0.85rem,1.4vw,0.96rem)', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, whiteSpace: 'pre-line' }}>
          {scene.body}
        </p>
      </motion.div>
    </div>
  )
}

const OVERLAYS = {
  left: (<><div className="absolute inset-0 bg-gradient-to-b from-black/12 via-transparent to-black/82" /><div className="absolute inset-0 bg-gradient-to-r from-black/52 via-black/8 to-transparent" /></>),
  leftDark: (<><div className="absolute inset-0 bg-gradient-to-b from-black/22 via-black/8 to-black/85" /><div className="absolute inset-0 bg-gradient-to-r from-black/56 via-black/10 to-transparent" /></>),
  cta: (<><div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/90" /><div className="absolute inset-0 bg-gradient-to-r from-black/72 via-black/22 to-transparent" /></>),
}

function Scene1({ data }: { data: SceneData }) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const { x, y, onMouseMove, onMouseLeave } = useMouseParallax()
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '-14%'])
  const bgMX = useTransform(x, [-1, 1], [-15, 15])
  const bottleMX = useTransform(x, [-1, 1], [-25, 25])
  const bottleMY = useTransform(y, [-1, 1], [-12, 12])
  const glassMX = useTransform(x, [-1, 1], [-30, 30])
  const glassMY = useTransform(y, [-1, 1], [-15, 15])
  const exitOp = useTransform(scrollYProgress, [0.65, 1.0], [1, 0])
  const exitScale = useTransform(scrollYProgress, [0.65, 1.0], [1, 1.05])
  return (
    <section ref={ref} className="relative h-screen overflow-hidden bg-black" onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
      <motion.div className="absolute inset-0" style={{ opacity: exitOp, scale: exitScale }}>
        <motion.div className="absolute inset-0" style={{ y: bgY, x: bgMX, scale: 1.18, transformOrigin: 'center top' }}>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/chateau.png')" }} />
          {OVERLAYS.left}
        </motion.div>
        <motion.div className="absolute" style={{ right: '1%', top: '50%', translateY: '-52%', width: 'clamp(180px,23vw,370px)', x: bottleMX, y: bottleMY, transformOrigin: 'bottom center', zIndex: 10 }}
          initial={{ opacity: 0, translateX: 60 }} animate={{ opacity: 1, translateX: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}>
          <img src="/images/bottle.png" alt="" draggable={false} className="w-full h-auto select-none" style={{ mixBlendMode: 'lighten' }} />
        </motion.div>
        <motion.div className="absolute" style={{ left: '4%', bottom: '7%', width: 'clamp(120px,15vw,250px)', x: glassMX, y: glassMY, zIndex: 10 }}
          initial={{ opacity: 0, translateX: -50 }} animate={{ opacity: 1, translateX: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}>
          <img src="/images/glass.png" alt="" draggable={false} className="w-full h-auto select-none" style={{ mixBlendMode: 'lighten' }} />
        </motion.div>
        <SceneText scene={data} delay={0.15} />
        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-30 pointer-events-none"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 0.9 }}>
          <span style={{ fontFamily: 'system-ui', fontSize: '10px', letterSpacing: '0.44em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.34)' }}>Scroll</span>
          <div className="relative w-px h-10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.12)' }}>
            <motion.div className="absolute left-0 w-full" style={{ background: '#C4963A' }}
              animate={{ height: ['0%', '100%', '0%'], top: ['0%', '0%', '100%'] }}
              transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }} />
          </div>
        </motion.div>
      </motion.div>
      <Vignette />
    </section>
  )
}

function Scene2({ data }: { data: SceneData }) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const { x, y, onMouseMove, onMouseLeave } = useMouseParallax()
  const bgY = useTransform(scrollYProgress, [0, 1], ['-14%', '-26%'])
  const bgMX = useTransform(x, [-1, 1], [-15, 15])
  const bottleRot = useTransform(scrollYProgress, [0, 1], [0, -22])
  const bottleMX = useTransform(x, [-1, 1], [-25, 25])
  const bottleMY = useTransform(y, [-1, 1], [-12, 12])
  const glassMX = useTransform(x, [-1, 1], [-30, 30])
  const glassMY = useTransform(y, [-1, 1], [-15, 15])
  const enterOp = useTransform(scrollYProgress, [0, 0.14], [0, 1])
  const exitOp = useTransform(scrollYProgress, [0.68, 1.0], [1, 0])
  const exitScale = useTransform(scrollYProgress, [0.68, 1.0], [1, 1.05])
  return (
    <section ref={ref} className="relative h-screen overflow-hidden bg-black" onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
      <motion.div className="absolute inset-0" style={{ opacity: exitOp, scale: exitScale }}>
        <motion.div className="absolute inset-0" style={{ opacity: enterOp }}>
          <motion.div className="absolute inset-0" style={{ y: bgY, x: bgMX, scale: 1.18, transformOrigin: 'center top' }}>
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/chateau.png')" }} />
            {OVERLAYS.leftDark}
          </motion.div>
          <motion.div className="absolute" style={{ right: '1%', top: '50%', translateY: '-52%', width: 'clamp(180px,23vw,370px)', x: bottleMX, y: bottleMY, rotate: bottleRot, transformOrigin: 'bottom center', zIndex: 10 }}>
            <img src="/images/bottle.png" alt="" draggable={false} className="w-full h-auto select-none" style={{ mixBlendMode: 'lighten' }} />
          </motion.div>
          <motion.div className="absolute" style={{ left: '4%', bottom: '7%', width: 'clamp(120px,15vw,250px)', x: glassMX, y: glassMY, zIndex: 10 }}>
            <img src="/images/glass.png" alt="" draggable={false} className="w-full h-auto select-none" style={{ mixBlendMode: 'lighten' }} />
          </motion.div>
          <SceneText scene={data} />
        </motion.div>
      </motion.div>
      <Vignette />
    </section>
  )
}

function Scene3({ data }: { data: SceneData }) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const { x, y, onMouseMove, onMouseLeave } = useMouseParallax()
  const bgY = useTransform(scrollYProgress, [0, 1], ['-26%', '-36%'])
  const bgMX = useTransform(x, [-1, 1], [-15, 15])
  const pourMX = useTransform(x, [-1, 1], [-10, 10])
  const pourMY = useTransform(y, [-1, 1], [-6, 6])
  const bottleMX = useTransform(x, [-1, 1], [-25, 25])
  const bottleMY = useTransform(y, [-1, 1], [-12, 12])
  const glassMX = useTransform(x, [-1, 1], [-30, 30])
  const glassMY = useTransform(y, [-1, 1], [-15, 15])
  const enterOp = useTransform(scrollYProgress, [0, 0.14], [0, 1])
  const chateauFade = useTransform(scrollYProgress, [0.08, 0.45], [1, 0])
  const pourFade = useTransform(scrollYProgress, [0.08, 0.50], [0, 1])
  const objectsFade = useTransform(scrollYProgress, [0.08, 0.40], [1, 0])
  const exitOp = useTransform(scrollYProgress, [0.68, 1.0], [1, 0])
  const exitScale = useTransform(scrollYProgress, [0.68, 1.0], [1, 1.05])
  return (
    <section ref={ref} className="relative h-screen overflow-hidden bg-black" onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
      <motion.div className="absolute inset-0" style={{ opacity: exitOp, scale: exitScale }}>
        <motion.div className="absolute inset-0" style={{ opacity: enterOp }}>
          <motion.div className="absolute inset-0" style={{ opacity: chateauFade }}>
            <motion.div className="absolute inset-0" style={{ y: bgY, x: bgMX, scale: 1.18, transformOrigin: 'center top' }}>
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/chateau.png')" }} />
              {OVERLAYS.leftDark}
            </motion.div>
          </motion.div>
          <motion.div className="absolute inset-0" style={{ opacity: pourFade, x: pourMX, y: pourMY, scale: 1.04 }}>
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/pour-scene.png')" }} />
            <div className="absolute inset-0 bg-gradient-to-b from-black/28 via-transparent to-black/82" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/58 via-black/8 to-transparent" />
          </motion.div>
          <motion.div className="absolute inset-0" style={{ opacity: objectsFade, zIndex: 10 }}>
            <motion.div className="absolute" style={{ right: '1%', top: '50%', translateY: '-52%', width: 'clamp(180px,23vw,370px)', x: bottleMX, y: bottleMY, rotate: -22, transformOrigin: 'bottom center' }}>
              <img src="/images/bottle.png" alt="" draggable={false} className="w-full h-auto select-none" style={{ mixBlendMode: 'lighten' }} />
            </motion.div>
            <motion.div className="absolute" style={{ left: '4%', bottom: '7%', width: 'clamp(120px,15vw,250px)', x: glassMX, y: glassMY }}>
              <img src="/images/glass.png" alt="" draggable={false} className="w-full h-auto select-none" style={{ mixBlendMode: 'lighten' }} />
            </motion.div>
          </motion.div>
          <SceneText scene={data} />
        </motion.div>
      </motion.div>
      <Vignette />
    </section>
  )
}

function Scene4({ data, lang }: { data: SceneData; lang: string }) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const { x, y, onMouseMove, onMouseLeave } = useMouseParallax()
  const enterOp = useTransform(scrollYProgress, [0, 0.14], [0, 1])
  const pourMX = useTransform(x, [-1, 1], [-10, 10])
  const pourMY = useTransform(y, [-1, 1], [-6, 6])
  return (
    <section ref={ref} className="relative h-screen overflow-hidden bg-black" onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
      <motion.div className="absolute inset-0" style={{ opacity: enterOp }}>
        <motion.div className="absolute inset-0" style={{ x: pourMX, y: pourMY, scale: 1.06 }}>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/pour-scene.png')" }} />
          {OVERLAYS.cta}
        </motion.div>
        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-20 z-20">
          <motion.div initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.74, ease: [0.22, 1, 0.36, 1] }} className="max-w-lg">
            <p style={{ fontFamily: 'system-ui,sans-serif', fontSize: '11px', letterSpacing: '0.42em', textTransform: 'uppercase', color: '#C4963A', marginBottom: '14px' }}>{data.eyebrow}</p>
            <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 'clamp(2.5rem,5.8vw,5rem)', fontWeight: 400, lineHeight: 1.0, color: '#fff', textShadow: '0 4px 56px rgba(0,0,0,0.6)', marginBottom: '22px' }}>
              {data.title.map((l, i) => <span key={i} style={{ display: 'block' }}>{l}</span>)}
            </h2>
            <p style={{ fontFamily: 'system-ui,sans-serif', fontSize: 'clamp(0.85rem,1.4vw,0.96rem)', color: 'rgba(255,255,255,0.52)', lineHeight: 1.75, whiteSpace: 'pre-line', marginBottom: '44px' }}>{data.body}</p>
            {data.cta && (
              <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: 0.3, duration: 0.6 }} className="flex flex-col sm:flex-row gap-5 items-start">
                <Link href={data.cta.href} className="group relative inline-flex overflow-hidden"
                  style={{ border: '1px solid rgba(196,150,58,0.6)', padding: '15px 38px', fontFamily: 'system-ui,sans-serif', fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C4963A', textDecoration: 'none' }}>
                  <span className="absolute inset-0 -translate-x-full transition-transform duration-500 ease-in-out group-hover:translate-x-0" style={{ background: '#C4963A' }} />
                  <span className="relative transition-colors duration-500 group-hover:text-[#1a0800]">{data.cta.label}</span>
                </Link>
                <Link href="/regions" style={{ alignSelf: 'center', fontFamily: 'system-ui,sans-serif', fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(255,255,255,0.18)', paddingBottom: '3px', textDecoration: 'none' }}>
                  {lang === 'fr' ? 'Explorer les appellations' : 'Explore appellations'}
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>
      <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none" style={{ height: '1px', background: 'linear-gradient(90deg,transparent,rgba(196,150,58,0.45),transparent)' }} />
      <Vignette />
    </section>
  )
}

function SceneDots({ active }: { active: number }) {
  return (
    <div aria-hidden="true" className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-50 pointer-events-none">
      {[0, 1, 2, 3].map((i) => (
        <motion.div key={i} className="rounded-full"
          animate={{ height: active === i ? 28 : 7, width: 3, backgroundColor: active === i ? '#C4963A' : 'rgba(255,255,255,0.26)' }}
          transition={{ duration: 0.38, ease: 'easeOut' }} />
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
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.heroScene))
      }),
      { threshold: 0.5 }
    )
    sections.forEach((s) => obs.observe(s))
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
