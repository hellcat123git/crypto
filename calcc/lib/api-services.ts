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
    // This would be replaced with actual API call to Zyla API Hub or similar
    // const response = await fetch(`https://api.zylalabs.com/fuel-prices/india/${state}`, {
    //   headers: { 'Authorization': `Bearer ${process.env.FUEL_API_KEY}` }
    // })

    // For now, return realistic mock data based on state
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
    return null
  }
}

export async function fetchTrafficData(city: string): Promise<TrafficData[]> {
  try {
    // This would be replaced with actual traffic API for specific cities
    // const response = await fetch(`https://maps.googleapis.com/maps/api/traffic/json?location=${city}`, {
    //   headers: { 'Authorization': `Bearer ${process.env.GOOGLE_MAPS_API_KEY}` }
    // })

    // City-specific traffic multipliers based on population and infrastructure
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
    return []
  }
}

export async function fetchWeatherData(city: string) {
  try {
    // This would be replaced with actual weather API for specific cities
    // const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city},IN&appid=${process.env.WEATHER_API_KEY}`)

    // City-specific weather patterns and temperature ranges
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
    return null
  }
}
