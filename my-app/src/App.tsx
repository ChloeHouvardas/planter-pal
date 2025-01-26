import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom'
import { ScatterPlot } from './components/ScatterPlot'
import { MapleTree } from './components/MapleTree'
import { Canvas } from '@react-three/fiber'
import { LoadingScreen } from './components/LoadingScreen'
import { MoneyTreeScene } from './components/MoneyTree'
import { Notebook } from './components/Notebook'
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
    // Clear stored coordinates and server-side coordinates
    localStorage.removeItem('finalCoordinates')
    localStorage.removeItem('plantingHistory')
    
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
        <h1 className="logo-text">CANOPY</h1>
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
        <h3>Current Position</h3>
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
      
      // Save this planting to history
      const existingHistory = JSON.parse(localStorage.getItem('plantingHistory') || '[]')
      const newRecord: PlantingRecord = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        coordinates: JSON.parse(storedCoordinates),
        rainbowColor: "#e74c3c" // You could randomize this if you want
      }
      localStorage.setItem('plantingHistory', JSON.stringify([...existingHistory, newRecord]))
    }
  }, [])

  return (
    <div className="app results-page">
      <h1>Planting Results</h1>
      <div className="results-grid">
        <div className="result-card">
          <h2>Your Path Map</h2>
          <div className="final-plot">
            <ScatterPlot coordinates={finalCoordinates} />
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
    setPlantingHistory(history)
  }, [])

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