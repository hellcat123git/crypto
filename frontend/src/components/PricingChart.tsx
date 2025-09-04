import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp, Clock } from 'lucide-react'
import { ChartDataPoint } from '../types'

interface PricingChartProps {
  city: string
}

const PricingChart: React.FC<PricingChartProps> = ({ city }) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/pricing/history')
        if (!response.ok) {
          throw new Error('Failed to fetch historical data')
        }
        
        const data = await response.json()
        
        // Filter data for the selected city and last 5 minutes
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
        const cityData = data
          .filter((item: any) => item.city === city)
          .filter((item: any) => new Date(item.timestamp) > fiveMinutesAgo)
          .map((item: any) => ({
            time: new Date(item.timestamp).toLocaleTimeString(),
            price_multiplier: item.price_multiplier,
            fuel_price: item.fuel_price,
            traffic_index: item.traffic_index,
            demand_level: item.demand_level
          }))
          .reverse() // Show newest data on the right
        
        setChartData(cityData)
      } catch (error) {
        console.error('Error fetching historical data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistoricalData()
    
    // Refresh data every 5 seconds
    const interval = setInterval(fetchHistoricalData, 5000)
    return () => clearInterval(interval)
  }, [city])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No historical data available for {city}</p>
        <p className="text-sm">Data will appear as the system generates new pricing updates</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">{city} - Price History</h3>
          <p className="text-sm text-muted-foreground">
            Last 5 minutes of pricing data
          </p>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <TrendingUp className="w-4 h-4" />
          <span>Real-time updates</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="time" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              domain={['dataMin - 0.1', 'dataMax + 0.1']}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))'
              }}
            />
            <Legend />
            
            {/* Price Multiplier Line */}
            <Line
              type="monotone"
              dataKey="price_multiplier"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
              name="Price Multiplier"
            />
            
            {/* Fuel Price Line */}
            <Line
              type="monotone"
              dataKey="fuel_price"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 1, r: 3 }}
              name="Fuel Price (₹/L)"
            />
            
            {/* Traffic Index Line */}
            <Line
              type="monotone"
              dataKey="traffic_index"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 1, r: 3 }}
              name="Traffic Index"
            />
            
            {/* Demand Level Line */}
            <Line
              type="monotone"
              dataKey="demand_level"
              stroke="hsl(var(--chart-3))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--chart-3))', strokeWidth: 1, r: 3 }}
              name="Demand Level"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Data Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="text-2xl font-bold text-primary">
            {chartData[chartData.length - 1]?.price_multiplier.toFixed(3)}x
          </div>
          <div className="text-xs text-muted-foreground">Current Multiplier</div>
        </div>
        
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="text-2xl font-bold text-chart-1">
            ₹{chartData[chartData.length - 1]?.fuel_price}
          </div>
          <div className="text-xs text-muted-foreground">Current Fuel Price</div>
        </div>
        
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="text-2xl font-bold text-chart-2">
            {chartData[chartData.length - 1]?.traffic_index}/10
          </div>
          <div className="text-xs text-muted-foreground">Current Traffic</div>
        </div>
        
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="text-2xl font-bold text-chart-3">
            {chartData[chartData.length - 1]?.demand_level}/10
          </div>
          <div className="text-xs text-muted-foreground">Current Demand</div>
        </div>
      </div>
    </motion.div>
  )
}

export default PricingChart
