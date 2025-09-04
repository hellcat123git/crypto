import React from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Settings, Moon, Sun } from 'lucide-react'

interface SidebarProps {
  isDarkMode: boolean
  onToggleTheme: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isDarkMode, onToggleTheme }) => {
  return (
    <motion.aside
      className="w-64 bg-card border-r min-h-screen p-4"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-6">
        {/* Logo/Brand */}
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mx-auto mb-2 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-sm font-semibold text-muted-foreground">Pricing Simulator</h2>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          <div className="px-3 py-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Navigation
            </h3>
          </div>
          
          <motion.div
            className="flex items-center space-x-3 px-3 py-2 bg-primary/10 text-primary rounded-lg cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm font-medium">Dashboard</span>
          </motion.div>
        </nav>

        {/* Settings */}
        <div className="space-y-2">
          <div className="px-3 py-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Settings
            </h3>
          </div>
          
          <motion.button
            onClick={onToggleTheme}
            className="flex items-center space-x-3 px-3 py-2 w-full text-left hover:bg-muted rounded-lg transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isDarkMode ? (
              <>
                <Sun className="w-4 h-4" />
                <span className="text-sm">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4" />
                <span className="text-sm">Dark Mode</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Info */}
        <div className="px-3 py-2">
          <div className="text-xs text-muted-foreground space-y-1">
            <p>AI-powered dynamic pricing</p>
            <p>Real-time updates</p>
            <p>5 major cities</p>
          </div>
        </div>
      </div>
    </motion.aside>
  )
}

export default Sidebar
