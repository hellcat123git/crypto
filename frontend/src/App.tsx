import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import CityCard from './components/CityCard'
import PricingChart from './components/PricingChart'
import ScenarioControls from './components/ScenarioControls'
import CityDetailModal from './components/CityDetailModal'
import { usePricingData } from './hooks/usePricingData'
import { CityData } from './types'
import { Alert, AlertDescription } from './ui/alert'
import { Button } from './ui/button'
import { Skeleton } from './ui/skeleton'
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react'

function App() {
  const { pricingData, isLoading, error, isConnected, reconnect } = usePricingData()
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [detailCity, setDetailCity] = useState<string | null>(null)

  // Set dark mode by default
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  const handleCitySelect = (city: string) => {
    setSelectedCity(city)
  }

  const handleViewDetails = (city: string) => {
    setDetailCity(city)
    setShowDetailModal(true)
  }

  const closeDetailModal = () => {
    setShowDetailModal(false)
    setDetailCity(null)
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  // Connection lost alert
  if (!isConnected && !isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <WifiOff className="h-4 w-4" />
          <AlertDescription className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Real-time connection lost</h2>
              <p>Unable to connect to the pricing service. The system will attempt to reconnect automatically.</p>
            </div>
            <Button onClick={reconnect} variant="outline" className="w-full">
              <Wifi className="w-4 h-4 mr-2" />
              Reconnect Now
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Loading state with skeletons
  if (isLoading || !pricingData) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="flex">
          <Sidebar isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 p-6 space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">City Pricing Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-48 rounded-lg" />
                  ))}
                </div>
              </section>
              <section>
                <h2 className="text-2xl font-semibold mb-4">Price History</h2>
                <Skeleton className="h-96 rounded-lg" />
              </section>
            </main>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <Header />
          
          {/* Main Dashboard */}
          <main className="flex-1 p-6 space-y-6">
            {/* Connection Status */}
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                {isConnected ? 'Connected' : 'Connecting...'}
              </span>
            </div>

            {/* City Cards Grid */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">City Pricing Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {pricingData && Object.entries(pricingData).map(([city, data]) => (
                  <CityCard
                    key={city}
                    city={city}
                    data={data}
                    isSelected={selectedCity === city}
                    onSelect={() => handleCitySelect(city)}
                    onViewDetails={() => handleViewDetails(city)}
                    isLoading={isLoading}
                  />
                ))}
              </div>
            </section>

            {/* Scenario Controls */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Scenario Testing</h2>
              <ScenarioControls />
            </section>

            {/* Real-time Chart */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Price History</h2>
              <div className="bg-card border rounded-lg p-6">
                {selectedCity ? (
                  <PricingChart city={selectedCity} />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>Select a city to view its pricing history</p>
                  </div>
                )}
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* City Detail Modal */}
      <CityDetailModal
        isOpen={showDetailModal}
        onClose={closeDetailModal}
        city={detailCity}
      />
    </div>
  )
}

export default App
