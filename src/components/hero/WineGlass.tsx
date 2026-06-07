'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MotionValue } from 'framer-motion'
import * as THREE from 'three'

interface Props {
  scrollProgress: MotionValue<number>
  mouseX: MotionValue<number>
}

export function WineGlass({ scrollProgress, mouseX }: Props) {
  const groupRef = useRef<THREE.Group>(null)
  const liquidRef = useRef<THREE.Mesh>(null)
  const streamRef = useRef<THREE.Mesh>(null)
  const fillLevel = useRef(0)

  useFrame(() => {
    if (!groupRef.current || !liquidRef.current) return
    const scroll = scrollProgress.get()
    const mx = mouseX.get()

    groupRef.current.rotation.y = mx * 0.05
    groupRef.current.position.x = 1.3 + mx * 0.02

    if (scroll > 0.5 && scroll < 0.85) {
      fillLevel.current = ((scroll - 0.5) / 0.35) * 0.65
    } else if (scroll >= 0.85) {
      fillLevel.current = 0.65
    } else {
      fillLevel.current = Math.max(0, fillLevel.current - 0.005)
    }

    const targetScaleY = Math.max(0.001, fillLevel.current)
    const targetY = -0.8 + fillLevel.current * 1.3
    liquidRef.current.scale.y += (targetScaleY - liquidRef.current.scale.y) * 0.06
    liquidRef.current.position.y += (targetY - liquidRef.current.position.y) * 0.06

    if (streamRef.current) {
      const pouring = scroll > 0.52 && scroll < 0.84
      streamRef.current.visible = pouring
      if (pouring) {
        const t = Math.min(1, (scroll - 0.52) / 0.1)
        streamRef.current.scale.y = t
      }
    }
  })

  return (
    <group ref={groupRef} position={[1.3, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[0.35, 0.15, 1.6, 32, 1, true]} />
        <meshPhysicalMaterial color="#e8f4ff" transparent opacity={0.15}
          roughness={0} transmission={0.95} thickness={0.1} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <torusGeometry args={[0.35, 0.008, 16, 64]} />
        <meshPhysicalMaterial color="#ffffff" roughness={0} transmission={0.9} />
      </mesh>
      <mesh position={[0, -1.2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.8, 16]} />
        <meshPhysicalMaterial color="#e8f4ff" transparent opacity={0.3} transmission={0.95} />
      </mesh>
      <mesh position={[0, -1.65, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.04, 32]} />
        <meshPhysicalMaterial color="#e8f4ff" transparent opacity={0.25} transmission={0.9} />
      </mesh>
      <mesh ref={liquidRef} position={[0, -0.8, 0]}>
        <cylinderGeometry args={[0.32, 0.13, 1.4, 32]} />
        <meshPhysicalMaterial color="#8B1A1A" transparent opacity={0.88}
          roughness={0.1} transmission={0.1} thickness={1} />
      </mesh>
      <mesh ref={streamRef} position={[-0.62, 0.5, 0]} rotation={[0, 0, 0.32]} visible={false}>
        <cylinderGeometry args={[0.014, 0.022, 1.1, 8]} />
        <meshPhysicalMaterial color="#8B1A1A" transparent opacity={0.85} roughness={0.2} />
      </mesh>
    </group>
  )
}
