'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Props {
  fillLevel?: number
  opacity?: number
}

export default function WineGlass({ fillLevel = 0, opacity = 1 }: Props) {
  const liquidRef = useRef<THREE.Mesh>(null)
  const streamRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (!liquidRef.current) return
    const targetScaleY = Math.max(0.001, fillLevel)
    const targetY = -0.8 + fillLevel * 1.3
    liquidRef.current.scale.y += (targetScaleY - liquidRef.current.scale.y) * 0.06
    liquidRef.current.position.y += (targetY - liquidRef.current.position.y) * 0.06
    if (streamRef.current) {
      streamRef.current.visible = fillLevel > 0.05 && fillLevel < 0.63
    }
  })

  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.35, 0.15, 1.6, 32, 1, true]} />
        <meshPhysicalMaterial color="#e8f4ff" transparent opacity={0.15 * opacity}
          roughness={0} transmission={0.95} thickness={0.1} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <torusGeometry args={[0.35, 0.008, 16, 64]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={opacity}
          roughness={0} transmission={0.9} />
      </mesh>
      <mesh position={[0, -1.2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.8, 16]} />
        <meshPhysicalMaterial color="#e8f4ff" transparent opacity={0.3 * opacity} transmission={0.95} />
      </mesh>
      <mesh position={[0, -1.65, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.04, 32]} />
        <meshPhysicalMaterial color="#e8f4ff" transparent opacity={0.25 * opacity} transmission={0.9} />
      </mesh>
      <mesh ref={liquidRef} position={[0, -0.8, 0]}>
        <cylinderGeometry args={[0.32, 0.13, 1.4, 32]} />
        <meshPhysicalMaterial color="#8B1A1A" transparent opacity={0.88 * opacity}
          roughness={0.1} transmission={0.1} thickness={1} />
      </mesh>
      <mesh ref={streamRef} position={[-0.3, 0.5, 0]} rotation={[0, 0, 0.3]} visible={false}>
        <cylinderGeometry args={[0.014, 0.022, 1.0, 8]} />
        <meshPhysicalMaterial color="#8B1A1A" transparent opacity={0.85 * opacity} roughness={0.2} />
      </mesh>
    </group>
  )
}
