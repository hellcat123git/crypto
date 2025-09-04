"use client"

import { Thermometer } from "lucide-react"

interface ThermometerIconProps {
  temperature: number
}

export const ThermometerIcon = ({ temperature }: ThermometerIconProps) => {
  const getTemperatureColor = (temp: number) => {
    if (temp <= 10) return "text-blue-500"
    if (temp <= 20) return "text-cyan-400"
    if (temp <= 30) return "text-green-400"
    if (temp <= 35) return "text-yellow-400"
    if (temp <= 40) return "text-orange-400"
    return "text-red-500"
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <Thermometer
        className={`h-16 w-16 ${getTemperatureColor(temperature)} transition-colors duration-300 drop-shadow-lg`}
      />
      <span className={`text-sm font-bold ${getTemperatureColor(temperature)} mt-2`}>{temperature}°C</span>
    </div>
  )
}
