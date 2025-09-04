"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchFuelPrices, fetchTrafficData, fetchWeatherData } from "@/lib/api-services"
import { AnimatedBackground } from "@/components/animated-background"
import { ThermometerIcon } from "@/components/thermometer"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

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

  const [aiMultiplier, setAiMultiplier] = useState<number>(1)
  const [backendCity, setBackendCity] = useState<string>("Mumbai")
  const [backendFeatures, setBackendFeatures] = useState<{ fuel_price_usd?: number; traffic_index?: number; demand_level?: number }>({})

  const [calculatedPrice, setCalculatedPrice] = useState({
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

  const [historicalData, setHistoricalData] = useState<any[]>([])

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

  const mapCityToBackend = (state: string, city: string) => {
    const c = city.toLowerCase()
    if (c.includes("mumbai")) return "Mumbai"
    if (c.includes("delhi")) return "Delhi"
    if (c.includes("bangalore") || c.includes("bengaluru")) return "Bengaluru"
    if (c.includes("hyderabad")) return "Hyderabad"
    if (c.includes("chennai")) return "Chennai"
    // default
    return "Mumbai"
  }

  const fetchRealTimeData = useCallback(async () => {
    setIsLoadingFuel(true)
    setIsLoadingTraffic(true)
    setIsLoadingWeather(true)

    try {
      // Backend AI current pricing
      const mappedCity = mapCityToBackend(factors.state, factors.city)
      setBackendCity(mappedCity)
      const pricingRes = await fetch("http://localhost:3001/api/pricing")
      if (pricingRes.ok) {
        const pricingJson = await pricingRes.json()
        const cityData = pricingJson[mappedCity]
        if (cityData) {
          // traffic_index and demand_level are 1-10; convert to 0-100 sliders
          setFactors((prev) => ({
            ...prev,
            fuelPrice: cityData.fuel_price * 100, // backend fuel is in $1-3 range; convert to ₹ approx by *100
            trafficLevel: Math.round((cityData.traffic_index || 0) * 10),
            demandLevel: Math.round((cityData.demand_level || 0) * 10),
          }))
          setAiMultiplier(cityData.price_multiplier || 1)
          setBackendFeatures({ fuel_price_usd: cityData.fuel_price, traffic_index: cityData.traffic_index, demand_level: cityData.demand_level })
        }
      }

      const fuelData = await fetchFuelPrices(factors.state)
      if (fuelData) {
        // Prefer backend AI value if present; else fallback to mock
        setFactors((prev) => ({ ...prev, fuelPrice: prev.fuelPrice || fuelData.petrol }))
      }

      // Backend AI history for chart
      const histRes = await fetch("http://localhost:3001/api/pricing/history")
      if (histRes.ok) {
        const histJson = await histRes.json()
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
        const citySeries = histJson
          .filter((item: any) => item.city === mappedCity)
          .filter((item: any) => new Date(item.timestamp) > fiveMinutesAgo)
          .map((item: any) => ({
            time: new Date(item.timestamp).toLocaleTimeString(),
            price_multiplier: item.price_multiplier,
            fuel_price: item.fuel_price * 100,
            traffic_index: item.traffic_index,
            demand_level: item.demand_level,
            final_price: (factors.basePrice || 0) * (item.price_multiplier || 1),
          }))
        setHistoricalData(citySeries.reverse())
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
      setIsLoadingFuel(false)
      setIsLoadingTraffic(false)
      setIsLoadingWeather(false)
    }
  }, [factors.state, factors.city])

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

    debouncedFetch()

    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
    }
  }, [fetchRealTimeData])

  const priceCalculation = useMemo(() => {
    // AI-based pricing with cap: final = base * multiplier, capped at 1.5x
    const base = factors.basePrice || 0

    // Derive component impacts from backend features (heuristic aligned with training data generation)
    const fuelUsd = backendFeatures.fuel_price_usd ?? (factors.fuelPrice ? factors.fuelPrice / 100 : undefined)
    const tIndex = backendFeatures.traffic_index ?? (factors.trafficLevel ? Math.round(factors.trafficLevel / 10) : undefined)
    const dLevel = backendFeatures.demand_level ?? (factors.demandLevel ? Math.round(factors.demandLevel / 10) : undefined)

    let fuelImpact = 1, trafficImpact = 1, demandImpact = 1
    if (typeof fuelUsd === 'number') fuelImpact = 1 + (Math.min(3, Math.max(1, fuelUsd)) - 1) * 0.2
    if (typeof tIndex === 'number') trafficImpact = 1 + (Math.min(10, Math.max(1, tIndex)) - 1) * 0.033
    if (typeof dLevel === 'number') demandImpact = 1 + (Math.min(10, Math.max(1, dLevel)) - 1) * 0.033

    const modeledMultiplier = fuelImpact * trafficImpact * demandImpact
    const rawMultiplier = aiMultiplier || 1
    const cappedMultiplier = Math.min(rawMultiplier, 1.5)
    const scale = modeledMultiplier > 0 ? (rawMultiplier / modeledMultiplier) : 1

    const fuelExtraMult = Math.max(0, (fuelImpact - 1) * scale)
    const trafficExtraMult = Math.max(0, (trafficImpact - 1) * scale)
    const demandExtraMult = Math.max(0, (demandImpact - 1) * scale)

    // scale extras after cap enforcement below

    let combinedExtras = fuelExtraMult + trafficExtraMult + demandExtraMult
    let remainderExtraMult = Math.max(0, (rawMultiplier - 1) - combinedExtras)
    // Proportionally scale extras to respect the cap so final <= 1.5x base
    const totalExtraMultRaw = combinedExtras + remainderExtraMult
    const totalExtraMultCap = Math.max(0, cappedMultiplier - 1)
    const capScale = totalExtraMultRaw > 0 ? (totalExtraMultCap / totalExtraMultRaw) : 1
    const fuelAdjMult = fuelExtraMult * capScale
    const trafficAdjMult = trafficExtraMult * capScale
    const demandAdjMult = demandExtraMult * capScale
    const otherAdjMult = remainderExtraMult * capScale

    const fuelAdjustment = base * fuelAdjMult
    const trafficSurcharge = base * trafficAdjMult
    const demandMultiplier = base * demandAdjMult
    const otherSurcharge = base * otherAdjMult

    const finalPrice = base * (1 + fuelAdjMult + trafficAdjMult + demandAdjMult + otherAdjMult)
    const totalExtra = finalPrice - base
    const profit = finalPrice - (factors.costPrice || 0)
    const profitMargin = (factors.costPrice || 0) > 0 ? (profit / factors.costPrice) * 100 : 0

    return {
      trafficSurcharge,
      fuelAdjustment,
      demandMultiplier,
      weatherSurcharge: 0,
      temperatureSurcharge: otherSurcharge,
      totalExtra,
      finalPrice,
      profit,
      profitMargin,
    }
  }, [aiMultiplier, backendFeatures, factors.basePrice, factors.costPrice, factors.fuelPrice, factors.trafficLevel, factors.demandLevel])

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

                <div className="space-y-3 hover:bg-gray-800/30 p-3 rounded-lg transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-300">
                      <Car className="h-4 w-4 text-blue-400 hover:scale-110 transition-transform duration-300" />
                      Traffic Level
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
                </div>

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

                <div className="space-y-2 hover:bg-gray-800/30 p-3 rounded-lg transition-all duration-300">
                  <Label className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-300">
                    <MapPin className="h-4 w-4 text-blue-400 hover:scale-110 transition-transform duration-300" />
                    State
                  </Label>
                  <Select
                    value={factors.state}
                    onValueChange={(value) => setFactors((prev) => ({ ...prev, state: value }))}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 hover:border-blue-400/50 hover:scale-105 transition-all duration-300">
                      <SelectValue placeholder="Select a state" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {stateOptions.map((state) => (
                        <SelectItem
                          key={state.value}
                          value={state.value}
                          className="text-white hover:bg-gray-700 hover:text-blue-400 transition-colors duration-300"
                        >
                          {state.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 hover:bg-gray-800/30 p-3 rounded-lg transition-all duration-300">
                  <Label className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-300">
                    <MapPin className="h-4 w-4 text-green-400 hover:scale-110 transition-transform duration-300" />
                    City
                    {isLoadingTraffic && (
                      <div className="animate-spin h-3 w-3 border border-green-400 border-t-transparent rounded-full"></div>
                    )}
                  </Label>
                  <Select
                    value={factors.city}
                    onValueChange={(value) => setFactors((prev) => ({ ...prev, city: value }))}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 hover:border-green-400/50 hover:scale-105 transition-all duration-300">
                      <SelectValue placeholder="Select a city" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {availableCities.map((city) => (
                        <SelectItem
                          key={city.value}
                          value={city.value}
                          className="text-white hover:bg-gray-700 hover:text-green-400 transition-colors duration-300"
                        >
                          {city.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  {backendCity} - AI Pricing History
                  {isLoadingTraffic && (
                    <div className="animate-spin h-4 w-4 border-2 border-purple-400 border-t-transparent rounded-full"></div>
                  )}
                </CardTitle>
                <CardDescription className="text-gray-400 hover:text-gray-300 transition-colors duration-300">
                  Last 5 minutes of AI pricing data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  {historicalData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historicalData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="4 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                        <Tooltip 
                          formatter={(value: any, name: any) => {
                            if (name.includes('Price')) return [`₹${Number(value).toFixed(2)}`, name]
                            if (name.includes('Multiplier')) return [Number(value).toFixed(3), name]
                            return [value, name]
                          }}
                          labelStyle={{ color: 'hsl(var(--foreground))' }}
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                        />
                        <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
                        <Line type="monotone" dataKey="final_price" stroke="#22d3ee" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 5 }} name="Final Price (₹)" />
                        <Line type="monotone" dataKey="price_multiplier" stroke="#a78bfa" strokeWidth={2} dot={{ r: 0 }} name="AI Multiplier" />
                        <Line type="monotone" dataKey="fuel_price" stroke="#34d399" strokeWidth={2} dot={{ r: 0 }} name="Fuel (₹/L)" />
                        <Line type="monotone" dataKey="traffic_index" stroke="#f59e0b" strokeWidth={2} dot={{ r: 0 }} name="Traffic (1-10)" />
                        <Line type="monotone" dataKey="demand_level" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 0 }} name="Demand (1-10)" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center text-sm text-gray-400 py-16">No data yet. Waiting for backend updates…</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm hover:bg-gray-800/90 hover:border-green-500/50 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 transform">
              <CardHeader className="hover:bg-gray-800/50 transition-colors duration-300">
                <CardTitle className="flex items-center gap-2 text-white hover:text-green-400 transition-colors duration-300">
                  <BarChart3 className="h-5 w-5 text-green-400 hover:scale-110 transition-transform duration-300" />
                  AI Price Breakdown
                </CardTitle>
                <CardDescription className="text-gray-400 hover:text-gray-300 transition-colors duration-300">
                  Base × AI Multiplier → Final Price
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-gray-300">Base Price</span>
                    <span className="text-white font-medium">₹{factors.basePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-gray-300">AI Multiplier</span>
                    <span className="text-purple-300 font-medium">{aiMultiplier.toFixed(3)}x</span>
                  </div>
                  <Separator className="border-gray-600" />
                  <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-gray-300">Final Price</span>
                    <span className="text-green-400 font-semibold">₹{priceCalculation.finalPrice.toFixed(2)}</span>
                  </div>
                  <Separator className="border-gray-600" />
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-2 bg-gray-800/40 rounded">
                      <div className="text-xs text-gray-400">Fuel (₹/L)</div>
                      <div className="text-sm text-white">₹{factors.fuelPrice.toFixed(1)}</div>
                    </div>
                    <div className="p-2 bg-gray-800/40 rounded">
                      <div className="text-xs text-gray-400">Traffic (1-10)</div>
                      <div className="text-sm text-white">{Math.round((factors.trafficLevel || 0)/10)}</div>
                    </div>
                    <div className="p-2 bg-gray-800/40 rounded">
                      <div className="text-xs text-gray-400">Demand (1-10)</div>
                      <div className="text-sm text-white">{Math.round((factors.demandLevel || 0)/10)}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Removed Pricing Formula card as requested */}
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
                      Other (model, noise, residual)
                    </span>
                    <span className="font-medium text-red-400 hover:scale-110 transition-transform duration-300">
                      +₹{calculatedPrice.temperatureSurcharge.toFixed(2)}
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
