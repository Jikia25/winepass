'use client'
import { useRef, useEffect } from 'react'
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { Bottle } from './Bottle'
import { WineGlass } from './WineGlass'

export function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 })
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 })
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] })

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 2)
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 2)
    }
    window.addEventListener('mousemove', fn)
    return () => window.removeEventListener('mousemove', fn)
  }, [])

  const bgX = useTransform(smoothX, [-1, 1], ['-15px', '15px'])
  const bgY = useTransform(smoothY, [-1, 1], ['-10px', '10px'])
  const scene1Opacity = useTransform(scrollYProgress, [0, 0.15], [1, 0])
  const scene2Opacity = useTransform(scrollYProgress, [0.2, 0.32, 0.45, 0.55], [0, 1, 1, 0])
  const scene3Opacity = useTransform(scrollYProgress, [0.5, 0.62, 0.75, 0.82], [0, 1, 1, 0])
  const scene4Opacity = useTransform(scrollYProgress, [0.82, 0.95], [0, 1])

  return (
    <div ref={containerRef} style={{ height: '500vh' }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#0d0500]">

        <motion.div className="absolute inset-0 scale-110" style={{ x: bgX, y: bgY }}>
          <div className="w-full h-full" style={{
            background: 'linear-gradient(180deg, #0d0500 0%, #3d1500 40%, #1a0800 100%)'
          }} />
          <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 400" preserveAspectRatio="xMidYMax slice">
            <defs>
              <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1a0500" />
                <stop offset="100%" stopColor="#3d1500" />
              </linearGradient>
            </defs>
            <path d="M0,400 L0,280 L80,280 L80,200 L100,160 L120,200 L120,280 L300,280 L300,240 L340,200 L380,220 L420,240 L580,240 L580,260 L720,260 L860,260 L860,240 L900,200 L940,180 L980,200 L1020,240 L1180,240 L1180,280 L1440,280 L1440,400 Z"
              fill="rgba(8,2,0,0.92)" />
            {[210,250,290,900,940,980].map((x,i) => (
              <rect key={i} x={x} y={215} width={11} height={16} fill="rgba(196,150,58,0.3)" rx="1" />
            ))}
          </svg>
        </motion.div>

        <div className="absolute inset-0">
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }} gl={{ alpha: true, antialias: true }}>
            <ambientLight intensity={0.3} color="#C4963A" />
            <directionalLight position={[5, 5, 5]} intensity={1.5} color="#FFD580" />
            <pointLight position={[-3, 2, 3]} intensity={0.8} color="#C4963A" />
            <pointLight position={[3, -2, 2]} intensity={0.4} color="#8B1A1A" />
            <Bottle scrollProgress={scrollYProgress} mouseX={smoothX} mouseY={smoothY} />
            <WineGlass scrollProgress={scrollYProgress} mouseX={smoothX} />
          </Canvas>
        </div>

        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.75) 100%)'
        }} />

        <motion.div style={{ opacity: scene1Opacity }}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}
            className="text-[#C4963A] text-[10px] tracking-[0.8em] uppercase mb-6">
            Bordeaux · France
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="text-white text-center font-serif italic"
            style={{ fontSize: 'clamp(32px, 5.5vw, 68px)', lineHeight: 1.2 }}>
            Your Perfect<br />Wine Day
          </motion.h1>
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, delay: 1.2 }}
            className="w-16 h-px bg-[#C4963A] mt-6 mb-5" />
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
            transition={{ duration: 1.5, delay: 1.8 }}
            className="text-[#EDE4CF] text-[11px] italic tracking-[0.2em]">
            Scroll to experience Bordeaux
          </motion.p>
        </motion.div>

        <motion.div style={{ opacity: scene2Opacity }}
          className="absolute inset-0 flex flex-col justify-center pointer-events-none pl-[8vw]">
          <div className="flex flex-col gap-5">
            {['7,375 châteaux across 6 appellations', 'Transport included in every pass',
              'Free cancellation up to 48 hours', 'Trusted by 4.3M visitors'].map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-1 h-1 rounded-full bg-[#C4963A]" />
                <span className="text-[#EDE4CF] font-serif italic text-[14px] tracking-wide">{text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div style={{ opacity: scene3Opacity }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-[#C4963A] font-serif italic text-[20px] tracking-widest text-center"
            style={{ textShadow: '0 0 40px rgba(196,150,58,0.4)' }}>
            Pour yourself<br />into the moment
          </p>
        </motion.div>

        <motion.div style={{ opacity: scene4Opacity }}
          className="absolute inset-0 flex flex-col items-center justify-end pb-[12vh]">
          <p className="text-[#EDE4CF] font-serif italic text-[16px] tracking-[0.15em] mb-6 text-center">
            This is your moment.
          </p>
          <a href="/build"
            className="border border-[#C4963A] text-[#C4963A] font-serif italic px-8 py-3 text-[13px] tracking-[0.25em] hover:bg-[#C4963A] hover:text-[#3D0F0F] transition-all duration-500">
            Build My Wine Day →
          </a>
        </motion.div>

      </div>
    </div>
  )
}
