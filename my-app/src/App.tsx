import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom'
import { ScatterPlot } from './components/ScatterPlot'
import { MapleTree } from './components/MapleTree'
import { Canvas } from '@react-three/fiber'
import { LoadingScreen } from './components/LoadingScreen'
import { MoneyTreeScene } from './components/MoneyTree'
import { Notebook } from './components/Notebook'
import { DisplacementPlot } from './components/DisplacementPlot'
import './App.css'

interface Coordinates {
  X: number
  Y: number
  Z: number
}

interface PlantingRecord {
  id: number
  timestamp: string
  coordinates: Coordinates[]
  rainbowColor: string
}

function MainPage() {
  const [coordinates, setCoordinates] = useState<Coordinates[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Only clear finalCoordinates, not the planting history
    localStorage.removeItem('finalCoordinates')
    
    // Clear server-side coordinates
    fetch('http://localhost:5000/clear', {
      method: 'POST',
    }).then(() => {
      // After clearing, start fetching new coordinates
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
    })
  }, [])

  const handleDone = () => {
    setIsLoading(true)
    localStorage.setItem('finalCoordinates', JSON.stringify(coordinates))
    setTimeout(() => {
      setIsLoading(false)
      navigate('/results')
    }, 3000)
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="app">
      <div className="logo-container">
        <h1 className="logo-text">
          <span className="logo-text-arbo">Arbo</span>
          <span className="logo-text-route">Route</span>
        </h1>
      </div>
      <div className="content-wrapper">
        <div className="plot-container">
          <ScatterPlot coordinates={coordinates} />
        </div>
        <div className="tree-container">
          <Canvas camera={{ position: [2, 2, 2] }}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <MapleTree />
          </Canvas>
        </div>
      </div>
      <div className="coordinates">
        <h3>Current Acceleration</h3>
        {coordinates.length > 0 && (
          <div>
            X: {coordinates[coordinates.length-1].X.toFixed(3)} | 
            Y: {coordinates[coordinates.length-1].Y.toFixed(3)} | 
            Z: {coordinates[coordinates.length-1].Z.toFixed(3)}
          </div>
        )}
      </div>
      <div className="button-group">
        <button className="done-button" onClick={handleDone}>
          I'm Done!
        </button>
        <button className="legacy-button" onClick={() => navigate('/legacy')}>
          Tree Legacy
        </button>
        <button className="story-button" onClick={() => navigate('/story')}>
          Story Tree
        </button>
      </div>
    </div>
  )
}

function ResultsPage() {
  const navigate = useNavigate()
  const [finalCoordinates, setFinalCoordinates] = useState<Coordinates[]>([])

  useEffect(() => {
    const storedCoordinates = localStorage.getItem('finalCoordinates')
    if (storedCoordinates) {
      setFinalCoordinates(JSON.parse(storedCoordinates))
      
      // Save this planting to history while preserving existing entries
      const existingHistory = JSON.parse(localStorage.getItem('plantingHistory') || '[]')
      // Only add new record if there are coordinates
      if (JSON.parse(storedCoordinates).length > 0) {
        const newRecord: PlantingRecord = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          coordinates: JSON.parse(storedCoordinates),
          rainbowColor: "#e74c3c"
        }
        // Preserve any default entries by checking if they exist
        const updatedHistory = existingHistory.length === 0 ? 
          [
            {
              id: 1,
              timestamp: new Date("2024-01-26T10:00:00").toISOString(),
              coordinates: generateSquarePath(),
              rainbowColor: "#4CAF50"
            },
            {
              id: 2,
              timestamp: new Date("2024-01-26T15:30:00").toISOString(),
              coordinates: generateOverlappingPath(),
              rainbowColor: "#2196F3"
            },
            newRecord
          ] :
          [...existingHistory, newRecord]
        
        localStorage.setItem('plantingHistory', JSON.stringify(updatedHistory))
      }
    }
  }, [])

  return (
    <div className="app results-page">
      <h1>Planting Results</h1>
      <div className="results-grid">
        <div className="result-card">
          <h2>Your Acceleration Path</h2>
          <div className="final-plot">
            <ScatterPlot coordinates={finalCoordinates} />
          </div>
        </div>
        <div className="result-card">
          <h2>Your Movement Path</h2>
          <div className="final-plot">
            <DisplacementPlot coordinates={finalCoordinates} />
          </div>
        </div>
        <div className="result-card">
          <h2>Rainbow Tree</h2>
          <div className="tree-view">
            <Canvas camera={{ position: [2, 2, 2] }}>
              <ambientLight intensity={0.7} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              <MapleTree isStatic={true} staticColor="#e74c3c" />
            </Canvas>
          </div>
        </div>
        <div className="result-card">
          <h2>Money Tree</h2>
          <div className="tree-view">
            <Canvas camera={{ position: [2, 2, 2] }}>
              <ambientLight intensity={0.7} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              <MoneyTreeScene />
            </Canvas>
          </div>
        </div>
      </div>
      <div className="button-group">
        <button className="new-plant-button" onClick={() => navigate('/')}>
          Start a New Plant!
        </button>
        <button className="legacy-button" onClick={() => navigate('/legacy')}>
          Tree Legacy
        </button>
        <button className="story-button" onClick={() => navigate('/story')}>
          Story Tree
        </button>
      </div>
    </div>
  )
}

function TreeLegacyPage() {
  const navigate = useNavigate()
  const [plantingHistory, setPlantingHistory] = useState<PlantingRecord[]>([])
  
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('plantingHistory') || '[]')
    
    // If no history exists, add default entries
    if (history.length === 0) {
      const defaultEntries: PlantingRecord[] = [
        {
          id: 1,
          timestamp: new Date("2024-01-26T10:00:00").toISOString(),  // Today at 10 AM
          coordinates: generateSquarePath(),
          rainbowColor: "#4CAF50"
        },
        {
          id: 2,
          timestamp: new Date("2024-01-26T15:30:00").toISOString(),  // Today at 3:30 PM
          coordinates: generateOverlappingPath(),
          rainbowColor: "#2196F3"
        }
      ]
      localStorage.setItem('plantingHistory', JSON.stringify(defaultEntries))
      setPlantingHistory(defaultEntries)
    } else {
      setPlantingHistory(history)
    }
  }, [])

  // Generate a messy zigzag path with lots of points
  function generateSquarePath(): Coordinates[] {
    const path: Coordinates[] = []
    const steps = 500  // More points for denser visualization

    // Create a zigzag pattern with random variations
    for (let i = 0; i < steps; i++) {
      const noise = Math.random() * 0.03  // Increased noise
      const verticalNoise = Math.random() * 0.02 - 0.01  // Random up/down movement
      const direction = Math.floor(i / 50) % 2 === 0 ? 1 : -1  // Change direction every 50 points
      
      path.push({
        X: (i * 0.1 + noise) * direction,
        Y: verticalNoise + Math.sin(i * 0.3) * 0.02,
        Z: (i * 0.08 + noise) * (direction * -1)  // Opposite direction for Z
      })

      // Add extra random points around the main path
      if (Math.random() > 0.7) {  // 30% chance of extra points
        const scatter = 0.05
        path.push({
          X: (i * 0.1 + Math.random() * scatter - scatter/2) * direction,
          Y: verticalNoise + Math.random() * 0.02 - 0.01,
          Z: (i * 0.08 + Math.random() * scatter - scatter/2) * (direction * -1)
        })
      }
    }

    return path
  }

  // Generate a chaotic circular path with clusters
  function generateOverlappingPath(): Coordinates[] {
    const path: Coordinates[] = []
    const steps = 600  // More points
    const scale = 0.15  // Larger scale

    // Create main spiral pattern
    for (let i = 0; i < steps; i++) {
      const t = (i / steps) * Math.PI * 8
      const radius = scale * (1 + Math.sin(t * 0.5) * 0.3)  // Varying radius
      const noise = Math.random() * 0.02 - 0.01
      
      path.push({
        X: Math.sin(t) * radius + noise,
        Y: (Math.sin(t * 2) * 0.02) + noise,  // More vertical variation
        Z: Math.cos(t) * radius + noise
      })

      // Add clusters of points randomly
      if (Math.random() > 0.8) {  // 20% chance of clusters
        const clusterSize = Math.floor(Math.random() * 5) + 3
        for (let j = 0; j < clusterSize; j++) {
          const clusterNoise = 0.03
          path.push({
            X: Math.sin(t) * radius + (Math.random() * clusterNoise - clusterNoise/2),
            Y: (Math.sin(t * 2) * 0.02) + (Math.random() * clusterNoise - clusterNoise/2),
            Z: Math.cos(t) * radius + (Math.random() * clusterNoise - clusterNoise/2)
          })
        }
      }
    }

    return path
  }

  const handleDelete = (id: number) => {
    // Filter out the deleted record
    const newHistory = plantingHistory.filter(record => record.id !== id)
    // Update local storage
    localStorage.setItem('plantingHistory', JSON.stringify(newHistory))
    // Update state
    setPlantingHistory(newHistory)
  }
  
  return (
    <div className="app legacy-page">
      <h1>Your Tree Legacy</h1>
      <div className="legacy-grid">
        {plantingHistory.map((record) => (
          <div key={record.id} className="legacy-card">
            <div className="legacy-card-header">
              <div className="legacy-timestamp">
                {new Date(record.timestamp).toLocaleDateString()}
              </div>
              <button 
                className="delete-button"
                onClick={() => handleDelete(record.id)}
                aria-label="Delete plant"
              >
                ×
              </button>
            </div>
            <div className="legacy-map">
              <div className="final-plot">
                <ScatterPlot coordinates={record.coordinates} />
              </div>
              <div className="final-plot">
                <DisplacementPlot coordinates={record.coordinates} />
              </div>
            </div>
            <div className="legacy-trees">
              <div className="mini-tree-view">
                <Canvas camera={{ position: [2, 2, 2] }}>
                  <ambientLight intensity={0.7} />
                  <directionalLight position={[10, 10, 5]} intensity={1} />
                  <MapleTree isStatic={true} staticColor={record.rainbowColor} />
                </Canvas>
              </div>
              <div className="mini-tree-view">
                <Canvas camera={{ position: [2, 2, 2] }}>
                  <ambientLight intensity={0.7} />
                  <directionalLight position={[10, 10, 5]} intensity={1} />
                  <MoneyTreeScene />
                </Canvas>
              </div>
            </div>
          </div>
        ))}
        {plantingHistory.length === 0 && (
          <div className="no-plants-message">
            No plants yet! Go plant some trees.
          </div>
        )}
      </div>
      <div className="button-group">
        <button className="new-plant-button" onClick={() => navigate('/')}>
          Start a New Plant!
        </button>
        <button className="back-button" onClick={() => navigate('/results')}>
          Back to Results
        </button>
        <button className="story-button" onClick={() => navigate('/story')}>
          Story Tree
        </button>
      </div>
    </div>
  )
}

function StoryTreePage() {
  const navigate = useNavigate()

  return (
    <div className="app story-page">
      <h1>Story Tree</h1>
      <div className="notebook-wrapper">
        <div className="notebook-container">
          <Canvas camera={{ position: [0, 0, 4] }}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <Notebook />
          </Canvas>
        </div>
      </div>
      <div className="button-group">
        <button className="new-plant-button" onClick={() => navigate('/')}>
          Start a New Plant!
        </button>
        <button className="legacy-button" onClick={() => navigate('/legacy')}>
          Tree Legacy
        </button>
        <button className="back-button" onClick={() => navigate('/results')}>
          Back to Results
        </button>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/legacy" element={<TreeLegacyPage />} />
        <Route path="/story" element={<StoryTreePage />} />
      </Routes>
    </Router>
  )
}

export default App