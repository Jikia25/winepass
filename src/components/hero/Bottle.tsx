'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MotionValue } from 'framer-motion'
import * as THREE from 'three'

interface Props {
  scrollProgress: MotionValue<number>
  mouseX: MotionValue<number>
  mouseY: MotionValue<number>
}

export function Bottle({ scrollProgress, mouseX, mouseY }: Props) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (!groupRef.current) return
    const scroll = scrollProgress.get()
    const mx = mouseX.get()

    const targetRotY = mx * (3 * Math.PI / 180)
    groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.05

    let tilt = 0
    let rotY = 0

    if (scroll > 0.2 && scroll < 0.5) {
      rotY = ((scroll - 0.2) / 0.3) * (Math.PI * 0.35)
    }
    if (scroll > 0.5 && scroll < 0.85) {
      tilt = ((scroll - 0.5) / 0.35) * (Math.PI * 0.45)
    } else if (scroll >= 0.85) {
      tilt = ((1 - (scroll - 0.85) / 0.15)) * (Math.PI * 0.15)
    }

    groupRef.current.rotation.z += (-tilt * 0.65 - groupRef.current.rotation.z) * 0.04
    groupRef.current.rotation.y += (rotY - groupRef.current.rotation.y) * 0.025
  })

  return (
    <group ref={groupRef} position={[-1.2, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[0.18, 0.22, 2.2, 32]} />
        <meshPhysicalMaterial color="#1a3a1a" transparent opacity={0.88}
          roughness={0.05} metalness={0.1} transmission={0.25} thickness={0.5} />
      </mesh>
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.06, 0.18, 0.6, 32]} />
        <meshPhysicalMaterial color="#1a3a1a" roughness={0.05} transmission={0.25} thickness={0.3} />
      </mesh>
      <mesh position={[0, 1.65, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.12, 16]} />
        <meshStandardMaterial color="#d4a96a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.58, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.08, 16]} />
        <meshStandardMaterial color="#C4963A" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.165, 0.205, 1.6, 32]} />
        <meshPhysicalMaterial color="#8B1A1A" transparent opacity={0.9} roughness={0.1} />
      </mesh>
    </group>
  )
}
