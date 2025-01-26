import { useRef, useEffect } from 'react'

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
  const svgRef = useRef<SVGSVGElement>(null)
  const displacements = calculateDisplacement(coordinates)

  useEffect(() => {
    if (!svgRef.current) return

    // Scale points to fit SVG viewport
    const padding = 40
    const width = svgRef.current.clientWidth - padding * 2
    const height = svgRef.current.clientHeight - padding * 2

    // Find min/max values
    const xValues = displacements.map(p => p.X)
    const zValues = displacements.map(p => p.Z)
    const xMin = Math.min(...xValues)
    const xMax = Math.max(...xValues)
    const zMin = Math.min(...zValues)
    const zMax = Math.max(...zValues)

    // Scale factors
    const xScale = width / (xMax - xMin || 1)
    const zScale = height / (zMax - zMin || 1)

    // Create path string
    const pathData = displacements.map((point, i) => {
      const x = (point.X - xMin) * xScale + padding
      const y = (point.Z - zMin) * zScale + padding
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')

    // Update SVG elements
    const svg = svgRef.current
    svg.innerHTML = `
      <g class="grid">
        ${Array.from({ length: 11 }, (_, i) => {
          const x = padding + (width * i) / 10
          const y = padding + (height * i) / 10
          return `
            <line x1="${x}" y1="${padding}" x2="${x}" y2="${height + padding}" 
                  stroke="rgba(232, 243, 232, 0.1)" />
            <line x1="${padding}" y1="${y}" x2="${width + padding}" y2="${y}" 
                  stroke="rgba(232, 243, 232, 0.1)" />
          `
        }).join('')}
      </g>
      <g class="axes">
        <line x1="${padding}" y1="${height + padding}" x2="${width + padding}" y2="${height + padding}" 
              stroke="#E8F3E8" />
        <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height + padding}" 
              stroke="#E8F3E8" />
        <text x="${width + padding - 50}" y="${height + padding + 20}" 
              fill="#E8F3E8">Left/Right</text>
        <text x="${padding - 30}" y="${padding + 20}" transform="rotate(-90 ${padding - 30} ${padding + 20})" 
              fill="#E8F3E8">Forward/Back</text>
      </g>
      <path d="${pathData}" stroke="#66A182" stroke-width="2" fill="none" />
      ${displacements.map((point, i) => {
        const x = (point.X - xMin) * xScale + padding
        const y = (point.Z - zMin) * zScale + padding
        return `<circle cx="${x}" cy="${y}" r="3" fill="#E8F3E8" />`
      }).join('')}
    `
  }, [displacements])

  return (
    <svg
      ref={svgRef}
      style={{
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: '8px'
      }}
    />
  )
} 