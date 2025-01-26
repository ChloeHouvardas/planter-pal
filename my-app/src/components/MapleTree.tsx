import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

interface BranchProps {
  startPoint: [number, number, number]
  angle: number
  scale?: number
  time: number
}

interface MapleTreeProps {
  isStatic?: boolean
  staticColor?: string
}

function getRainbowColor(offset: number, time: number): string {
  const hue = (time + offset) % 1
  return `hsl(${hue * 360}, 70%, 50%)`
}

function Branch({ startPoint, angle, scale = 1, time }: BranchProps) {
  // Calculate end point for branch orientation
  const branchLength = 0.8
  const branchAngle = Math.PI / 4 // 45 degrees upward
  const endPoint = [
    startPoint[0] + Math.sin(angle) * branchLength * Math.cos(branchAngle),
    startPoint[1] + branchLength * Math.sin(branchAngle),
    startPoint[2] + Math.cos(angle) * branchLength * Math.cos(branchAngle)
  ]

  // Calculate rotation to point from start to end
  const direction = new THREE.Vector3(
    endPoint[0] - startPoint[0],
    endPoint[1] - startPoint[1],
    endPoint[2] - startPoint[2]
  ).normalize()

  const quaternion = new THREE.Quaternion()
  const up = new THREE.Vector3(0, 1, 0)
  const axis = new THREE.Vector3().crossVectors(up, direction).normalize()
  const angle2 = Math.acos(up.dot(direction))
  quaternion.setFromAxisAngle(axis, angle2)
  const euler = new THREE.Euler().setFromQuaternion(quaternion)

  return (
    <group position={startPoint} rotation={[euler.x, angle, euler.z]} scale={[scale, scale, scale]}>
      {/* Branch */}
      <mesh>
        <cylinderGeometry args={[0.03, 0.05, branchLength]} />
        <meshStandardMaterial color="#4A3728" roughness={0.8} />
      </mesh>
      
      {/* Leaves cluster at the end of branch */}
      <group position={[0, branchLength * 0.5, 0]}>
        {Array.from({ length: 8 }).map((_, i) => {
          const leafAngle = (i * Math.PI * 2) / 8
          // Add offset based on leaf position in cluster
          const colorOffset = i / 8
          return (
            <group key={i} rotation={[0, leafAngle, 0]}>
              <mesh rotation={[Math.PI / 4, 0, 0]} position={[0, 0, 0.2]}>
                <planeGeometry args={[0.3, 0.3]} />
                <meshStandardMaterial 
                  color={getRainbowColor(colorOffset, time)}
                  side={THREE.DoubleSide}
                  transparent
                  opacity={0.9}
                />
              </mesh>
            </group>
          )
        })}
      </group>
    </group>
  )
}

export function MapleTree({ isStatic = false, staticColor = "#e74c3c" }: MapleTreeProps) {
  const treeRef = useRef<THREE.Group>(null)
  const [time, setTime] = useState(0)
  const trunkRadius = 0.15
  const trunkHeight = 3

  // Animation loop only if not static
  useFrame((state, delta) => {
    if (!isStatic) {
      setTime(prev => (prev + delta * 0.1) % 1)
    }
  })

  // Modify the Branch component to use either rainbow or static color
  function getLeafColor(offset: number): string {
    return isStatic ? staticColor : getRainbowColor(offset, time)
  }

  return (
    <group ref={treeRef} position={[0, -2, 0]}>
      <OrbitControls />
      
      {/* Trunk */}
      <mesh position={[0, trunkHeight/2, 0]}>
        <cylinderGeometry args={[trunkRadius, trunkRadius * 1.2, trunkHeight]} />
        <meshStandardMaterial color="#3E2723" roughness={0.8} />
      </mesh>

      {/* Bottom layer branches */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * Math.PI * 2) / 8
        return (
          <Branch
            key={`bottom-${i}`}
            startPoint={[
              Math.sin(angle) * trunkRadius,
              1.2,
              Math.cos(angle) * trunkRadius
            ]}
            angle={angle}
            scale={1}
            time={time}
          />
        )
      })}

      {/* Middle layer branches */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = ((i + 0.5) * Math.PI * 2) / 6
        return (
          <Branch
            key={`middle-${i}`}
            startPoint={[
              Math.sin(angle) * trunkRadius,
              2.0,
              Math.cos(angle) * trunkRadius
            ]}
            angle={angle}
            scale={0.9}
            time={time}
          />
        )
      })}

      {/* Top layer branches */}
      {Array.from({ length: 4 }).map((_, i) => {
        const angle = ((i + 0.25) * Math.PI * 2) / 4
        return (
          <Branch
            key={`top-${i}`}
            startPoint={[
              Math.sin(angle) * trunkRadius,
              2.8,
              Math.cos(angle) * trunkRadius
            ]}
            angle={angle}
            scale={0.8}
            time={time}
          />
        )
      })}

      {/* Top branch */}
      <Branch
        startPoint={[0, 3.2, 0]}
        angle={0}
        scale={0.7}
        time={time}
      />
    </group>
  )
}