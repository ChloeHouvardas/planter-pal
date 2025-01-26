import { useRef } from 'react'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

function MoneyTree() {
  const treeRef = useRef<THREE.Group>(null)

  return (
    <group ref={treeRef}>
      {/* Trunk */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 2]} />
        <meshStandardMaterial color="#5D4037" roughness={0.8} />
      </mesh>

      {/* Money leaves in layers */}
      {[0, 1, 2].map((layer) => (
        <group key={layer} position={[0, 1.5 + layer * 0.8, 0]}>
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i * Math.PI * 2) / 6
            const radius = 0.8 - layer * 0.2
            return (
              <mesh
                key={i}
                position={[
                  Math.sin(angle) * radius,
                  0,
                  Math.cos(angle) * radius
                ]}
                rotation={[Math.PI / 4, angle, 0]}
              >
                <boxGeometry args={[0.5, 0.5, 0.02]} />
                <meshStandardMaterial 
                  color="#4CAF50"
                  metalness={0.3}
                  roughness={0.4}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )
          })}
        </group>
      ))}
    </group>
  )
}

export function MoneyTreeScene() {
  return (
    <group position={[0, -2, 0]}>
      <OrbitControls />
      <MoneyTree />
    </group>
  )
} 