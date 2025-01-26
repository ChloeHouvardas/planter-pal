import { useState, useEffect } from 'react'
import { ScatterPlot } from './components/ScatterPlot'
import { MapleTree } from './components/MapleTree'
import { Canvas } from '@react-three/fiber'
import './App.css'

interface Coordinates {
  X: number
  Y: number
  Z: number
}

function App() {
  const [coordinates, setCoordinates] = useState<Coordinates[]>([])

  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        const response = await fetch('http://localhost:5000/coordinates')
        const data = await response.json()
        setCoordinates(data)
      } catch (error) {
        console.error('Error fetching coordinates:', error)
      }
    }

    fetchCoordinates()
    const interval = setInterval(fetchCoordinates, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="app">
      <h1>🌲 Forest Path Tracker 🌲</h1>
      <div className="content-wrapper">
        <div className="plot-container">
          <ScatterPlot coordinates={coordinates} />
        </div>
        <div className="tree-container">
          <Canvas camera={{ position: [5, 5, 5] }}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <MapleTree />
          </Canvas>
        </div>
      </div>
      <div className="coordinates">
        <h3>🍃 Current Position</h3>
        {coordinates.length > 0 && (
          <div>
            X: {coordinates[coordinates.length-1].X.toFixed(2)}, 
            Y: {coordinates[coordinates.length-1].Y.toFixed(2)}, 
            Z: {coordinates[coordinates.length-1].Z.toFixed(2)}
          </div>
        )}
      </div>
    </div>
  )
}

export default App