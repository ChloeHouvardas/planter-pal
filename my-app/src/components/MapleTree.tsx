import { useRef } from 'react'
import { useGLTF, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

export function MapleTree() {
  const treeRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF('/maple_2.glb')

  return (
    <group ref={treeRef}>
      <OrbitControls />
      <primitive 
        object={scene} 
        scale={[0.1, 0.1, 0.1]}
        position={[0, 0, 0]}
      />
    </group>
  )
}

// Pre-load the model
useGLTF.preload('/maple_2.glb')