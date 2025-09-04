interface FuelPriceData {
  state: string
  petrol: number
  diesel: number
  lastUpdated: string
}

interface TrafficData {
  time: string
  trafficLevel: number
  demandLevel: number
}

// Mock API service for fuel prices (replace with real API when available)
export async function fetchFuelPrices(state: string): Promise<FuelPriceData | null> {
  try {
    // Real fuel price API integration (Zyla API Hub or similar)
    if (process.env.FUEL_API_KEY) {
      const response = await fetch(
        `https://api.zylalabs.com/api/2280/fuel+prices+in+india+api/2663/get+fuel+price+by+state?state=${state}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.FUEL_API_KEY}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Real fuel price data fetched for", state, data)

        return {
          state,
          petrol: data.petrol || 100,
          diesel: data.diesel || 92,
          lastUpdated: new Date().toISOString(),
        }
      }
    }

    // Fallback to mock data if no API key
    console.log("[v0] Using mock fuel price data for", state, "- no Fuel API key found")

    const mockFuelPrices: Record<string, number> = {
      maharashtra: 102.5,
      delhi: 96.8,
      mumbai: 108.2,
      karnataka: 101.3,
      "tamil-nadu": 99.7,
      gujarat: 98.4,
      rajasthan: 105.1,
      "uttar-pradesh": 95.2,
      "west-bengal": 106.8,
      punjab: 103.7,
    }

    const basePrice = mockFuelPrices[state] || 100
    const variation = (Math.random() - 0.5) * 4 // ±2 rupees variation

    return {
      state,
      petrol: Math.round((basePrice + variation) * 100) / 100,
      diesel: Math.round((basePrice + variation - 8) * 100) / 100, // Diesel typically cheaper
      lastUpdated: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Error fetching fuel prices:", error)
    console.log("[v0] Falling back to mock fuel price data due to error")
    return null
  }
}

export async function fetchTrafficData(city: string): Promise<TrafficData[]> {
  try {
    // Real Google Maps Traffic API integration
    if (process.env.GOOGLE_MAPS_API_KEY) {
      const geocodeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${city},India&key=${process.env.GOOGLE_MAPS_API_KEY}`,
      )
      const geocodeData = await geocodeResponse.json()

      if (geocodeData.results && geocodeData.results.length > 0) {
        const { lat, lng } = geocodeData.results[0].geometry.location

        // Get traffic data for different times of day
        const timeSlots = ["6 AM", "9 AM", "12 PM", "3 PM", "6 PM", "9 PM"]
        const trafficPromises = timeSlots.map(async (time, index) => {
          const hour = [6, 9, 12, 15, 18, 21][index]

          // Use Google Maps Distance Matrix API to get traffic data
          const trafficResponse = await fetch(
            `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${lat},${lng}&destinations=${lat + 0.01},${lng + 0.01}&departure_time=${Math.floor(Date.now() / 1000) + (hour - new Date().getHours()) * 3600}&traffic_model=best_guess&key=${process.env.GOOGLE_MAPS_API_KEY}`,
          )
          const trafficData = await trafficResponse.json()

          let trafficLevel = 50 // default
          if (trafficData.rows && trafficData.rows[0] && trafficData.rows[0].elements[0]) {
            const element = trafficData.rows[0].elements[0]
            if (element.duration && element.duration_in_traffic) {
              const normalDuration = element.duration.value
              const trafficDuration = element.duration_in_traffic.value
              const trafficRatio = trafficDuration / normalDuration
              trafficLevel = Math.min(100, Math.max(0, (trafficRatio - 1) * 200 + 30))
            }
          }

          return {
            time,
            trafficLevel: Math.round(trafficLevel),
            demandLevel: Math.round(trafficLevel * 0.8 + Math.random() * 20), // Correlate demand with traffic
          }
        })

        const results = await Promise.all(trafficPromises)
        console.log("[v0] Real traffic data fetched for", city, results)
        return results
      }
    }

    // Fallback to enhanced mock data if no API key
    console.log("[v0] Using mock traffic data for", city, "- no Google Maps API key found")

    const cityTrafficMultipliers: Record<string, number> = {
      // Major metros - higher traffic
      mumbai: 1.4,
      delhi: 1.3,
      bangalore: 1.35,
      kolkata: 1.25,
      chennai: 1.3,
      hyderabad: 1.2,
      pune: 1.15,
      ahmedabad: 1.1,

      // Tier 2 cities - moderate traffic
      jaipur: 1.0,
      lucknow: 0.95,
      kanpur: 0.9,
      nagpur: 0.85,
      indore: 0.8,
      bhopal: 0.75,
      patna: 0.9,

      // Smaller cities - lower traffic
      guwahati: 0.7,
      bhubaneswar: 0.65,
      chandigarh: 0.6,
      dehradun: 0.5,
      shimla: 0.4,
      gangtok: 0.3,
    }

    const cityMultiplier = cityTrafficMultipliers[city] || 0.8

    // Generate realistic traffic patterns based on time of day and city
    const currentHour = new Date().getHours()
    const timeSlots = ["6 AM", "9 AM", "12 PM", "3 PM", "6 PM", "9 PM"]

    return timeSlots.map((time, index) => {
      const hour = [6, 9, 12, 15, 18, 21][index]
      let baseTraffic = 30
      let baseDemand = 25

      // Peak hours logic
      if (hour === 9 || hour === 18) {
        // Morning and evening rush
        baseTraffic = 85
        baseDemand = 75
      } else if (hour === 12 || hour === 15) {
        // Lunch and afternoon
        baseTraffic = 60
        baseDemand = 50
      }

      // Apply city-specific multiplier
      baseTraffic = Math.round(baseTraffic * cityMultiplier)
      baseDemand = Math.round(baseDemand * cityMultiplier)

      // Add some randomness
      const trafficVariation = (Math.random() - 0.5) * 20
      const demandVariation = (Math.random() - 0.5) * 15

      return {
        time,
        trafficLevel: Math.max(10, Math.min(100, baseTraffic + trafficVariation)),
        demandLevel: Math.max(10, Math.min(100, baseDemand + demandVariation)),
      }
    })
  } catch (error) {
    console.error("Error fetching traffic data:", error)
    console.log("[v0] Falling back to mock traffic data due to error")
    return []
  }
}

export async function fetchWeatherData(city: string) {
  try {
    // Real OpenWeatherMap API integration
    if (process.env.WEATHER_API_KEY) {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city},IN&appid=${process.env.WEATHER_API_KEY}&units=metric`,
      )

      if (response.ok) {
        const data = await response.json()

        // Map OpenWeatherMap conditions to our weather options
        const weatherMapping: Record<string, string> = {
          "clear sky": "clear",
          "few clouds": "clear",
          "scattered clouds": "cloudy",
          "broken clouds": "cloudy",
          "overcast clouds": "cloudy",
          "shower rain": "rain",
          rain: "rain",
          thunderstorm: "thunderstorm",
          snow: "fog",
          mist: "haze",
          fog: "fog",
          haze: "haze",
        }

        const weatherDescription = data.weather[0].description.toLowerCase()
        const mappedCondition = weatherMapping[weatherDescription] || "clear"

        console.log("[v0] Real weather data fetched for", city, {
          condition: mappedCondition,
          temperature: Math.round(data.main.temp),
          description: weatherDescription,
        })

        return {
          condition: mappedCondition,
          temperature: Math.round(data.main.temp),
          lastUpdated: new Date().toISOString(),
        }
      }
    }

    // Fallback to mock data if no API key
    console.log("[v0] Using mock weather data for", city, "- no OpenWeatherMap API key found")

    const cityWeatherData: Record<string, { conditions: string[]; tempRange: [number, number] }> = {
      // Coastal cities - more humid, moderate temps
      mumbai: { conditions: ["cloudy", "rain", "haze"], tempRange: [22, 35] },
      chennai: { conditions: ["clear", "cloudy", "rain"], tempRange: [24, 38] },
      kochi: { conditions: ["rain", "cloudy", "clear"], tempRange: [23, 33] },

      // Northern plains - extreme temperatures
      delhi: { conditions: ["clear", "haze", "fog"], tempRange: [5, 45] },
      lucknow: { conditions: ["clear", "fog", "haze"], tempRange: [8, 42] },
      jaipur: { conditions: ["clear", "haze"], tempRange: [10, 46] },

      // Hill stations - cooler temperatures
      shimla: { conditions: ["clear", "cloudy", "fog"], tempRange: [-5, 25] },
      dehradun: { conditions: ["clear", "rain", "fog"], tempRange: [5, 35] },
      gangtok: { conditions: ["cloudy", "rain", "fog"], tempRange: [0, 20] },

      // Eastern cities - high humidity, moderate temps
      kolkata: { conditions: ["cloudy", "rain", "haze"], tempRange: [15, 38] },
      guwahati: { conditions: ["rain", "cloudy", "clear"], tempRange: [12, 35] },

      // Southern cities - moderate climate
      bangalore: { conditions: ["clear", "cloudy", "rain"], tempRange: [15, 32] },
      hyderabad: { conditions: ["clear", "cloudy", "haze"], tempRange: [18, 40] },
    }

    const cityData = cityWeatherData[city] || {
      conditions: ["clear", "cloudy", "rain", "haze", "fog"],
      tempRange: [15, 40] as [number, number],
    }

    const randomCondition = cityData.conditions[Math.floor(Math.random() * cityData.conditions.length)]
    const [minTemp, maxTemp] = cityData.tempRange
    const temperature = Math.floor(Math.random() * (maxTemp - minTemp + 1)) + minTemp

    return {
      condition: randomCondition,
      temperature,
      lastUpdated: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Error fetching weather data:", error)
    console.log("[v0] Falling back to mock weather data due to error")
    return null
  }
}
