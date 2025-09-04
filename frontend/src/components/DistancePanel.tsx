import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'

const inputClass = "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const DistancePanel: React.FC = () => {
  const [origin, setOrigin] = useState('Mumbai')
  const [destination, setDestination] = useState('Pune')
  const [result, setResult] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onCalculate = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const resp = await fetch(`http://localhost:3001/api/distance?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`)
      if (!resp.ok) throw new Error('Failed to fetch distance')
      const data = await resp.json()
      setResult(data)
    } catch (e: any) {
      setError(e.message || 'Error calculating distance')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distance, Traffic & Pricing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className={inputClass} placeholder="Origin" value={origin} onChange={(e) => setOrigin(e.target.value)} />
          <input className={inputClass} placeholder="Destination" value={destination} onChange={(e) => setDestination(e.target.value)} />
        </div>
        <Button onClick={onCalculate} disabled={loading}>
          {loading ? 'Calculating...' : 'Calculate'}
        </Button>
        {error && <div className="text-sm text-destructive">{error}</div>}
        {result && (
          <div className="text-sm grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <div><span className="text-muted-foreground">Origin:</span> {result.origin?.displayName}</div>
              <div><span className="text-muted-foreground">Destination:</span> {result.destination?.displayName}</div>
              <div><span className="text-muted-foreground">Distance:</span> {(result.distance_meters/1000).toFixed(2)} km</div>
              <div><span className="text-muted-foreground">ETA:</span> {(result.duration_seconds/60).toFixed(1)} min</div>
            </div>
            <div className="space-y-1">
              <div><span className="text-muted-foreground">Avg Speed:</span> {result.avg_speed_kmh?.toFixed?.(1) || result.avg_speed_kmh} km/h</div>
              <div><span className="text-muted-foreground">Traffic Index:</span> {result.traffic_index}/10</div>
              <div><span className="text-muted-foreground">Base Price:</span> ₹{result.price?.rawPrice?.toFixed?.(2) || result.price?.rawPrice}</div>
              <div><span className="text-muted-foreground">Traffic Multiplier:</span> {result.price?.trafficMultiplier}x</div>
              <div className="font-semibold"><span className="text-muted-foreground">Estimated Price:</span> ₹{result.price?.estimatedPrice}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default DistancePanel
