import React from 'react'
import { motion } from 'framer-motion'

const Header: React.FC = () => {
  return (
    <header className="bg-card border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            AI Dynamic Pricing Dashboard
          </h1>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Live Indicator */}
          <motion.div
            className="flex items-center space-x-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-full"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-green-400">Live</span>
          </motion.div>
          
          {/* Last Updated */}
          <div className="text-sm text-muted-foreground">
            Updates every 5s
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
