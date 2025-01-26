import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

interface Coordinates {
  X: number
  Y: number
  Z: number
}

interface ScatterPlotProps {
  coordinates: Coordinates[]
}

interface PointsProps {
  points: Coordinates[]
}

function Points({ points }: PointsProps) {
  return (
    <>
      {points.map((point, index) => {
        let color: string
        const positionFromEnd = points.length - 1 - index

        if (positionFromEnd === 0) {
          color = '#4caf50'  // Leaf green for latest point
        } else if (positionFromEnd > 0 && positionFromEnd <= 4) {
          color = '#81c784'  // Light green for recent points
        } else {
          color = '#2e7d32'  // Dark green for older points
        }

        return (
          <mesh key={index} position={[point.X, point.Y, point.Z]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshBasicMaterial color={color} />
          </mesh>
        )
      })}
    </>
  )
}

export const ScatterPlot: React.FC<ScatterPlotProps> = ({ coordinates }) => {
  return (
    <div style={{ width: '100%', height: '500px' }}>
      <Canvas camera={{ position: [20, 20, 20] }}>
        <OrbitControls />
        <ambientLight intensity={0.7} />
        <Points points={coordinates} />
        <axesHelper args={[20]} />
        <fog attach="fog" args={['#2c4a1d', 30, 40]} />
      </Canvas>
    </div>
  )
} 