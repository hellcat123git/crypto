import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fromLocation = searchParams.get("from")
  const toLocation = searchParams.get("to")

  if (!fromLocation || !toLocation) {
    return NextResponse.json({ error: "Both from and to locations are required" }, { status: 400 })
  }

  try {
    // Check if Google Maps API key is available
    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      console.log(`[v0] Using mock traffic data for ${fromLocation} to ${toLocation} - no Google Maps API key found`)

      // Enhanced mock data based on location patterns
      const mockTrafficLevel = getMockTrafficLevel(fromLocation, toLocation)

      return NextResponse.json({
        trafficLevel: mockTrafficLevel,
        trafficCondition: getTrafficCondition(mockTrafficLevel),
        estimatedDelay: Math.round(mockTrafficLevel * 0.5), // minutes
        source: "mock",
      })
    }

    // Real Google Maps Traffic API implementation
    const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(fromLocation)}&destination=${encodeURIComponent(toLocation)}&departure_time=now&traffic_model=best_guess&key=${apiKey}`

    const response = await fetch(directionsUrl)
    const data = await response.json()

    if (data.status === "OK" && data.routes.length > 0) {
      const route = data.routes[0]
      const leg = route.legs[0]

      // Calculate traffic level based on duration vs duration_in_traffic
      const normalDuration = leg.duration.value // seconds
      const trafficDuration = leg.duration_in_traffic?.value || normalDuration

      const trafficRatio = trafficDuration / normalDuration
      const trafficLevel = Math.min(100, Math.max(0, (trafficRatio - 1) * 200)) // Convert to 0-100 scale

      return NextResponse.json({
        trafficLevel: Math.round(trafficLevel),
        trafficCondition: getTrafficCondition(trafficLevel),
        estimatedDelay: Math.round((trafficDuration - normalDuration) / 60), // minutes
        actualDuration: Math.round(trafficDuration / 60), // minutes
        normalDuration: Math.round(normalDuration / 60), // minutes
        source: "google_maps",
      })
    } else {
      throw new Error("No route found")
    }
  } catch (error) {
    console.error("[v0] Traffic API error:", error)

    // Fallback to mock data
    const mockTrafficLevel = getMockTrafficLevel(fromLocation, toLocation)

    return NextResponse.json({
      trafficLevel: mockTrafficLevel,
      trafficCondition: getTrafficCondition(mockTrafficLevel),
      estimatedDelay: Math.round(mockTrafficLevel * 0.5),
      source: "mock_fallback",
    })
  }
}

function getMockTrafficLevel(from: string, to: string): number {
  const fromLower = from.toLowerCase()
  const toLower = to.toLowerCase()

  // High traffic areas in major cities
  const highTrafficAreas = [
    "mumbai",
    "delhi",
    "bangalore",
    "chennai",
    "kolkata",
    "hyderabad",
    "pune",
    "gurgaon",
    "noida",
  ]
  const mediumTrafficAreas = [
    "ahmedabad",
    "surat",
    "jaipur",
    "lucknow",
    "kanpur",
    "nagpur",
    "indore",
    "thane",
    "bhopal",
  ]

  let baseTraffic = 25 // Default low traffic

  // Check if either location is in high traffic area
  if (highTrafficAreas.some((area) => fromLower.includes(area) || toLower.includes(area))) {
    baseTraffic = 65
  } else if (mediumTrafficAreas.some((area) => fromLower.includes(area) || toLower.includes(area))) {
    baseTraffic = 45
  }

  // Add time-based variation (simulate rush hours)
  const hour = new Date().getHours()
  let timeMultiplier = 1

  if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20)) {
    timeMultiplier = 1.4 // Rush hours
  } else if ((hour >= 11 && hour <= 16) || (hour >= 21 && hour <= 23)) {
    timeMultiplier = 1.1 // Moderate hours
  } else {
    timeMultiplier = 0.7 // Off-peak hours
  }

  // Add some randomness
  const randomFactor = 0.8 + Math.random() * 0.4 // 0.8 to 1.2

  return Math.min(100, Math.max(5, Math.round(baseTraffic * timeMultiplier * randomFactor)))
}

function getTrafficCondition(trafficLevel: number): string {
  if (trafficLevel <= 30) return "Light"
  if (trafficLevel <= 70) return "Moderate"
  return "Heavy"
}
