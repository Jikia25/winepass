'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Props {
  opacity?: number
}

export default function Bottle({ opacity = 1 }: Props) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.02
  })

  return (
    <group ref={groupRef}>
      <mesh>
        <cylinderGeometry args={[0.18, 0.22, 2.2, 32]} />
        <meshPhysicalMaterial color="#1a3a1a" transparent opacity={0.88 * opacity}
          roughness={0.05} metalness={0.1} transmission={0.25} thickness={0.5} />
      </mesh>
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.06, 0.18, 0.6, 32]} />
        <meshPhysicalMaterial color="#1a3a1a" transparent opacity={0.88 * opacity}
          roughness={0.05} transmission={0.25} />
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
        <meshPhysicalMaterial color="#8B1A1A" transparent opacity={0.9 * opacity} roughness={0.1} />
      </mesh>
    </group>
  )
}
