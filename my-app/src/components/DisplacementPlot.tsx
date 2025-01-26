import { Scatter } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js'

ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
)

interface Coordinates {
  X: number
  Y: number
  Z: number
}

interface DisplacementPlotProps {
  coordinates: Coordinates[]
}

function calculateDisplacement(accelerations: Coordinates[]): Coordinates[] {
  // Time step (assuming constant sampling rate of 10Hz)
  const dt = 0.1
  
  // Apply a simple moving average filter to reduce noise
  const windowSize = 5
  const smoothedAccel = accelerations.map((_, index) => {
    const window = accelerations.slice(
      Math.max(0, index - windowSize),
      Math.min(accelerations.length, index + windowSize + 1)
    )
    return {
      X: window.reduce((sum, val) => sum + val.X, 0) / window.length,
      Y: window.reduce((sum, val) => sum + val.Y, 0) / window.length,
      Z: window.reduce((sum, val) => sum + val.Z, 0) / window.length,
    }
  })

  // Remove gravity component (assuming Z is vertical)
  const gravity = 9.81
  smoothedAccel.forEach(accel => {
    accel.Z -= gravity
  })

  // Double integration using trapezoidal rule
  const velocities: Coordinates[] = [{ X: 0, Y: 0, Z: 0 }]
  const positions: Coordinates[] = [{ X: 0, Y: 0, Z: 0 }]

  // First integration: acceleration to velocity
  for (let i = 1; i < smoothedAccel.length; i++) {
    velocities.push({
      X: velocities[i-1].X + (smoothedAccel[i].X + smoothedAccel[i-1].X) * dt / 2,
      Y: velocities[i-1].Y + (smoothedAccel[i].Y + smoothedAccel[i-1].Y) * dt / 2,
      Z: velocities[i-1].Z + (smoothedAccel[i].Z + smoothedAccel[i-1].Z) * dt / 2,
    })
  }

  // Apply drift correction to velocities
  const driftCorrection = {
    X: velocities[velocities.length - 1].X / velocities.length,
    Y: velocities[velocities.length - 1].Y / velocities.length,
    Z: velocities[velocities.length - 1].Z / velocities.length,
  }
  
  const correctedVelocities = velocities.map(v => ({
    X: v.X - driftCorrection.X,
    Y: v.Y - driftCorrection.Y,
    Z: v.Z - driftCorrection.Z,
  }))

  // Second integration: velocity to position
  for (let i = 1; i < correctedVelocities.length; i++) {
    positions.push({
      X: positions[i-1].X + (correctedVelocities[i].X + correctedVelocities[i-1].X) * dt / 2,
      Y: positions[i-1].Y + (correctedVelocities[i].Y + correctedVelocities[i-1].Y) * dt / 2,
      Z: positions[i-1].Z + (correctedVelocities[i].Z + correctedVelocities[i-1].Z) * dt / 2,
    })
  }

  return positions
}

export function DisplacementPlot({ coordinates }: DisplacementPlotProps) {
  const displacements = calculateDisplacement(coordinates)

  const data = {
    datasets: [
      {
        label: 'Movement Path',
        data: displacements.map(coord => ({ x: coord.X, y: coord.Z })), // Using X and Z for top-down view
        backgroundColor: '#E8F3E8',
        borderColor: '#66A182',
        pointRadius: 3,
        pointHoverRadius: 5,
        showLine: true, // This will connect the points
        fill: false,
        borderWidth: 2,
        tension: 0, // Remove curve to show actual path
      }
    ]
  }

  const options: ChartOptions<'scatter'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          color: 'rgba(232, 243, 232, 0.1)',
        },
        ticks: {
          color: '#E8F3E8',
        },
        title: {
          display: true,
          text: 'Left/Right',
          color: '#E8F3E8',
          font: {
            size: 14,
          },
        },
        min: -5,
        max: 5,
      },
      y: {
        grid: {
          color: 'rgba(232, 243, 232, 0.1)',
        },
        ticks: {
          color: '#E8F3E8',
        },
        title: {
          display: true,
          text: 'Forward/Backward',
          color: '#E8F3E8',
          font: {
            size: 14,
          },
        },
        min: -5,
        max: 5,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(47, 72, 88, 0.9)',
        titleColor: '#E8F3E8',
        bodyColor: '#E8F3E8',
        borderColor: '#66A182',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (context) => {
            const point = context.raw as { x: number; y: number }
            return `Position: (${point.x.toFixed(2)}, ${point.y.toFixed(2)})`
          },
        },
      },
    },
    animation: {
      duration: 0
    }
  }

  return (
    <div style={{ width: '100%', height: '100%', padding: '1rem' }}>
      <Scatter data={data} options={options} />
    </div>
  )
} 