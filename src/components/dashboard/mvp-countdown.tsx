"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"

import { useFounderStore } from "@/store/founder-store"

export function MvpCountdown() {
  const mvpTargetDate = useFounderStore(s => s.mvpTargetDate)
  const [timeLeft, setTimeLeft] = React.useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  React.useEffect(() => {
    // Target date: MVP Date or fallback to 30 days
    const targetDate = mvpTargetDate ? new Date(mvpTargetDate) : new Date()
    if (!mvpTargetDate) {
      targetDate.setDate(targetDate.getDate() + 30)
    }

    const timer = setInterval(() => {
      const now = new Date()
      const difference = targetDate.getTime() - now.getTime()

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        })
      } else {
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <Card className="border-2 shadow-sm overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-pixel text-info flex items-center gap-2">
          <Clock className="w-4 h-4" />
          MVP Launch Countdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mt-2">
          <div className="flex flex-col items-center">
            <span className="text-4xl md:text-5xl font-pixel text-info dark:text-info">
              {timeLeft.days.toString().padStart(2, "0")}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-pixel mt-1">Days</span>
          </div>
          <span className="text-3xl font-pixel text-muted-foreground/30 -mt-5">:</span>
          
          <div className="flex flex-col items-center">
            <span className="text-4xl md:text-5xl font-pixel text-info dark:text-info">
              {timeLeft.hours.toString().padStart(2, "0")}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-pixel mt-1">Hours</span>
          </div>
          <span className="text-3xl font-pixel text-muted-foreground/30 -mt-5">:</span>
          
          <div className="flex flex-col items-center">
            <span className="text-4xl md:text-5xl font-pixel text-info dark:text-info">
              {timeLeft.minutes.toString().padStart(2, "0")}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-pixel mt-1">Mins</span>
          </div>
          <span className="text-3xl font-pixel text-muted-foreground/30 -mt-5">:</span>
          
          <div className="flex flex-col items-center">
            <span className="text-4xl md:text-5xl font-pixel text-info dark:text-info">
              {timeLeft.seconds.toString().padStart(2, "0")}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-pixel mt-1">Secs</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
