"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  Car,
  Fuel,
  Users,
  MapPin,
  Calculator,
  DollarSign,
  Cloud,
  Sun,
  CloudRain,
  BarChart3,
  Thermometer,
  Navigation,
  Clock,
  Route,
  Building,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchFuelPrices, fetchTrafficData as fetchHistoricalTrafficData, fetchWeatherData } from "@/lib/api-services"
import { AnimatedBackground } from "@/components/animated-background"
import { ThermometerIcon } from "@/components/thermometer"
import { AddressAutocomplete } from "./address-autocomplete"

interface PricingFactors {
  basePrice: number
  trafficLevel: number
  fuelPrice: number
  demandLevel: number
  state: string
  city: string
  costPrice: number
  weatherCondition: string
  temperature: number
}

interface DeliveryLocation {
  fromLocation: string
  toLocation: string
  distance: number
  estimatedTime: number
  trafficMultiplier: number
  deliveryPrice: number
}

const stateToCity = {
  "andhra-pradesh": [
    { value: "visakhapatnam", label: "Visakhapatnam" },
    { value: "vijayawada", label: "Vijayawada" },
    { value: "guntur", label: "Guntur" },
    { value: "nellore", label: "Nellore" },
    { value: "kurnool", label: "Kurnool" },
    { value: "rajahmundry", label: "Rajahmundry" },
    { value: "tirupati", label: "Tirupati" },
  ],
  "arunachal-pradesh": [
    { value: "itanagar", label: "Itanagar" },
    { value: "naharlagun", label: "Naharlagun" },
    { value: "pasighat", label: "Pasighat" },
    { value: "tezpur", label: "Tezpur" },
  ],
  assam: [
    { value: "guwahati", label: "Guwahati" },
    { value: "silchar", label: "Silchar" },
    { value: "dibrugarh", label: "Dibrugarh" },
    { value: "jorhat", label: "Jorhat" },
    { value: "nagaon", label: "Nagaon" },
    { value: "tinsukia", label: "Tinsukia" },
  ],
  bihar: [
    { value: "patna", label: "Patna" },
    { value: "gaya", label: "Gaya" },
    { value: "bhagalpur", label: "Bhagalpur" },
    { value: "muzaffarpur", label: "Muzaffarpur" },
    { value: "darbhanga", label: "Darbhanga" },
    { value: "bihar-sharif", label: "Bihar Sharif" },
  ],
  chhattisgarh: [
    { value: "raipur", label: "Raipur" },
    { value: "bhilai", label: "Bhilai" },
    { value: "korba", label: "Korba" },
    { value: "bilaspur", label: "Bilaspur" },
    { value: "durg", label: "Durg" },
  ],
  goa: [
    { value: "panaji", label: "Panaji" },
    { value: "margao", label: "Margao" },
    { value: "vasco-da-gama", label: "Vasco da Gama" },
    { value: "mapusa", label: "Mapusa" },
  ],
  gujarat: [
    { value: "ahmedabad", label: "Ahmedabad" },
    { value: "surat", label: "Surat" },
    { value: "vadodara", label: "Vadodara" },
    { value: "rajkot", label: "Rajkot" },
    { value: "bhavnagar", label: "Bhavnagar" },
    { value: "jamnagar", label: "Jamnagar" },
    { value: "gandhinagar", label: "Gandhinagar" },
  ],
  haryana: [
    { value: "gurgaon", label: "Gurgaon" },
    { value: "faridabad", label: "Faridabad" },
    { value: "panipat", label: "Panipat" },
    { value: "ambala", label: "Ambala" },
    { value: "yamunanagar", label: "Yamunanagar" },
    { value: "rohtak", label: "Rohtak" },
  ],
  "himachal-pradesh": [
    { value: "shimla", label: "Shimla" },
    { value: "dharamshala", label: "Dharamshala" },
    { value: "solan", label: "Solan" },
    { value: "mandi", label: "Mandi" },
    { value: "kullu", label: "Kullu" },
  ],
  jharkhand: [
    { value: "ranchi", label: "Ranchi" },
    { value: "jamshedpur", label: "Jamshedpur" },
    { value: "dhanbad", label: "Dhanbad" },
    { value: "bokaro", label: "Bokaro" },
    { value: "deoghar", label: "Deoghar" },
  ],
  karnataka: [
    { value: "bangalore", label: "Bangalore" },
    { value: "mysore", label: "Mysore" },
    { value: "hubli", label: "Hubli" },
    { value: "mangalore", label: "Mangalore" },
    { value: "belgaum", label: "Belgaum" },
    { value: "gulbarga", label: "Gulbarga" },
  ],
  kerala: [
    { value: "kochi", label: "Kochi" },
    { value: "thiruvananthapuram", label: "Thiruvananthapuram" },
    { value: "kozhikode", label: "Kozhikode" },
    { value: "thrissur", label: "Thrissur" },
    { value: "kollam", label: "Kollam" },
    { value: "kannur", label: "Kannur" },
  ],
  "madhya-pradesh": [
    { value: "bhopal", label: "Bhopal" },
    { value: "indore", label: "Indore" },
    { value: "gwalior", label: "Gwalior" },
    { value: "jabalpur", label: "Jabalpur" },
    { value: "ujjain", label: "Ujjain" },
    { value: "sagar", label: "Sagar" },
  ],
  maharashtra: [
    { value: "mumbai", label: "Mumbai" },
    { value: "pune", label: "Pune" },
    { value: "nagpur", label: "Nagpur" },
    { value: "nashik", label: "Nashik" },
    { value: "aurangabad", label: "Aurangabad" },
    { value: "solapur", label: "Solapur" },
    { value: "kolhapur", label: "Kolhapur" },
  ],
  manipur: [
    { value: "imphal", label: "Imphal" },
    { value: "thoubal", label: "Thoubal" },
    { value: "bishnupur", label: "Bishnupur" },
  ],
  meghalaya: [
    { value: "shillong", label: "Shillong" },
    { value: "tura", label: "Tura" },
    { value: "jowai", label: "Jowai" },
  ],
  mizoram: [
    { value: "aizawl", label: "Aizawl" },
    { value: "lunglei", label: "Lunglei" },
    { value: "serchhip", label: "Serchhip" },
  ],
  nagaland: [
    { value: "kohima", label: "Kohima" },
    { value: "dimapur", label: "Dimapur" },
    { value: "mokokchung", label: "Mokokchung" },
  ],
  odisha: [
    { value: "bhubaneswar", label: "Bhubaneswar" },
    { value: "cuttack", label: "Cuttack" },
    { value: "rourkela", label: "Rourkela" },
    { value: "berhampur", label: "Berhampur" },
    { value: "sambalpur", label: "Sambalpur" },
  ],
  punjab: [
    { value: "ludhiana", label: "Ludhiana" },
    { value: "amritsar", label: "Amritsar" },
    { value: "jalandhar", label: "Jalandhar" },
    { value: "patiala", label: "Patiala" },
    { value: "bathinda", label: "Bathinda" },
    { value: "mohali", label: "Mohali" },
  ],
  rajasthan: [
    { value: "jaipur", label: "Jaipur" },
    { value: "jodhpur", label: "Jodhpur" },
    { value: "kota", label: "Kota" },
    { value: "bikaner", label: "Bikaner" },
    { value: "udaipur", label: "Udaipur" },
    { value: "ajmer", label: "Ajmer" },
  ],
  sikkim: [
    { value: "gangtok", label: "Gangtok" },
    { value: "namchi", label: "Namchi" },
    { value: "gyalshing", label: "Gyalshing" },
  ],
  "tamil-nadu": [
    { value: "chennai", label: "Chennai" },
    { value: "coimbatore", label: "Coimbatore" },
    { value: "madurai", label: "Madurai" },
    { value: "tiruchirappalli", label: "Tiruchirappalli" },
    { value: "salem", label: "Salem" },
    { value: "tirunelveli", label: "Tirunelveli" },
  ],
  telangana: [
    { value: "hyderabad", label: "Hyderabad" },
    { value: "warangal", label: "Warangal" },
    { value: "nizamabad", label: "Nizamabad" },
    { value: "karimnagar", label: "Karimnagar" },
    { value: "khammam", label: "Khammam" },
  ],
  tripura: [
    { value: "agartala", label: "Agartala" },
    { value: "dharmanagar", label: "Dharmanagar" },
    { value: "udaipur", label: "Udaipur" },
  ],
  "uttar-pradesh": [
    { value: "lucknow", label: "Lucknow" },
    { value: "kanpur", label: "Kanpur" },
    { value: "ghaziabad", label: "Ghaziabad" },
    { value: "agra", label: "Agra" },
    { value: "meerut", label: "Meerut" },
    { value: "varanasi", label: "Varanasi" },
    { value: "allahabad", label: "Allahabad" },
    { value: "bareilly", label: "Bareilly" },
  ],
  uttarakhand: [
    { value: "dehradun", label: "Dehradun" },
    { value: "haridwar", label: "Haridwar" },
    { value: "roorkee", label: "Roorkee" },
    { value: "haldwani", label: "Haldwani" },
    { value: "rishikesh", label: "Rishikesh" },
  ],
  "west-bengal": [
    { value: "kolkata", label: "Kolkata" },
    { value: "howrah", label: "Howrah" },
    { value: "durgapur", label: "Durgapur" },
    { value: "asansol", label: "Asansol" },
    { value: "siliguri", label: "Siliguri" },
    { value: "malda", label: "Malda" },
  ],
}

interface DeliveryLocation {
  fromLocation: string
  toLocation: string
  distance: number
  estimatedTime: number
  trafficMultiplier: number
  deliveryPrice: number
}

interface CalculatedPrice {
  trafficSurcharge: number
  fuelAdjustment: number
  demandMultiplier: number
  weatherSurcharge: number
  temperatureSurcharge: number
  totalExtra: number
  finalPrice: number
  profit: number
  profitMargin: number
}

const stateOptions = [
  { value: "andhra-pradesh", label: "Andhra Pradesh" },
  { value: "arunachal-pradesh", label: "Arunachal Pradesh" },
  { value: "assam", label: "Assam" },
  { value: "bihar", label: "Bihar" },
  { value: "chhattisgarh", label: "Chhattisgarh" },
  { value: "goa", label: "Goa" },
  { value: "gujarat", label: "Gujarat" },
  { value: "haryana", label: "Haryana" },
  { value: "himachal-pradesh", label: "Himachal Pradesh" },
  { value: "jharkhand", label: "Jharkhand" },
  { value: "karnataka", label: "Karnataka" },
  { value: "kerala", label: "Kerala" },
  { value: "madhya-pradesh", label: "Madhya Pradesh" },
  { value: "maharashtra", label: "Maharashtra" },
  { value: "manipur", label: "Manipur" },
  { value: "meghalaya", label: "Meghalaya" },
  { value: "mizoram", label: "Mizoram" },
  { value: "nagaland", label: "Nagaland" },
  { value: "odisha", label: "Odisha" },
  { value: "punjab", label: "Punjab" },
  { value: "rajasthan", label: "Rajasthan" },
  { value: "sikkim", label: "Sikkim" },
  { value: "tamil-nadu", label: "Tamil Nadu" },
  { value: "telangana", label: "Telangana" },
  { value: "tripura", label: "Tripura" },
  { value: "uttar-pradesh", label: "Uttar Pradesh" },
  { value: "uttarakhand", label: "Uttarakhand" },
  { value: "west-bengal", label: "West Bengal" },
]

const getTrafficColor = (trafficLevel: number) => {
  if (trafficLevel <= 30) return "text-green-400"
  if (trafficLevel <= 70) return "text-yellow-400"
  return "text-red-400"
}

const getTrafficLabel = (trafficLevel: number) => {
  if (trafficLevel <= 30) return "Light"
  if (trafficLevel <= 70) return "Moderate"
  return "Severe"
}

const getDemandColor = (demandLevel: number) => {
  if (demandLevel <= 30) return "text-green-400"
  if (demandLevel <= 70) return "text-yellow-400"
  return "text-red-400"
}

const getDemandLabel = (demandLevel: number) => {
  if (demandLevel <= 30) return "Low"
  if (demandLevel <= 70) return "Normal"
  return "High"
}

const getWeatherIcon = (weather: string) => {
  switch (weather) {
    case "clear":
      return Sun
    case "cloudy":
      return Cloud
    case "rain":
      return CloudRain
    default:
      return Sun
  }
}

const getWeatherColor = (weather: string) => {
  switch (weather) {
    case "clear":
      return "text-yellow-500"
    case "cloudy":
      return "text-gray-400"
    case "rain":
      return "text-blue-400"
    case "haze":
      return "text-orange-400"
    case "thunderstorm":
      return "text-red-500"
    case "fog":
      return "text-gray-500"
    default:
      return "text-yellow-500"
  }
}

const weatherOptions = [
  { value: "clear", label: "Clear", icon: Sun, color: "text-yellow-500" },
  { value: "cloudy", label: "Cloudy", icon: Cloud, color: "text-gray-400" },
  { value: "rain", label: "Rain", icon: CloudRain, color: "text-blue-400" },
  { value: "haze", label: "Haze", icon: Cloud, color: "text-orange-400" },
  { value: "thunderstorm", label: "Thunderstorm", icon: CloudRain, color: "text-red-500" },
  { value: "fog", label: "Fog", icon: Cloud, color: "text-gray-500" },
]

const getTemperatureColor = (temp: number) => {
  if (temp <= 5 || temp >= 45) return "text-red-500"
  if (temp <= 10 || temp >= 40) return "text-orange-500"
  if (temp <= 15 || temp >= 35) return "text-yellow-500"
  return "text-green-400"
}

const getTemperatureLabel = (temp: number) => {
  if (temp <= 5) return "Extreme Cold"
  if (temp >= 45) return "Extreme Hot"
  if (temp <= 10) return "Very Cold"
  if (temp >= 40) return "Very Hot"
  if (temp <= 15) return "Cold"
  if (temp >= 35) return "Hot"
  return "Comfortable"
}

const fetchTrafficData = async (from: string, to: string) => {
  try {
    const response = await fetch(`/api/traffic?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
    const data = await response.json()

    if (response.ok) {
      console.log(`[v0] Traffic data for ${from} to ${to}:`, data)
      return {
        trafficLevel: data.trafficLevel,
        estimatedDelay: data.estimatedDelay || 0,
      }
    } else {
      console.error("[v0] Traffic API error:", data.error)
      return null
    }
  } catch (error) {
    console.error("[v0] Failed to fetch traffic data:", error)
    return null
  }
}

export default function PricingCalculator() {
  const [factors, setFactors] = useState<PricingFactors>({
    basePrice: 2000.0,
    trafficLevel: 50,
    fuelPrice: 100.0,
    demandLevel: 50,
    state: "maharashtra",
    city: "mumbai",
    costPrice: 1500.0,
    weatherCondition: "clear",
    temperature: 25,
  })

  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocation>({
    fromLocation: "",
    toLocation: "",
    distance: 0,
    estimatedTime: 0,
    trafficMultiplier: 1,
    deliveryPrice: 0,
  })

  const [calculatedPrice, setCalculatedPrice] = useState<CalculatedPrice>({
    trafficSurcharge: 0,
    fuelAdjustment: 0,
    demandMultiplier: 0,
    weatherSurcharge: 0,
    temperatureSurcharge: 0,
    totalExtra: 0,
    finalPrice: 0,
    profit: 0,
    profitMargin: 0,
  })

  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false)

  const [historicalData, setHistoricalData] = useState([
    { time: "6 AM", price: 1800, traffic: 30, fuel: 95 },
    { time: "9 AM", price: 2400, traffic: 80, fuel: 102 },
    { time: "12 PM", price: 2100, traffic: 60, fuel: 98 },
    { time: "3 PM", price: 2200, traffic: 65, fuel: 100 },
    { time: "6 PM", price: 2600, traffic: 90, fuel: 105 },
    { time: "9 PM", price: 2000, traffic: 40, fuel: 96 },
  ])

  const [isLoadingFuel, setIsLoadingFuel] = useState(false)
  const [isLoadingTraffic, setIsLoadingTraffic] = useState(false)
  const [isLoadingWeather, setIsLoadingWeather] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>("")

  useEffect(() => {
    const handleResizeObserverError = (e: ErrorEvent) => {
      if (e.message === "ResizeObserver loop completed with undelivered notifications.") {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
    }

    window.addEventListener("error", handleResizeObserverError)
    return () => window.removeEventListener("error", handleResizeObserverError)
  }, [])

  const calculateDeliveryPrice = async () => {
    if (!deliveryLocation.fromLocation || !deliveryLocation.toLocation) {
      setDeliveryLocation((prev) => ({
        ...prev,
        distance: 0,
        estimatedTime: 0,
        trafficMultiplier: 1,
        deliveryPrice: 0,
      }))
      return
    }

    setIsCalculatingRoute(true)

    try {
      // Fetch real traffic data
      const trafficData = await fetchTrafficData(deliveryLocation.fromLocation, deliveryLocation.toLocation)

      // Update traffic level in factors if we got real data
      if (trafficData) {
        setFactors((prev) => ({ ...prev, trafficLevel: trafficData.trafficLevel }))

        setHistoricalData((prevData) => {
          return prevData.map((data) => {
            if (data.time === currentTimeSlot) {
              return {
                ...data,
                traffic: trafficData.trafficLevel,
                price: Math.round(2000 + (trafficData.trafficLevel / 100) * 500), // Adjust price based on traffic
              }
            }
            return data
          })
        })
      }

      // Enhanced location-based distance calculation
      const fromLocationLower = deliveryLocation.fromLocation.toLowerCase()
      const toLocationLower = deliveryLocation.toLocation.toLowerCase()

      let simulatedDistance = Math.random() * 50 + 5 // Default 5-55 km

      // Inter-city distances (approximate realistic distances)
      if (fromLocationLower.includes("mumbai") && toLocationLower.includes("pune")) {
        simulatedDistance = 150 + Math.random() * 20
      } else if (fromLocationLower.includes("delhi") && toLocationLower.includes("gurgaon")) {
        simulatedDistance = 30 + Math.random() * 10
      } else if (fromLocationLower.includes("bangalore") && toLocationLower.includes("mysore")) {
        simulatedDistance = 140 + Math.random() * 20
      } else if (fromLocationLower.includes("chennai") && toLocationLower.includes("bangalore")) {
        simulatedDistance = 350 + Math.random() * 30
      } else if (fromLocationLower.includes("hyderabad") && toLocationLower.includes("bangalore")) {
        simulatedDistance = 570 + Math.random() * 40
      } else if (fromLocationLower.includes("kolkata") && toLocationLower.includes("delhi")) {
        simulatedDistance = 1450 + Math.random() * 100
      } else if (fromLocationLower.includes("mumbai") && toLocationLower.includes("delhi")) {
        simulatedDistance = 1400 + Math.random() * 100
      } else if (fromLocationLower.includes("jaipur") && toLocationLower.includes("delhi")) {
        simulatedDistance = 280 + Math.random() * 30
      } else if (fromLocationLower.includes("ahmedabad") && toLocationLower.includes("mumbai")) {
        simulatedDistance = 520 + Math.random() * 40
      } else if (fromLocationLower.includes("kochi") && toLocationLower.includes("bangalore")) {
        simulatedDistance = 460 + Math.random() * 40
      }

      // Same city but different areas
      const sameCity =
        (fromLocationLower.includes("mumbai") && toLocationLower.includes("mumbai")) ||
        (fromLocationLower.includes("delhi") && toLocationLower.includes("delhi")) ||
        (fromLocationLower.includes("bangalore") && toLocationLower.includes("bangalore")) ||
        (fromLocationLower.includes("chennai") && toLocationLower.includes("chennai")) ||
        (fromLocationLower.includes("hyderabad") && toLocationLower.includes("hyderabad")) ||
        (fromLocationLower.includes("kolkata") && toLocationLower.includes("kolkata"))

      if (sameCity) {
        simulatedDistance = Math.random() * 40 + 5 // 5-45 km within city
      }

      const simulatedTime = simulatedDistance * 2 + Math.random() * 30 // Base time + traffic delay
      const trafficMultiplier = 1 + (factors.trafficLevel / 100) * 0.5 // Traffic affects delivery time

      // Calculate delivery price based on distance, traffic, and current pricing factors
      const baseDeliveryRate = 15 // ₹15 per km base rate
      const distancePrice = simulatedDistance * baseDeliveryRate
      const trafficSurcharge = distancePrice * (factors.trafficLevel / 100) * 0.3
      const weatherSurcharge = distancePrice * getWeatherMultiplier(factors.weatherCondition)
      const fuelSurcharge = (factors.fuelPrice - 80) * simulatedDistance * 0.1

      const totalDeliveryPrice = distancePrice + trafficSurcharge + weatherSurcharge + Math.max(0, fuelSurcharge)

      console.log(
        `[v0] Calculated delivery from ${fromLocationLower} to ${toLocationLower}: ${simulatedDistance.toFixed(1)}km, ₹${totalDeliveryPrice.toFixed(2)}`,
      )

      setDeliveryLocation((prev) => ({
        ...prev,
        distance: simulatedDistance,
        estimatedTime: simulatedTime * trafficMultiplier,
        trafficMultiplier,
        deliveryPrice: totalDeliveryPrice,
      }))
    } catch (error) {
      console.error("Error calculating delivery price:", error)
    } finally {
      setIsCalculatingRoute(false)
    }
  }

  const extractLocationInfo = (location: string) => {
    const locationLower = location.toLowerCase()

    // Find matching state and city
    for (const [stateKey, cities] of Object.entries(stateToCity)) {
      for (const city of cities) {
        if (locationLower.includes(city.value) || locationLower.includes(city.label.toLowerCase())) {
          return { state: stateKey, city: city.value }
        }
      }
    }

    // Default fallback
    return { state: "maharashtra", city: "mumbai" }
  }

  const getWeatherMultiplier = (weather: string) => {
    switch (weather) {
      case "clear":
        return 0
      case "cloudy":
        return 0.05
      case "rain":
        return 0.15
      case "haze":
        return 0.1
      case "thunderstorm":
        return 0.25
      case "fog":
        return 0.2
      default:
        return 0
    }
  }

  const priceCalculation = useMemo(() => {
    const trafficSurcharge = (factors.trafficLevel / 100) * 0.2 * factors.basePrice

    const fuelBaseline = 80.0
    const fuelDifference = factors.fuelPrice - fuelBaseline
    const fuelAdjustment = Math.max(0, fuelDifference * 2.5)

    const demandMultiplier = (factors.demandLevel / 100) * 0.5 * factors.basePrice

    const weatherSurcharge = getWeatherMultiplier(factors.weatherCondition) * factors.basePrice

    const getTemperatureMultiplier = (temp: number) => {
      if (temp <= 5 || temp >= 45) return 0.2
      if (temp <= 10 || temp >= 40) return 0.15
      if (temp <= 15 || temp >= 35) return 0.1
      return 0
    }
    const temperatureSurcharge = getTemperatureMultiplier(factors.temperature) * factors.basePrice

    const totalExtra = trafficSurcharge + fuelAdjustment + demandMultiplier + weatherSurcharge + temperatureSurcharge
    const finalPrice = factors.basePrice + totalExtra

    const profit = finalPrice - factors.costPrice
    const profitMargin = factors.costPrice > 0 ? (profit / factors.costPrice) * 100 : 0

    return {
      trafficSurcharge,
      fuelAdjustment,
      demandMultiplier,
      weatherSurcharge,
      temperatureSurcharge,
      totalExtra,
      finalPrice,
      profit,
      profitMargin,
    }
  }, [factors])

  useEffect(() => {
    setCalculatedPrice(priceCalculation)
  }, [priceCalculation])

  const pieChartData = useMemo(
    () =>
      [
        { name: "Base Price", value: factors.basePrice, color: "#3B82F6" },
        { name: "Traffic", value: calculatedPrice.trafficSurcharge, color: "#F59E0B" },
        { name: "Fuel", value: calculatedPrice.fuelAdjustment, color: "#10B981" },
        { name: "Demand", value: calculatedPrice.demandMultiplier, color: "#8B5CF6" },
        { name: "Weather", value: calculatedPrice.weatherSurcharge, color: "#EF4444" },
        { name: "Temperature", value: calculatedPrice.temperatureSurcharge, color: "#F97316" },
      ].filter((item) => item.value > 0),
    [factors.basePrice, calculatedPrice],
  )

  const getCurrentTimeSlot = () => {
    const now = new Date()
    const hour = now.getHours()

    if (hour >= 6 && hour < 9) return "6 AM"
    if (hour >= 9 && hour < 12) return "9 AM"
    if (hour >= 12 && hour < 15) return "12 PM"
    if (hour >= 15 && hour < 18) return "3 PM"
    if (hour >= 18 && hour < 21) return "6 PM"
    if (hour >= 21 || hour < 6) return "9 PM"
    return ""
  }

  const currentTimeSlot = getCurrentTimeSlot()

  const availableCities = useMemo(() => {
    return stateToCity[factors.state as keyof typeof stateToCity] || []
  }, [factors.state])

  useEffect(() => {
    const cities = stateToCity[factors.state as keyof typeof stateToCity]
    if (cities && cities.length > 0) {
      setFactors((prev) => ({ ...prev, city: cities[0].value }))
    }
  }, [factors.state])

  const hasLocations = deliveryLocation.fromLocation && deliveryLocation.toLocation

  useEffect(() => {
    if (deliveryLocation.fromLocation) {
      const locationInfo = extractLocationInfo(deliveryLocation.fromLocation)
      setFactors((prev) => ({
        ...prev,
        state: locationInfo.state,
        city: locationInfo.city,
      }))
    }
  }, [deliveryLocation.fromLocation])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    let intervalId: NodeJS.Timeout

    const debouncedFetch = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        fetchRealTimeData()

        // Clear existing interval before setting new one
        clearInterval(intervalId)
        intervalId = setInterval(fetchRealTimeData, 5 * 60 * 1000)
      }, 500)
    }

    const fetchRealTimeData = async () => {
      setIsLoadingTraffic(true)
      setIsLoadingWeather(true)

      try {
        const fuelData = await fetchFuelPrices(factors.state)
        if (fuelData) {
          setFactors((prev) => ({ ...prev, fuelPrice: fuelData.petrol }))
        }

        const trafficData = await fetchHistoricalTrafficData(factors.city)
        if (trafficData.length > 0) {
          setHistoricalData((prevData) => {
            return trafficData.map((data, index) => {
              const currentData = prevData[index] || {
                time: data.time,
                price: 2000,
                traffic: 50,
                fuel: 100,
              }

              const isCurrentTime = data.time === currentTimeSlot
              const trafficLevel =
                isCurrentTime && factors.trafficLevel !== 50 ? factors.trafficLevel : Math.round(data.trafficLevel)

              return {
                ...currentData,
                time: data.time,
                traffic: trafficLevel,
                price: isCurrentTime ? Math.round(2000 + (trafficLevel / 100) * 500) : currentData.price,
                fuel: fuelData ? fuelData.petrol : currentData.fuel,
              }
            })
          })
        }

        const weatherData = await fetchWeatherData(factors.city)
        if (weatherData) {
          setFactors((prev) => ({
            ...prev,
            weatherCondition: weatherData.condition,
            temperature: weatherData.temperature,
          }))
        }

        setLastUpdated(new Date().toLocaleTimeString())
      } catch (error) {
        console.error("Error fetching real-time data:", error)
      } finally {
        setIsLoadingTraffic(false)
        setIsLoadingWeather(false)
      }
    }

    debouncedFetch()

    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
    }
  }, [factors.state, factors.city, factors.trafficLevel, currentTimeSlot])

  const fromLocation = deliveryLocation.fromLocation
  const toLocation = deliveryLocation.toLocation

  return (
    <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 mx-auto max-w-7xl space-y-8 p-4">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-pulse hover:scale-105 transition-transform duration-300">
            Dynamic Pricing Calculator
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto hover:text-white transition-colors duration-300">
            Get transparent pricing based on real-time factors including traffic, fuel, demand, weather conditions, and
            temperature.
          </p>
          {lastUpdated && (
            <p className="text-sm text-green-400 hover:text-green-300 transition-colors duration-300">
              🔄 Last updated: {lastUpdated} | Data refreshes every 5 minutes
            </p>
          )}
        </div>

        <Card className="bg-gradient-to-r from-orange-900/30 to-red-900/30 border-orange-500/30 backdrop-blur-sm hover:from-orange-800/40 hover:to-red-800/40 hover:border-orange-400/50 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 transform">
          <CardHeader className="hover:bg-orange-900/20 transition-colors duration-300">
            <CardTitle className="flex items-center gap-2 text-white hover:text-orange-300 transition-colors duration-300">
              <Navigation className="h-5 w-5 text-orange-400 hover:scale-110 transition-transform duration-300" />
              Delivery Location Calculator
              {isCalculatingRoute && (
                <div className="animate-spin h-4 w-4 border-2 border-orange-400 border-t-transparent rounded-full"></div>
              )}
            </CardTitle>
            <CardDescription className="text-gray-400 hover:text-gray-300 transition-colors duration-300">
              Calculate delivery pricing based on distance and real-time traffic conditions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <AddressAutocomplete
                id="fromLocation"
                label="From Location"
                placeholder="Enter pickup location (e.g., Mumbai Central)"
                value={deliveryLocation.fromLocation}
                onChange={(value) => {
                  setDeliveryLocation((prev) => ({ ...prev, fromLocation: value }))
                }}
                icon="from"
              />

              <AddressAutocomplete
                id="toLocation"
                label="To Location"
                placeholder="Enter delivery location (e.g., Andheri West)"
                value={deliveryLocation.toLocation}
                onChange={(value) => setDeliveryLocation((prev) => ({ ...prev, toLocation: value }))}
                icon="to"
              />
            </div>

            <div className="flex justify-center">
              <Button
                onClick={() => calculateDeliveryPrice()}
                disabled={!deliveryLocation.fromLocation || !deliveryLocation.toLocation || isCalculatingRoute}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-8 py-2 rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCalculatingRoute ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Calculating Route...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculate Delivery Price
                  </>
                )}
              </Button>
            </div>

            {deliveryLocation.distance > 0 && (
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <Card className="bg-gray-800/50 border-gray-600 hover:bg-gray-700/50 hover:border-orange-400/50 hover:scale-105 transition-all duration-300">
                  <CardContent className="pt-4">
                    <div className="text-center space-y-2">
                      <Route className="h-8 w-8 text-orange-400 mx-auto hover:scale-110 transition-transform duration-300" />
                      <div className="text-2xl font-bold text-white hover:text-orange-300 transition-colors duration-300">
                        {deliveryLocation.distance.toFixed(1)} km
                      </div>
                      <div className="text-sm text-gray-400 hover:text-gray-300 transition-colors duration-300">
                        Total Distance
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-600 hover:bg-gray-700/50 hover:border-blue-400/50 hover:scale-105 transition-all duration-300">
                  <CardContent className="pt-4">
                    <div className="text-center space-y-2">
                      <Clock className="h-8 w-8 text-blue-400 mx-auto hover:scale-110 transition-transform duration-300" />
                      <div className="text-2xl font-bold text-white hover:text-blue-300 transition-colors duration-300">
                        {Math.round(deliveryLocation.estimatedTime)} min
                      </div>
                      <div className="text-sm text-gray-400 hover:text-gray-300 transition-colors duration-300">
                        Estimated Time
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-600 hover:bg-gray-700/50 hover:border-green-400/50 hover:scale-105 transition-all duration-300">
                  <CardContent className="pt-4">
                    <div className="text-center space-y-2">
                      <DollarSign className="h-8 w-8 text-green-400 mx-auto hover:scale-110 transition-transform duration-300" />
                      <div className="text-2xl font-bold text-white hover:text-green-300 transition-colors duration-300">
                        ₹{deliveryLocation.deliveryPrice.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-400 hover:text-gray-300 transition-colors duration-300">
                        Delivery Price
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {deliveryLocation.distance > 0 && (
              <Card className="bg-gray-800/30 border-gray-600 hover:bg-gray-700/30 hover:border-orange-400/50 transition-all duration-300">
                <CardContent className="pt-4">
                  <h4 className="font-semibold text-white mb-3 hover:text-orange-300 transition-colors duration-300">
                    Delivery Price Breakdown
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between hover:bg-gray-700/30 p-2 rounded transition-all duration-300">
                      <span className="text-gray-300 hover:text-white transition-colors duration-300">
                        Base Rate (₹15/km × {deliveryLocation.distance.toFixed(1)}km)
                      </span>
                      <span className="text-white hover:scale-110 transition-transform duration-300">
                        ₹{(deliveryLocation.distance * 15).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between hover:bg-gray-700/30 p-2 rounded transition-all duration-300">
                      <span className="text-gray-300 hover:text-white transition-colors duration-300">
                        Traffic Surcharge ({factors.trafficLevel}% traffic)
                      </span>
                      <span className="text-orange-400 hover:scale-110 transition-transform duration-300">
                        +₹{(deliveryLocation.distance * 15 * (factors.trafficLevel / 100) * 0.3).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between hover:bg-gray-700/30 p-2 rounded transition-all duration-300">
                      <span className="text-gray-300 hover:text-white transition-colors duration-300">
                        Weather Surcharge ({factors.weatherCondition})
                      </span>
                      <span className="text-blue-400 hover:scale-110 transition-transform duration-300">
                        +₹{(deliveryLocation.distance * 15 * getWeatherMultiplier(factors.weatherCondition)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between hover:bg-gray-700/30 p-2 rounded transition-all duration-300">
                      <span className="text-gray-300 hover:text-white transition-colors duration-300">
                        Fuel Surcharge (₹{factors.fuelPrice}/L)
                      </span>
                      <span className="text-green-400 hover:scale-110 transition-transform duration-300">
                        +₹{Math.max(0, (factors.fuelPrice - 80) * deliveryLocation.distance * 0.1).toFixed(2)}
                      </span>
                    </div>
                    <Separator className="border-gray-600" />
                    <div className="flex justify-between font-semibold text-lg hover:bg-gray-700/30 p-2 rounded transition-all duration-300">
                      <span className="text-white hover:text-orange-300 transition-colors duration-300">
                        Total Delivery Price
                      </span>
                      <span className="text-green-400 hover:scale-110 transition-transform duration-300">
                        ₹{deliveryLocation.deliveryPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm hover:bg-gray-800/90 hover:border-blue-500/50 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 transform">
              <CardHeader className="hover:bg-gray-800/50 transition-colors duration-300">
                <CardTitle className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors duration-300">
                  <TrendingUp className="h-5 w-5 text-blue-400 hover:scale-110 transition-transform duration-300" />
                  Pricing Factors
                  {(isLoadingFuel || isLoadingTraffic || isLoadingWeather) && (
                    <div className="animate-spin h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2 hover:bg-gray-800/30 p-3 rounded-lg transition-all duration-300">
                  <Label htmlFor="costPrice" className="text-gray-300 hover:text-white transition-colors duration-300">
                    Cost Price (₹)
                  </Label>
                  <Input
                    id="costPrice"
                    type="number"
                    step="0.01"
                    value={factors.costPrice}
                    onChange={(e) =>
                      setFactors((prev) => ({ ...prev, costPrice: Number.parseFloat(e.target.value) || 0 }))
                    }
                    className="text-lg font-semibold bg-gray-800 border-gray-600 text-white focus:border-blue-400 hover:bg-gray-700 hover:border-blue-400/50 hover:scale-105 transition-all duration-300"
                  />
                </div>

                <div className="space-y-2 hover:bg-gray-800/30 p-3 rounded-lg transition-all duration-300">
                  <Label htmlFor="basePrice" className="text-gray-300 hover:text-white transition-colors duration-300">
                    Base Price (₹)
                  </Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    value={factors.basePrice}
                    onChange={(e) =>
                      setFactors((prev) => ({ ...prev, basePrice: Number.parseFloat(e.target.value) || 0 }))
                    }
                    className="text-lg font-semibold bg-gray-800 border-gray-600 text-white focus:border-blue-400 hover:bg-gray-700 hover:border-blue-400/50 hover:scale-105 transition-all duration-300"
                  />
                </div>

                {hasLocations && (
                  <div className="space-y-3 hover:bg-gray-800/30 p-3 rounded-lg transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-300">
                        <Car className="h-4 w-4 text-blue-400 hover:scale-110 transition-transform duration-300" />
                        Traffic Level <span className="text-xs text-gray-400">(Auto-updated)</span>
                      </Label>
                      <Badge
                        className={`${getTrafficColor(factors.trafficLevel)} hover:scale-110 transition-all duration-300`}
                      >
                        {getTrafficLabel(factors.trafficLevel)}
                      </Badge>
                    </div>
                    <Slider
                      value={[factors.trafficLevel]}
                      onValueChange={(value) => setFactors((prev) => ({ ...prev, trafficLevel: value[0] }))}
                      max={100}
                      step={1}
                      className="w-full [&_[role=slider]]:bg-blue-400 [&_[role=slider]]:border-blue-400 [&_[role=slider]]:hover:scale-125 [&_[role=slider]]:hover:shadow-lg [&_[role=slider]]:hover:shadow-blue-400/50 [&_[role=slider]]:transition-all [&_[role=slider]]:duration-300"
                    />
                    <div className="flex justify-between text-sm text-gray-400">
                      <span className="hover:text-white transition-colors duration-300">Light</span>
                      <span className="text-blue-400 font-medium hover:scale-110 transition-transform duration-300">
                        {factors.trafficLevel}%
                      </span>
                      <span className="hover:text-white transition-colors duration-300">Severe</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      Traffic level automatically updates based on your selected route
                    </div>
                  </div>
                )}

                <div className="space-y-3 hover:bg-gray-800/30 p-3 rounded-lg transition-all duration-300">
                  <Label className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-300">
                    <Fuel className="h-4 w-4 text-blue-400 hover:scale-110 transition-transform duration-300" />
                    Fuel Price (₹/liter)
                    {isLoadingFuel && (
                      <div className="animate-spin h-3 w-3 border border-blue-400 border-t-transparent rounded-full"></div>
                    )}
                  </Label>
                  <Slider
                    value={[factors.fuelPrice]}
                    onValueChange={(value) => setFactors((prev) => ({ ...prev, fuelPrice: value[0] }))}
                    min={70}
                    max={130}
                    step={0.5}
                    className="w-full [&_[role=slider]]:bg-blue-400 [&_[role=slider]]:border-blue-400 [&_[role=slider]]:hover:scale-125 [&_[role=slider]]:hover:shadow-lg [&_[role=slider]]:hover:shadow-blue-400/50 [&_[role=slider]]:transition-all [&_[role=slider]]:duration-300"
                  />
                  <div className="flex justify-between text-sm text-gray-400">
                    <span className="hover:text-white transition-colors duration-300">₹70</span>
                    <span className="text-blue-400 font-medium hover:scale-110 transition-transform duration-300">
                      ₹{factors.fuelPrice.toFixed(1)}
                      {!isLoadingFuel && <span className="text-green-400 ml-1">●</span>}
                    </span>
                    <span className="hover:text-white transition-colors duration-300">₹130</span>
                  </div>
                </div>

                <div className="space-y-3 hover:bg-gray-800/30 p-3 rounded-lg transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-300">
                      <Users className="h-4 w-4 text-blue-400 hover:scale-110 transition-transform duration-300" />
                      Demand Level
                    </Label>
                    <Badge
                      className={`${getDemandColor(factors.demandLevel)} hover:scale-110 transition-all duration-300`}
                    >
                      {getDemandLabel(factors.demandLevel)}
                    </Badge>
                  </div>
                  <Slider
                    value={[factors.demandLevel]}
                    onValueChange={(value) => setFactors((prev) => ({ ...prev, demandLevel: value[0] }))}
                    max={100}
                    step={1}
                    className="w-full [&_[role=slider]]:bg-blue-400 [&_[role=slider]]:border-blue-400 [&_[role=slider]]:hover:scale-125 [&_[role=slider]]:hover:shadow-lg [&_[role=slider]]:hover:shadow-blue-400/50 [&_[role=slider]]:transition-all [&_[role=slider]]:duration-300"
                  />
                  <div className="flex justify-between text-sm text-gray-400">
                    <span className="hover:text-white transition-colors duration-300">Low</span>
                    <span className="text-blue-400 font-medium hover:scale-110 transition-transform duration-300">
                      {factors.demandLevel}%
                    </span>
                    <span className="hover:text-white transition-colors duration-300">Peak</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3 hover:bg-gray-800/30 p-3 rounded-lg transition-all duration-300">
                    <Label className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-300">
                      <MapPin className="h-4 w-4 text-green-400 hover:scale-110 transition-transform duration-300" />
                      State
                    </Label>
                    {hasLocations ? (
                      <>
                        <Badge className="bg-green-500/20 text-green-400 hover:scale-110 transition-all duration-300 mb-2">
                          {factors.state.charAt(0).toUpperCase() + factors.state.slice(1).replace("-", " ")}
                        </Badge>
                        <Select
                          value={factors.state}
                          onValueChange={(value) => setFactors((prev) => ({ ...prev, state: value }))}
                        >
                          <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700/50 hover:border-blue-500/50 transition-all duration-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            {Object.keys(stateToCity).map((state) => (
                              <SelectItem key={state} value={state} className="text-white hover:bg-gray-700">
                                {state.charAt(0).toUpperCase() + state.slice(1).replace("-", " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </>
                    ) : (
                      <Badge className="bg-gray-500/20 text-gray-400 w-fit">Enter locations first</Badge>
                    )}
                  </div>

                  <div className="space-y-3 hover:bg-gray-800/30 p-3 rounded-lg transition-all duration-300">
                    <Label className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-300">
                      <Building className="h-4 w-4 text-purple-400 hover:scale-110 transition-transform duration-300" />
                      City
                    </Label>
                    {hasLocations ? (
                      <>
                        <Badge className="bg-purple-500/20 text-purple-400 hover:scale-110 transition-all duration-300 mb-2">
                          {availableCities.find((c) => c.value === factors.city)?.label || factors.city}
                        </Badge>
                        <Select
                          value={factors.city}
                          onValueChange={(value) => setFactors((prev) => ({ ...prev, city: value }))}
                        >
                          <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700/50 hover:border-blue-500/50 transition-all duration-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            {availableCities.map((city) => (
                              <SelectItem key={city.value} value={city.value} className="text-white hover:bg-gray-700">
                                {city.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </>
                    ) : (
                      <Badge className="bg-gray-500/20 text-gray-400 w-fit">Enter locations first</Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-3 hover:bg-gray-800/30 p-3 rounded-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-300">
                      {(() => {
                        const WeatherIcon = getWeatherIcon(factors.weatherCondition)
                        return (
                          <WeatherIcon
                            className={`h-4 w-4 ${getWeatherColor(factors.weatherCondition)} hover:scale-110 transition-transform duration-300`}
                          />
                        )
                      })()}
                      Weather Condition
                    </Label>
                  </div>
                  <Select
                    value={factors.weatherCondition}
                    onValueChange={(value) => setFactors((prev) => ({ ...prev, weatherCondition: value }))}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 hover:border-blue-400/50 hover:scale-105 transition-all duration-300">
                      <SelectValue placeholder="Select weather condition" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {weatherOptions.map((weather) => {
                        const Icon = weather.icon
                        return (
                          <SelectItem
                            key={weather.value}
                            value={weather.value}
                            className="text-white hover:bg-gray-700 hover:text-blue-400 transition-colors duration-300"
                          >
                            <div className="flex items-center gap-2">
                              <Icon
                                className={`h-4 w-4 ${weather.color} hover:scale-110 transition-transform duration-300`}
                              />
                              {weather.label}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>

                  <div className="flex justify-center mt-4 hover:scale-110 transition-transform duration-300">
                    <ThermometerIcon temperature={factors.temperature} />
                  </div>

                  <div className="space-y-3 mt-4">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-300">
                        <Thermometer className="h-4 w-4 text-blue-400 hover:scale-110 transition-transform duration-300" />
                        Temperature
                      </Label>
                      <Badge
                        className={`${getTemperatureColor(factors.temperature)} hover:scale-110 transition-all duration-300`}
                      >
                        {getTemperatureLabel(factors.temperature)}
                      </Badge>
                    </div>
                    <Slider
                      value={[factors.temperature]}
                      onValueChange={(value) => setFactors((prev) => ({ ...prev, temperature: value[0] }))}
                      min={-10}
                      max={50}
                      step={1}
                      className="w-full [&_[role=slider]]:bg-blue-400 [&_[role=slider]]:border-blue-400 [&_[role=slider]]:hover:scale-125 [&_[role=slider]]:hover:shadow-lg [&_[role=slider]]:hover:shadow-blue-400/50 [&_[role=slider]]:transition-all [&_[role=slider]]:duration-300"
                    />
                    <div className="flex justify-between text-sm text-gray-400">
                      <span className="hover:text-white transition-colors duration-300">-10°C</span>
                      <span className="text-blue-400 font-medium hover:scale-110 transition-transform duration-300">
                        {factors.temperature}°C
                      </span>
                      <span className="hover:text-white transition-colors duration-300">50°C</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm hover:bg-gray-800/90 hover:border-purple-500/50 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 transform">
              <CardHeader className="hover:bg-gray-800/50 transition-colors duration-300">
                <CardTitle className="flex items-center gap-2 text-white hover:text-purple-400 transition-colors duration-300">
                  <BarChart3 className="h-5 w-5 text-purple-400 hover:scale-110 transition-transform duration-300" />
                  Daily Pricing Trends
                  {isLoadingTraffic && (
                    <div className="animate-spin h-4 w-4 border-2 border-purple-400 border-t-transparent rounded-full"></div>
                  )}
                </CardTitle>
                <CardDescription className="text-gray-400 hover:text-gray-300 transition-colors duration-300">
                  Real-time pricing patterns throughout the day
                </CardDescription>
              </CardHeader>
              <CardContent>
                {deliveryLocation.fromLocation && deliveryLocation.toLocation ? (
                  <div className="space-y-3">
                    {historicalData.map((data, index) => (
                      <div
                        key={index}
                        className={`flex justify-between items-center p-3 rounded-lg transition-all duration-300 ${
                          data.time === currentTimeSlot
                            ? "bg-purple-800/50 border-2 border-purple-400 hover:bg-purple-700/60 hover:scale-105 shadow-lg shadow-purple-500/20"
                            : "bg-gray-800/50 hover:bg-gray-700/50 hover:scale-105"
                        }`}
                      >
                        <span
                          className={`transition-colors duration-300 ${
                            data.time === currentTimeSlot
                              ? "text-purple-300 font-bold"
                              : "text-gray-300 hover:text-white"
                          }`}
                        >
                          {data.time}
                          {data.time === currentTimeSlot && (
                            <span className="ml-2 text-xs bg-purple-500 px-2 py-1 rounded-full animate-pulse">NOW</span>
                          )}
                        </span>
                        <div className="flex gap-4 text-sm">
                          <span className="text-blue-400 hover:text-blue-300 hover:scale-110 transition-all duration-300">
                            ₹{data.price}
                          </span>
                          <span className="text-orange-400 hover:text-orange-300 hover:scale-110 transition-all duration-300">
                            Traffic: {data.traffic}%
                          </span>
                          <span className="text-green-400 hover:text-green-300 hover:scale-110 transition-all duration-300">
                            Fuel: ₹{data.fuel}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                      <BarChart3 className="h-8 w-8 text-gray-500" />
                    </div>
                    <p className="text-gray-400 text-lg font-medium mb-2">Enter Delivery Locations</p>
                    <p className="text-gray-500 text-sm max-w-xs">
                      Please enter both pickup and delivery locations to see real-time pricing trends and traffic data.
                    </p>
                  </div>
                )}
                {deliveryLocation.fromLocation && deliveryLocation.toLocation && (
                  <div className="mt-4 text-xs text-gray-500 text-center">
                    {!isLoadingTraffic && (
                      <div className="flex items-center justify-center gap-2">
                        {process.env.GOOGLE_MAPS_API_KEY ? (
                          <span className="text-green-400">● Live traffic data (Google Maps)</span>
                        ) : (
                          <span className="text-yellow-400">● Simulated traffic data</span>
                        )}
                        <span className="text-blue-400">Last updated: {lastUpdated}</span>
                      </div>
                    )}
                    {isLoadingTraffic && (
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-yellow-400">⟳ Fetching traffic data...</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {hasLocations && (
              <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm hover:bg-gray-800/90 hover:border-green-500/50 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 transform">
                <CardHeader className="hover:bg-gray-800/50 transition-colors duration-300">
                  <CardTitle className="flex items-center gap-2 text-white hover:text-green-400 transition-colors duration-300">
                    <BarChart3 className="h-5 w-5 text-green-400 hover:scale-110 transition-transform duration-300" />
                    Price Composition
                  </CardTitle>
                  <CardDescription className="text-gray-400 hover:text-gray-300 transition-colors duration-300">
                    Visual breakdown of pricing components
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pieChartData.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 hover:scale-105 transition-all duration-300"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full hover:scale-125 transition-transform duration-300"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-gray-300 hover:text-white transition-colors duration-300">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-white font-medium hover:scale-110 transition-transform duration-300">
                          ₹{item.value.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm hover:bg-gray-800/90 hover:border-blue-500/50 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 transform">
              <CardHeader className="hover:bg-gray-800/50 transition-colors duration-300">
                <CardTitle className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors duration-300">
                  <Calculator className="h-5 w-5 text-blue-400 hover:scale-110 transition-transform duration-300" />
                  Pricing Formula
                </CardTitle>
                <CardDescription className="text-gray-400 hover:text-gray-300 transition-colors duration-300">
                  Mathematical formula used for price calculation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-800/50 p-4 rounded-lg font-mono text-sm border border-gray-700 hover:bg-gray-700/50 hover:border-blue-500/50 transition-all duration-300">
                  <div className="space-y-2">
                    <div className="text-blue-400">
                      <strong>Final Price = Base Price + Traffic + Fuel + Demand + Weather + Temperature</strong>
                    </div>
                    <div className="text-gray-400">Where:</div>
                    <div className="text-gray-300">• Traffic Surcharge = (Traffic Level / 100) × 0.2 × Base Price</div>
                    <div className="text-gray-300">• Fuel Adjustment = max(0, (Fuel Price - ₹80) × 2.5)</div>
                    <div className="text-gray-300">• Demand Multiplier = (Demand Level / 100) × 0.5 × Base Price</div>
                    <div className="text-gray-300">• Weather Surcharge = Weather Factor × Base Price</div>
                    <div className="text-gray-300">• Temperature Surcharge = Temperature Factor × Base Price</div>
                    <div className="text-purple-400 mt-3">
                      <strong>Profit = Final Price - Cost Price</strong>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  <p>
                    <strong>Traffic:</strong> 0-20% surcharge based on congestion level
                  </p>
                  <p>
                    <strong>Fuel:</strong> ₹2.5 per liter above ₹80 baseline
                  </p>
                  <p>
                    <strong>Demand:</strong> 0-50% multiplier based on current demand
                  </p>
                  <p>
                    <strong>Weather:</strong> Clear: 0%, Cloudy: 5%, Rain: 15%, Haze: 10%, Thunderstorm: 25%, Fog: 20%
                  </p>
                  <p>
                    <strong>Temperature:</strong> Extreme (≤5°C or ≥45°C): 20%, Very Cold/Hot (≤10°C or ≥40°C): 15%,
                    Cold/Hot (≤15°C or ≥35°C): 10%, Comfortable (16-34°C): 0%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-500/30 backdrop-blur-sm hover:from-purple-800/60 hover:to-blue-800/60 hover:border-purple-400/50 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 transform">
              <CardHeader className="hover:bg-purple-900/30 transition-colors duration-300">
                <CardTitle className="flex items-center gap-2 text-white hover:text-purple-300 transition-colors duration-300">
                  <DollarSign className="h-5 w-5 text-purple-400 hover:scale-110 transition-transform duration-300" />
                  Profit Analysis
                </CardTitle>
                <CardDescription className="text-gray-400 hover:text-white transition-colors duration-300">
                  Your profit breakdown and margin analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center hover:bg-purple-900/20 p-2 rounded transition-all duration-300">
                  <span className="text-gray-300 hover:text-white transition-colors duration-300">Cost Price</span>
                  <span className="font-semibold text-red-400 hover:scale-110 transition-transform duration-300">
                    ₹{factors.costPrice.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center hover:bg-purple-900/20 p-2 rounded transition-all duration-300">
                  <span className="text-gray-300 hover:text-white transition-colors duration-300">Final Price</span>
                  <span className="font-semibold text-green-400 hover:scale-110 transition-transform duration-300">
                    ₹{calculatedPrice.finalPrice.toFixed(2)}
                  </span>
                </div>

                <Separator className="border-gray-600" />

                <div className="flex justify-between items-center text-lg hover:bg-purple-900/20 p-2 rounded transition-all duration-300">
                  <span className="font-bold text-white hover:text-purple-300 transition-colors duration-300">
                    Total Profit
                  </span>
                  <span
                    className={`font-bold text-2xl hover:scale-110 transition-transform duration-300 ${calculatedPrice.profit >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    ₹{calculatedPrice.profit.toFixed(2)}
                  </span>
                </div>

                <div className="text-center">
                  <Badge
                    variant="outline"
                    className={`text-sm border-2 hover:scale-110 transition-transform duration-300 ${calculatedPrice.profitMargin >= 0 ? "border-green-400 text-green-400 hover:bg-green-400/10" : "border-red-400 text-red-400 hover:bg-red-400/10"}`}
                  >
                    {calculatedPrice.profitMargin.toFixed(1)}% Profit Margin
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm hover:bg-gray-800/90 hover:border-cyan-500/50 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 transform">
              <CardHeader className="hover:bg-gray-800/50 transition-colors duration-300">
                <CardTitle className="text-white hover:text-cyan-400 transition-colors duration-300">
                  Price Breakdown
                </CardTitle>
                <CardDescription className="text-gray-400 hover:text-gray-300 transition-colors duration-300">
                  Transparent breakdown of all charges and adjustments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center hover:bg-gray-800/30 p-2 rounded transition-all duration-300">
                  <span className="text-gray-400 hover:text-white transition-colors duration-300">Base Price</span>
                  <span className="font-semibold text-white hover:scale-110 transition-transform duration-300">
                    ₹{factors.basePrice.toFixed(2)}
                  </span>
                </div>

                <Separator className="border-gray-600" />

                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-gray-400 uppercase tracking-wide hover:text-gray-300 transition-colors duration-300">
                    Additional Charges
                  </h4>

                  <div className="flex justify-between items-center hover:bg-gray-800/30 p-2 rounded transition-all duration-300">
                    <span className="text-sm text-gray-300 hover:text-white transition-colors duration-300">
                      Traffic Surcharge
                    </span>
                    <span className="font-medium text-orange-400 hover:scale-110 transition-transform duration-300">
                      +₹{calculatedPrice.trafficSurcharge.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center hover:bg-gray-800/30 p-2 rounded transition-all duration-300">
                    <span className="text-sm text-gray-300 hover:text-white transition-colors duration-300">
                      Fuel Adjustment
                    </span>
                    <span className="font-medium text-blue-400 hover:scale-110 transition-transform duration-300">
                      +₹{calculatedPrice.fuelAdjustment.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center hover:bg-gray-800/30 p-2 rounded transition-all duration-300">
                    <span className="text-sm text-gray-300 hover:text-white transition-colors duration-300">
                      Demand Multiplier
                    </span>
                    <span className="font-medium text-purple-400 hover:scale-110 transition-transform duration-300">
                      +₹{calculatedPrice.demandMultiplier.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center hover:bg-gray-800/30 p-2 rounded transition-all duration-300">
                    <span className="text-sm text-gray-300 flex items-center gap-1 hover:text-white transition-colors duration-300">
                      {(() => {
                        const WeatherIcon = getWeatherIcon(factors.weatherCondition)
                        return (
                          <WeatherIcon
                            className={`h-3 w-3 ${getWeatherColor(factors.weatherCondition)} hover:scale-110 transition-transform duration-300`}
                          />
                        )
                      })()}
                      Weather Surcharge
                    </span>
                    <span className="font-medium text-red-400 hover:scale-110 transition-transform duration-300">
                      +₹{calculatedPrice.weatherSurcharge.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center hover:bg-gray-800/30 p-2 rounded transition-all duration-300">
                    <span className="text-sm text-gray-300 flex items-center gap-1 hover:text-white transition-colors duration-300">
                      <Thermometer
                        className={`h-3 w-3 ${getTemperatureColor(factors.temperature)} hover:scale-110 transition-transform duration-300`}
                      />
                      Temperature Surcharge
                    </span>
                    <span className="font-medium text-orange-500 hover:scale-110 transition-transform duration-300">
                      +₹{calculatedPrice.temperatureSurcharge.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Separator className="border-2 border-gray-600" />

                <div className="flex justify-between items-center hover:bg-gray-800/30 p-2 rounded transition-all duration-300">
                  <span className="font-medium text-white hover:text-cyan-400 transition-colors duration-300">
                    Total Extra Charges
                  </span>
                  <span className="font-semibold text-red-400 hover:scale-110 transition-transform duration-300">
                    +₹{calculatedPrice.totalExtra.toFixed(2)}
                  </span>
                </div>

                <Separator className="border-2 border-gray-600" />

                <div className="flex justify-between items-center text-lg hover:bg-cyan-900/20 p-3 rounded transition-all duration-300">
                  <span className="font-bold text-white hover:text-cyan-400 transition-colors duration-300">
                    Final Price
                  </span>
                  <span className="font-bold text-blue-400 text-2xl animate-pulse hover:scale-110 transition-transform duration-300">
                    ₹{calculatedPrice.finalPrice.toFixed(2)}
                  </span>
                </div>

                {calculatedPrice.totalExtra > 0 && (
                  <div className="text-center">
                    <Badge
                      variant="outline"
                      className="text-xs border-blue-400 text-blue-400 hover:bg-blue-400/10 hover:scale-110 transition-all duration-300"
                    >
                      {((calculatedPrice.totalExtra / factors.basePrice) * 100).toFixed(1)}% increase from base price
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border-green-500/30 backdrop-blur-sm hover:from-green-800/40 hover:to-blue-800/40 hover:border-green-400/50 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/30 transition-all duration-300 transform">
              <CardContent className="pt-6 hover:bg-green-900/10 transition-colors duration-300">
                <div className="text-center space-y-2">
                  <h4 className="font-semibold text-sm text-white hover:text-green-300 transition-colors duration-300">
                    Transparent Pricing Guarantee
                  </h4>
                  <p className="text-xs text-gray-300 hover:text-white transition-colors duration-300">
                    All charges are calculated in real-time based on current market conditions. No hidden fees.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
