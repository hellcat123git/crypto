"use client"

import { useState, useEffect } from "react"

export const AnimatedBackground = () => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-purple-950/20 to-cyan-950/30 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-purple-900/10 pointer-events-none" />
    </>
  )
}
