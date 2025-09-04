import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Skeleton } from './ui/skeleton'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Clock,
  Fuel,
  Car,
  Users,
  DollarSign
} from 'lucide-react'
import { HistoricalData } from '../types'

interface CityDetailModalProps {
  isOpen: boolean
  onClose: () => void
  city: string | null
}

const CityDetailModal: React.FC<CityDetailModalProps> = ({ isOpen, onClose, city }) => {
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && city) {
      fetchHistoricalData()
    }
  }, [isOpen, city])

  const fetchHistoricalData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('http://localhost:3001/api/pricing/history')
      if (!response.ok) {
        throw new Error('Failed to fetch historical data')
      }
      
      const data = await response.json()
      
      // Filter data for the selected city and get last 30 entries
      const cityData = data
        .filter((item: HistoricalData) => item.city === city)
        .slice(-30)
        .reverse() // Show newest first
      
      setHistoricalData(cityData)
    } catch (error) {
      console.error('Error fetching historical data:', error)
      setError('Failed to load historical data')
    } finally {
      setIsLoading(false)
    }
  }

  const getPriceChangeIndicator = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="w-4 h-4 text-red-500" />
    if (current < previous) return <TrendingDown className="w-4 h-4 text-green-500" />
    return <Minus className="w-4 h-4 text-gray-500" />
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const getStatusColor = (value: number, type: 'fuel' | 'traffic' | 'demand') => {
    if (type === 'fuel') {
      if (value > 2.0) return 'text-red-500'
      if (value < 1.7) return 'text-green-500'
      return 'text-yellow-500'
    }
    
    if (type === 'traffic') {
      if (value >= 8) return 'text-red-500'
      if (value <= 3) return 'text-green-500'
      return 'text-yellow-500'
    }
    
    if (type === 'demand') {
      if (value >= 8) return 'text-blue-500'
      if (value <= 3) return 'text-gray-500'
      return 'text-blue-400'
    }
    
    return 'text-foreground'
  }

  if (!city) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {city} - Detailed Pricing History
          </DialogTitle>
          <DialogDescription>
            Last 30 pricing updates with detailed metrics and AI explanations
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
              <Skeleton className="h-96" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={fetchHistoricalData} variant="outline">
                Retry
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Current Price Multiplier
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      {historicalData[0]?.price_multiplier.toFixed(3)}x
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {historicalData[0]?.explanation}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Fuel className="w-4 h-4" />
                      Fuel Price
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${getStatusColor(historicalData[0]?.fuel_price || 0, 'fuel')}`}>
                      ₹{historicalData[0]?.fuel_price}
                    </div>
                    <p className="text-xs text-muted-foreground">per liter</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Car className="w-4 h-4" />
                      Traffic Index
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${getStatusColor(historicalData[0]?.traffic_index || 0, 'traffic')}`}>
                      {historicalData[0]?.traffic_index}/10
                    </div>
                    <p className="text-xs text-muted-foreground">current level</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Demand Level
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${getStatusColor(historicalData[0]?.demand_level || 0, 'demand')}`}>
                      {historicalData[0]?.demand_level}/10
                    </div>
                    <p className="text-xs text-muted-foreground">current level</p>
                  </CardContent>
                </Card>
              </div>

              {/* Historical Data Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pricing History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>Price Multiplier</TableHead>
                          <TableHead>Fuel Price</TableHead>
                          <TableHead>Traffic</TableHead>
                          <TableHead>Demand</TableHead>
                          <TableHead>AI Explanation</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historicalData.map((entry, index) => {
                          const previousEntry = historicalData[index + 1]
                          const priceChange = previousEntry 
                            ? getPriceChangeIndicator(entry.price_multiplier, previousEntry.price_multiplier)
                            : <Minus className="w-4 h-4 text-gray-500" />
                          
                          return (
                            <TableRow key={entry.timestamp}>
                              <TableCell className="font-mono text-sm">
                                {formatTimestamp(entry.timestamp)}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">
                                    {entry.price_multiplier.toFixed(3)}x
                                  </span>
                                  {priceChange}
                                </div>
                              </TableCell>
                              <TableCell className={getStatusColor(entry.fuel_price, 'fuel')}>
                                ₹{entry.fuel_price}
                              </TableCell>
                              <TableCell className={getStatusColor(entry.traffic_index, 'traffic')}>
                                {entry.traffic_index}/10
                              </TableCell>
                              <TableCell className={getStatusColor(entry.demand_level, 'demand')}>
                                {entry.demand_level}/10
                              </TableCell>
                              <TableCell className="max-w-xs">
                                <p className="text-sm text-muted-foreground">
                                  {entry.explanation}
                                </p>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CityDetailModal



