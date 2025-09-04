import { useState, useEffect, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { PricingData } from '../types'

const SOCKET_URL = 'http://localhost:3001'

export function usePricingData() {
  const [pricingData, setPricingData] = useState<PricingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
    })

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server')
      setIsConnected(true)
      setError(null)
      setIsLoading(false)
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server')
      setIsConnected(false)
      setError('Connection lost. Attempting to reconnect...')
    })

    newSocket.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err)
      setError('Failed to connect to pricing service')
      setIsLoading(false)
    })

    newSocket.on('pricing-update', (data: PricingData) => {
      setPricingData(data)
      setError(null)
      setIsLoading(false)
    })

    setSocket(newSocket)

    // Cleanup on unmount
    return () => {
      newSocket.close()
    }
  }, [])

  // Reconnection logic
  useEffect(() => {
    if (!isConnected && socket) {
      const reconnectTimer = setTimeout(() => {
        socket.connect()
      }, 3000)

      return () => clearTimeout(reconnectTimer)
    }
  }, [isConnected, socket])

  // Manual reconnect function
  const reconnect = useCallback(() => {
    if (socket) {
      socket.connect()
    }
  }, [socket])

  return { 
    pricingData, 
    isLoading, 
    error, 
    isConnected, 
    reconnect 
  }
}
