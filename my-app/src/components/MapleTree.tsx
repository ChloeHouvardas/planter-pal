import { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function MapleTree() {
  const treeRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF('/maple_2.glb')

  useFrame((state, delta) => {
    if (treeRef.current) {
      // Rotate tree slowly
      treeRef.current.rotation.y += delta * 0.2
    }
  })

  return (
    <group ref={treeRef}>
      <primitive 
        object={scene} 
        scale={[0.1, 0.1, 0.1]}  // Reduced from 0.5 to 0.1
        position={[0, 0, 0]}     // Adjust these numbers if needed
      />
    </group>
  )
}

// Pre-load the model
useGLTF.preload('/maple_2.glb')