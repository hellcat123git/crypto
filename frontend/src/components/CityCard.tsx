import React from 'react'
import { motion } from 'framer-motion'
import { Fuel, Car, Users, TrendingUp, Info, ExternalLink } from 'lucide-react'
import { CityData } from '../types'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'

interface CityCardProps {
  city: string
  data: CityData
  isSelected: boolean
  onSelect: () => void
  onViewDetails: () => void
  isLoading: boolean
}

const CityCard: React.FC<CityCardProps> = ({ city, data, isSelected, onSelect, onViewDetails, isLoading }) => {
  const basePrice = 100 // Base service price in INR
  const finalPrice = basePrice * data.price_multiplier

  const getTrafficColor = (index: number) => {
    if (index <= 3) return 'text-green-400'
    if (index <= 6) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getDemandColor = (level: number) => {
    if (level <= 3) return 'text-blue-400'
    if (level <= 6) return 'text-orange-400'
    return 'text-purple-400'
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent event bubbling when clicking the view details button
    if ((e.target as HTMLElement).closest('[data-action="view-details"]')) {
      return
    }
    onSelect()
  }

  return (
    <motion.div
      className={`bg-card border rounded-lg p-4 cursor-pointer transition-all duration-200 relative ${
        isSelected 
          ? 'border-primary shadow-lg shadow-primary/20' 
          : 'border-border hover:border-primary/50 hover:shadow-md'
      }`}
      onClick={handleCardClick}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* City Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{city}</h3>
        <div className="flex items-center gap-2">
          {/* AI Explanation Tooltip */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1 hover:bg-muted rounded-md transition-colors">
                  <Info className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">{data.explanation}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {isSelected && (
            <motion.div
              className="w-2 h-2 bg-primary rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </div>
      </div>

      {/* Final Price */}
      <div className="text-center mb-4">
        <div className="text-2xl font-bold text-primary mb-1">
          ₹{finalPrice.toFixed(2)}
        </div>
        <div className="text-sm text-muted-foreground">
          Multiplier: {data.price_multiplier.toFixed(3)}x
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="space-y-3">
        {/* Fuel Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Fuel className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-muted-foreground">Fuel (₹/L)</span>
          </div>
          <span className="text-sm font-medium">₹{data.fuel_price}</span>
        </div>

        {/* Traffic Index */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Car className="w-4 h-4 text-orange-400" />
            <span className="text-sm text-muted-foreground">Traffic</span>
          </div>
          <span className={`text-sm font-medium ${getTrafficColor(data.traffic_index)}`}>
            {data.traffic_index}/10
          </span>
        </div>

        {/* Demand Level */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-green-400" />
            <span className="text-sm text-muted-foreground">Demand</span>
          </div>
          <span className={`text-sm font-medium ${getDemandColor(data.demand_level)}`}>
            {data.demand_level}/10
          </span>
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-4 pt-3 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          Updated: {new Date(data.timestamp).toLocaleTimeString()}
        </div>
      </div>

      {/* View Details Button */}
      <button
        data-action="view-details"
        onClick={onViewDetails}
        className="absolute top-3 right-3 p-2 hover:bg-muted rounded-md transition-colors opacity-0 group-hover:opacity-100"
        title="View detailed history"
      >
        <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-foreground" />
      </button>

      {/* Loading Overlay */}
      {isLoading && (
        <motion.div
          className="absolute inset-0 bg-background/80 rounded-lg flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}
    </motion.div>
  )
}

export default CityCard
