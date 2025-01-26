import { useRef } from 'react'
import * as THREE from 'three'

export function Notebook() {
  const notebookRef = useRef<THREE.Group>(null)

  return (
    <group ref={notebookRef}>
      {/* Book cover - make it bigger */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[4, 5, 0.3]} />
        <meshStandardMaterial color="#8B4513" roughness={0.7} />
      </mesh>

      {/* Pages - adjust size to match cover */}
      <mesh position={[0, 0, 0.15]}>
        <boxGeometry args={[3.8, 4.8, 0.1]} />
        <meshStandardMaterial color="#F5F5DC" roughness={0.3} />
      </mesh>

      {/* Spine details - adjust position and size */}
      <mesh position={[-1.9, 0, 0]}>
        <boxGeometry args={[0.2, 5, 0.3]} />
        <meshStandardMaterial color="#654321" roughness={0.7} />
      </mesh>
    </group>
  )
} 