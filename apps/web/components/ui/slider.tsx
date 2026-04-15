"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
  value: number[]
  onValueChange?: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  className?: string
}

function Slider({ 
  value, 
  onValueChange, 
  min = 0, 
  max = 100, 
  step = 1,
  className 
}: SliderProps) {
  const currentValue = value[0] ?? min
  
  const percentage = ((currentValue - min) / (max - min)) * 100

  return (
    <div className={cn("relative w-full", className)}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue}
        onChange={(e) => onValueChange?.([parseFloat(e.target.value)])}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
        <div 
          className="absolute h-full bg-primary rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div 
        className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-background border-2 border-primary rounded-full shadow-md transition-all pointer-events-none"
        style={{ left: `calc(${percentage}% - 10px)` }}
      />
    </div>
  )
}

export { Slider }
