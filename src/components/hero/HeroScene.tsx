'use client'

import { useRef, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useScroll, useMotionValueEvent, useTransform, motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import Bottle from './Bottle'
import WineGlass from './WineGlass'
import { useLanguage } from '@/context/LanguageContext'
import Link from 'next/link'

interface ScrollState {
  progress: number
  scene: number
  sceneProgress: number
}

const SCROLL_MULTIPLIER = 4
const SCENE_COUNT = 4

const COPY_EN = [
  { eyebrow: 'Welcome to Bordeaux', title: ['A Legacy', 'of Excellence'], sub: 'Discover timeless wines and unforgettable moments.', cta: null },
  { eyebrow: 'The Appellations', title: ['Medoc - Saint-Emilion', 'Pomerol - Sauternes'], sub: 'Six centuries of terroir, one extraordinary region.', cta: null },
  { eyebrow: 'The Experience', title: ['Exceptional Wines,', 'Exceptional Stories'], sub: 'Private cellar tastings reserved for a few.', cta: null },
  { eyebrow: 'Begin Your Journey', title: ['Craft Your Perfect', 'Wine Day'], sub: 'Let our AI sommelier design your Bordeaux itinerary.', cta: { label: 'Build My Experience', href: '/build' } },
]

const COPY_FR = [
  { eyebrow: 'Bienvenue a Bordeaux', title: ['Un Heritage', "d'Excellence"], sub: 'Decouvrez des vins intemporels et des moments inoubliables.', cta: null },
  { eyebrow: 'Les Appellations', title: ['Medoc - Saint-Emilion', 'Pomerol - Sauternes'], sub: 'Six siecles de terroir, une region extraordinaire.', cta: null },
  { eyebrow: "L'Experience", title: ['Vins Exceptionnels,', 'Histoires Exceptionnelles'], sub: 'Degustations privees en cave, reservees a quelques elus.', cta: null },
  { eyebrow: 'Commencez Votre Voyage', title: ['Creez Votre Parfaite', 'Journee du Vin'], sub: 'Laissez notre sommelier IA concevoir votre itineraire bordelais.', cta: { label: 'Creer Mon Experience', href: '/build' } },
]

function R3FContent({ scrollState }: { scrollState: ScrollState }) {
  const { progress, scene, sceneProgress } = scrollState
  const groupRef = useRef<THREE.Group>(null)

  const bottleTilt = scene === 2 ? Math.PI * 0.38 * sceneProgress : 0
  const glassFill = scene === 2 ? sceneProgress * 0.65 : scene > 2 ? 0.65 : 0
  const groupOpacity = scene === 3 && sceneProgress > 0.8
    ? 1 - (sceneProgress - 0.8) / 0.2
    : progress < 0.04 ? progress / 0.04 : 1

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.6} color="#f5deb3" />
      <directionalLight position={[3, 4, 2]} intensity={1.2} color="#ffd27a" />
      <pointLight position={[0, -1, 2]} intensity={0.5} color="#ff6030" distance={6} />
      <group position={[0.6, 0.1, 0]} rotation={[0, 0, -bottleTilt]}>
        <Bottle opacity={groupOpacity} />
      </group>
      <group position={[-0.5, -0.4, 0]}>
        <WineGlass fillLevel={glassFill} opacity={groupOpacity} />
      </group>
    </group>
  )
}

export default function HeroScene() {
  const { lang } = useLanguage()
  const copy = lang === 'fr' ? COPY_FR : COPY_EN

  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const [scrollState, setScrollState] = useState<ScrollState>({ progress: 0, scene: 0, sceneProgress: 0 })
  const [viewportH, setViewportH] = useState(800)

  const bgY = useTransform(scrollY, [0, viewportH * SCROLL_MULTIPLIER], [0, viewportH * SCROLL_MULTIPLIER * -0.3])
  const cellarOpacity = useTransform(
    scrollY,
    [viewportH * SCROLL_MULTIPLIER * 0.48, viewportH * SCROLL_MULTIPLIER * 0.62],
    [0, 1]
  )

  useEffect(() => {
    setViewportH(window.innerHeight)
    const fn = () => setViewportH(window.innerHeight)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const total = viewportH * SCROLL_MULTIPLIER
    const progress = Math.min(Math.max(latest / total, 0), 1)
    const sceneFloat = progress * SCENE_COUNT
    const scene = Math.min(Math.floor(sceneFloat), SCENE_COUNT - 1)
    setScrollState({ progress, scene, sceneProgress: sceneFloat - scene })
  })

  const currentCopy = copy[scrollState.scene]

  return (
    <div ref={containerRef} style={{ height: SCROLL_MULTIPLIER * 100 + 'vh' }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#1a0a0a]">

        <motion.div className="absolute inset-0" style={{ y: bgY, scale: 1.15, transformOrigin: 'center top' }}>
          <div className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/hero-terrace.jpg')" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a0800]/30 via-transparent to-[#1a0800]/70" />
        </motion.div>

        <motion.div className="absolute inset-0" style={{ opacity: cellarOpacity }}>
          <div className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/hero-cellar.jpg')" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d0500]/40 via-transparent to-[#0d0500]/80" />
        </motion.div>

        <div className="absolute inset-0 pointer-events-none">
          <Canvas
            camera={{ position: [0, 0, 3.5], fov: 45 }}
            gl={{ alpha: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
            style={{ background: 'transparent' }}
          >
            <R3FContent scrollState={scrollState} />
          </Canvas>
        </div>

        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-20 pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={scrollState.scene}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.6 }}
              className="max-w-xl"
            >
              <p className="mb-3 text-xs tracking-[0.35em] uppercase" style={{ color: '#C4963A' }}>
                {currentCopy.eyebrow}
              </p>
              <h1 className="mb-4 leading-none text-white"
                style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2.4rem, 5.5vw, 4.5rem)', fontWeight: 400 }}>
                {currentCopy.title.map((line, i) => <span key={i} className="block">{line}</span>)}
              </h1>
              <p className="mb-8 max-w-sm text-white/70 leading-relaxed" style={{ fontSize: '1rem' }}>
                {currentCopy.sub}
              </p>
              {currentCopy.cta && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }} className="pointer-events-auto">
                  <Link href={currentCopy.cta.href}
                    className="inline-block border border-[#C4963A] px-8 py-3 text-xs tracking-[0.25em] uppercase text-[#C4963A] hover:bg-[#C4963A] hover:text-[#1a0800] transition-all duration-300">
                    {currentCopy.cta.label}
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {scrollState.scene === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
              <span className="text-[10px] tracking-[0.4em] uppercase text-white/50">Scroll to Discover</span>
              <motion.div className="w-px bg-white/30" style={{ height: 40 }}
                animate={{ scaleY: [0, 1, 0], originY: 0 }}
                transition={{ duration: 1.8, repeat: Infinity }} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 pointer-events-none">
          {[0,1,2,3].map(i => (
            <div key={i} className="w-1 rounded-full transition-all duration-500"
              style={{ height: scrollState.scene === i ? 24 : 8,
                background: scrollState.scene === i ? '#C4963A' : 'rgba(255,255,255,0.25)' }} />
          ))}
        </div>

        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(20,5,0,0.55) 100%)' }} />
      </div>
    </div>
  )
}
