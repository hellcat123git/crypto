import { useState, useRef } from 'react'
import { GoogleMap, useJsApiLoader, Autocomplete, DirectionsRenderer, TransitLayer } from '@react-google-maps/api'
import { Button } from './ui/button'
import { Input } from './ui/input'

const center = { lat: 12.8717, lng: 80.2223 }
const libraries: ("places")[] = ["places"]

export function RoutePlanner() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || '',
    libraries,
  })

  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null)
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')
  type TravelModeOption = 'DRIVING' | 'TRANSIT'
  const [travelMode, setTravelMode] = useState<TravelModeOption>('DRIVING')

  const originRef = useRef<HTMLInputElement>(null)
  const destinationRef = useRef<HTMLInputElement>(null)

  if (!apiKey) {
    return (
      <div className="p-4 text-sm">
        Google Maps API key missing. Add VITE_GOOGLE_MAPS_API_KEY to frontend/.env.local and restart the dev server.
      </div>
    )
  }

  if (!isLoaded) {
    return <div className="p-4 text-sm">Loading Map...</div>
  }

  async function calculateRoute() {
    if (!originRef.current?.value || !destinationRef.current?.value) {
      return
    }
    const directionsService = new google.maps.DirectionsService()
    try {
      const selectedMode = travelMode === 'DRIVING' 
        ? google.maps.TravelMode.DRIVING 
        : google.maps.TravelMode.TRANSIT
      const results = await directionsService.route({
        origin: originRef.current.value,
        destination: destinationRef.current.value,
        travelMode: selectedMode,
      })
      setDirectionsResponse(results)
      setDistance(results.routes[0].legs[0].distance?.text || '')
      setDuration(results.routes[0].legs[0].duration?.text || '')
    } catch (error) {
      console.error('Error calculating route:', error)
      alert('Could not calculate route. Please check the addresses.')
      clearRoute()
    }
  }

  function clearRoute() {
    setDirectionsResponse(null)
    setDistance('')
    setDuration('')
    if (originRef.current) originRef.current.value = ''
    if (destinationRef.current) destinationRef.current.value = ''
  }

  return (
    <div className="relative h-[calc(100vh-150px)] min-h-[70vh] w-full">
      <div className="p-2 text-sm">Route Planner</div>
      <div className="absolute left-0 top-0 h-full w-full">
        <GoogleMap
          center={center}
          zoom={12}
          mapContainerStyle={{ width: '100%', height: '100%' }}
          options={{
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          <TransitLayer />
          {directionsResponse && <DirectionsRenderer directions={directionsResponse} />}
        </GoogleMap>
      </div>

      <div className="p-4 rounded-lg m-4 bg-background/90 shadow-lg z-10 w-full max-w-md backdrop-blur-sm">
        <div className="space-y-2">
          <Autocomplete>
            <Input type="text" placeholder="Origin" ref={originRef} />
          </Autocomplete>
          <Autocomplete>
            <Input type="text" placeholder="Destination" ref={destinationRef} />
          </Autocomplete>
        </div>
        <div className="flex items-center space-x-2 mt-4">
          <Button
            onClick={() => setTravelMode('DRIVING')}
            variant={travelMode === 'DRIVING' ? 'default' : 'outline'}
          >
            Driving
          </Button>
          <Button
            onClick={() => setTravelMode('TRANSIT')}
            variant={travelMode === 'TRANSIT' ? 'default' : 'outline'}
          >
            Public Transit
          </Button>
        </div>
        <div className="flex justify-between mt-4">
          <Button onClick={calculateRoute}>Calculate Route</Button>
          <Button onClick={clearRoute} variant="secondary">Clear</Button>
        </div>
        {distance && duration && (
          <div className="mt-4 p-2 bg-secondary rounded text-center">
            <p className="font-bold">Distance: <span className="font-normal">{distance}</span></p>
            <p className="font-bold">Duration: <span className="font-normal">{duration}</span></p>
          </div>
        )}
      </div>
    </div>
  )
}

export default RoutePlanner


