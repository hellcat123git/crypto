import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Alert, AlertDescription } from './ui/alert'
import { Badge } from './ui/badge'
import { 
  TrendingUp, 
  Fuel, 
  Car, 
  AlertTriangle, 
  CheckCircle, 
  Loader2 
} from 'lucide-react'
import { ScenarioEvent, ScenarioResponse } from '../types'

const SCENARIO_CONFIGS = {
  DEMAND_SURGE: {
    label: 'Demand Surge',
    description: 'Simulate high customer demand',
    icon: TrendingUp,
    color: 'bg-blue-500 hover:bg-blue-600',
    cities: ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai']
  },
  FUEL_SPIKE: {
    label: 'Fuel Price Spike',
    description: 'Simulate fuel cost increase',
    icon: Fuel,
    color: 'bg-orange-500 hover:bg-orange-600',
    cities: ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai']
  },
  TRAFFIC_JAM: {
    label: 'Traffic Jam',
    description: 'Simulate heavy traffic conditions',
    icon: Car,
    color: 'bg-red-500 hover:bg-red-600',
    cities: ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai']
  },
  GLOBAL_CRISIS: {
    label: 'Global Crisis',
    description: 'Simulate multiple adverse conditions',
    icon: AlertTriangle,
    color: 'bg-purple-500 hover:bg-purple-600',
    cities: ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai']
  }
}

const ScenarioControls: React.FC = () => {
  const [activeScenarios, setActiveScenarios] = useState<Map<string, { eventType: string; city: string; endTime: number }>>(new Map())
  const [loading, setLoading] = useState<string | null>(null)
  const [lastResponse, setLastResponse] = useState<ScenarioResponse | null>(null)

  const triggerScenario = async (eventType: keyof typeof SCENARIO_CONFIGS, city: string) => {
    setLoading(`${eventType}-${city}`)
    
    try {
      const response = await fetch('http://localhost:3001/api/scenario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventType, city } as ScenarioEvent),
      })

      if (!response.ok) {
        throw new Error('Failed to trigger scenario')
      }

      const data: ScenarioResponse = await response.json()
      setLastResponse(data)

      // Add to active scenarios
      const scenarioKey = `${eventType}-${city}`
      const endTime = Date.now() + data.duration
      setActiveScenarios(prev => new Map(prev.set(scenarioKey, { eventType, city, endTime })))

      // Remove from active scenarios after duration
      setTimeout(() => {
        setActiveScenarios(prev => {
          const newMap = new Map(prev)
          newMap.delete(scenarioKey)
          return newMap
        })
      }, data.duration)

    } catch (error) {
      console.error('Error triggering scenario:', error)
      setLastResponse({
        success: false,
        message: 'Failed to trigger scenario',
        effects: {},
        duration: 0
      })
    } finally {
      setLoading(null)
    }
  }

  const isScenarioActive = (eventType: string, city: string) => {
    const scenarioKey = `${eventType}-${city}`
    return activeScenarios.has(scenarioKey)
  }

  const getRemainingTime = (eventType: string, city: string) => {
    const scenarioKey = `${eventType}-${city}`
    const scenario = activeScenarios.get(scenarioKey)
    if (!scenario) return 0
    
    const remaining = Math.max(0, scenario.endTime - Date.now())
    return Math.ceil(remaining / 1000)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          Scenario Controls
        </CardTitle>
        <CardDescription>
          Trigger real-time events to test the dynamic pricing system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Last Response Alert */}
        {lastResponse && (
          <Alert variant={lastResponse.success ? "default" : "destructive"}>
            {lastResponse.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertDescription>
              {lastResponse.message}
              {lastResponse.success && lastResponse.duration > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  (Duration: {Math.ceil(lastResponse.duration / 1000)}s)
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Scenario Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(SCENARIO_CONFIGS).map(([eventType, config]) => (
            <div key={eventType} className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">
                {config.label}
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {config.cities.map((city) => {
                  const isActive = isScenarioActive(eventType, city)
                  const remainingTime = getRemainingTime(eventType, city)
                  const isLoading = loading === `${eventType}-${city}`
                  
                  return (
                    <div key={city} className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className={`flex-1 justify-start ${isActive ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''}`}
                        onClick={() => triggerScenario(eventType as keyof typeof SCENARIO_CONFIGS, city)}
                        disabled={isLoading || isActive}
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <config.icon className="w-4 h-4 mr-2" />
                        )}
                        {city}
                        {isActive && (
                          <Badge variant="secondary" className="ml-auto">
                            {remainingTime}s
                          </Badge>
                        )}
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Active Scenarios Summary */}
        {activeScenarios.size > 0 && (
          <div className="pt-4 border-t">
            <h4 className="font-medium text-sm text-muted-foreground mb-2">
              Active Scenarios
            </h4>
            <div className="flex flex-wrap gap-2">
              {Array.from(activeScenarios.entries()).map(([key, scenario]) => {
                const remainingTime = getRemainingTime(scenario.eventType, scenario.city)
                return (
                  <Badge key={key} variant="outline" className="bg-green-50 dark:bg-green-950">
                    {SCENARIO_CONFIGS[scenario.eventType as keyof typeof SCENARIO_CONFIGS]?.label} in {scenario.city}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {remainingTime}s left
                    </span>
                  </Badge>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ScenarioControls



