export interface CityData {
  fuel_price: number
  traffic_index: number
  demand_level: number
  price_multiplier: number
  explanation: string
  timestamp: string
}

export interface PricingData {
  [city: string]: CityData
}

export interface HistoricalData {
  city: string
  fuel_price: number
  traffic_index: number
  demand_level: number
  price_multiplier: number
  explanation: string
  timestamp: string
}

export interface ChartDataPoint {
  time: string
  price_multiplier: number
  fuel_price: number
  traffic_index: number
  demand_level: number
}

export interface ScenarioEvent {
  eventType: 'DEMAND_SURGE' | 'FUEL_SPIKE' | 'TRAFFIC_JAM' | 'GLOBAL_CRISIS'
  city: string
}

export interface ScenarioResponse {
  success: boolean
  message: string
  effects: {
    fuel_price?: number
    traffic_index?: number
    demand_level?: number
    duration: number
  }
  duration: number
}
