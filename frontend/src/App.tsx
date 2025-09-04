import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import CityCard from './components/CityCard'
import PricingChart from './components/PricingChart'
import ScenarioControls from './components/ScenarioControls'
import CityDetailModal from './components/CityDetailModal'
import DistancePanel from './components/DistancePanel'
import RoutePlanner from './components/RoutePlanner'
import { usePricingData } from './hooks/usePricingData'
import { CityData } from './types'
import { Alert, AlertDescription } from './components/ui/alert'
import { Button } from './components/ui/button'
import { Skeleton } from './components/ui/skeleton'
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'

function App() {
  const { pricingData, history, isLoading, error, isConnected, reconnect } = usePricingData()
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

            {/* Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="logistics">Logistics</TabsTrigger>
                <TabsTrigger value="planner">Route Planner</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <motion.section
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
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
                </motion.section>
              </TabsContent>

              <TabsContent value="scenarios">
                <motion.section
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <h2 className="text-2xl font-semibold mb-4">Scenario Testing</h2>
                  <ScenarioControls />
                </motion.section>
              </TabsContent>

              <TabsContent value="history">
                <motion.section
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <h2 className="text-2xl font-semibold mb-4">Price History</h2>
                  <div className="bg-card border rounded-lg p-6">
                    {selectedCity ? (
                      <PricingChart city={selectedCity} history={history} />
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <p>Select a city to view its pricing history</p>
                      </div>
                    )}
                  </div>
                </motion.section>
              </TabsContent>

              <TabsContent value="logistics">
                <motion.section
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <h2 className="text-2xl font-semibold mb-4">Logistics Tools</h2>
                  <DistancePanel />
                </motion.section>
              </TabsContent>

              <TabsContent value="planner" className="h-full">
                <RoutePlanner />
              </TabsContent>
            </Tabs>
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
