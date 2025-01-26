import { Canvas } from '@react-three/fiber'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function CuteTree() {
  const treeRef = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (treeRef.current) {
      treeRef.current.rotation.y += delta * 2
    }
  })

  return (
    <group ref={treeRef}>
      {/* Tree trunk */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 1.5]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Tree top */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>

      {/* Smiling face */}
      <group position={[0, 1.5, 0.8]}>
        {/* Left eye */}
        <mesh position={[-0.3, 0.1, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#000000" />
        </mesh>

        {/* Right eye */}
        <mesh position={[0.3, 0.1, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#000000" />
        </mesh>

        {/* Smile */}
        <mesh position={[0, -0.2, 0]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.3, 0.05, 16, 32, Math.PI]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
      </group>
    </group>
  )
}

export function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-container">
        <div className="tree-container-loading">
          <Canvas camera={{ position: [0, 0, 5] }}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <CuteTree />
          </Canvas>
        </div>
        <div className="loading-text">Loading...</div>
      </div>
    </div>
  )
} 