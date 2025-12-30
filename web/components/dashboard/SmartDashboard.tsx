'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  Thermometer, 
  Wind, 
  Droplets,
  AlertTriangle,
  Heart,
  Leaf,
  Activity,
  Clock,
  ChevronRight
} from 'lucide-react'
import { useLocationStore } from '@/lib/store/locationStore'

// Weather-based health tips
const WEATHER_TIPS = {
  hot: [
    { icon: '💧', title: 'Stay Hydrated', tip: 'Drink at least 3-4 liters of water today. Add ORS or lemon water.' },
    { icon: '🧢', title: 'Avoid Sun Exposure', tip: 'Stay indoors between 12 PM - 4 PM. Wear light cotton clothes.' },
    { icon: '🥒', title: 'Eat Light', tip: 'Have fruits like watermelon, cucumber. Avoid heavy meals.' },
  ],
  cold: [
    { icon: '🍵', title: 'Warm Beverages', tip: 'Start your day with warm water. Have ginger tea or kadha.' },
    { icon: '🧥', title: 'Layer Up', tip: 'Wear warm clothes, especially cover your chest and feet.' },
    { icon: '🏃', title: 'Stay Active', tip: 'Do light exercise to maintain body warmth and immunity.' },
  ],
  rainy: [
    { icon: '☔', title: 'Stay Dry', tip: 'Avoid getting wet. Change clothes immediately if drenched.' },
    { icon: '🦟', title: 'Mosquito Protection', tip: 'Use repellents. Remove stagnant water near your home.' },
    { icon: '🍲', title: 'Eat Fresh', tip: 'Avoid street food. Eat freshly cooked warm meals.' },
  ],
  polluted: [
    { icon: '😷', title: 'Wear Mask', tip: 'Use N95 mask when going outside. AQI is unhealthy.' },
    { icon: '🏠', title: 'Stay Indoors', tip: 'Keep windows closed. Use air purifier if available.' },
    { icon: '🫁', title: 'Breathing Exercises', tip: 'Practice deep breathing indoors to clear lungs.' },
  ],
}

interface WeatherData {
  temp: number
  condition: 'sunny' | 'cloudy' | 'rainy' | 'cold'
  humidity: number
  aqi: number
  aqiLevel: 'good' | 'moderate' | 'unhealthy' | 'hazardous'
}

interface HealthReminder {
  id: string
  time: string
  title: string
  description: string
  icon: string
  completed: boolean
}

export function SmartDashboard() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [greeting, setGreeting] = useState('')
  const [tips, setTips] = useState<typeof WEATHER_TIPS.hot>([])
  const [reminders, setReminders] = useState<HealthReminder[]>([])
  const { address } = useLocationStore()

  useEffect(() => {
    // Set greeting based on time
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 17) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')

    // Mock weather data (in production, fetch from OpenWeatherMap API)
    const mockWeather: WeatherData = {
      temp: 32,
      condition: 'sunny',
      humidity: 65,
      aqi: 156,
      aqiLevel: 'unhealthy',
    }
    setWeather(mockWeather)

    // Set tips based on weather
    if (mockWeather.aqiLevel === 'unhealthy' || mockWeather.aqiLevel === 'hazardous') {
      setTips(WEATHER_TIPS.polluted)
    } else if (mockWeather.temp > 35) {
      setTips(WEATHER_TIPS.hot)
    } else if (mockWeather.temp < 15) {
      setTips(WEATHER_TIPS.cold)
    } else if (mockWeather.condition === 'rainy') {
      setTips(WEATHER_TIPS.rainy)
    } else {
      setTips(WEATHER_TIPS.hot) // Default
    }

    // Mock daily reminders
    setReminders([
      {
        id: '1',
        time: '08:00 AM',
        title: 'Morning Water',
        description: 'Drink a glass of warm water',
        icon: '💧',
        completed: hour >= 9,
      },
      {
        id: '2',
        time: '10:00 AM',
        title: 'Eye Break',
        description: '20-20-20 rule: Look 20ft away for 20 seconds',
        icon: '👁️',
        completed: hour >= 11,
      },
      {
        id: '3',
        time: '01:00 PM',
        title: 'Post-Lunch Walk',
        description: 'Take a 10-minute walk after lunch',
        icon: '🚶',
        completed: false,
      },
    ])
  }, [])

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="w-8 h-8 text-amber-500" />
      case 'cloudy': return <Cloud className="w-8 h-8 text-gray-500" />
      case 'rainy': return <CloudRain className="w-8 h-8 text-blue-500" />
      default: return <Sun className="w-8 h-8 text-amber-500" />
    }
  }

  const getAQIColor = (level: string) => {
    switch (level) {
      case 'good': return 'text-green-600 bg-green-100'
      case 'moderate': return 'text-yellow-600 bg-yellow-100'
      case 'unhealthy': return 'text-orange-600 bg-orange-100'
      case 'hazardous': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      {/* Greeting Card with Weather */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-sky-500 via-sky-400 to-emerald-400 rounded-2xl p-6 text-white shadow-xl"
      >
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-1">{greeting}! ☀️</h2>
            <p className="text-sky-100 text-sm">
              Here's your personalized health update for today
            </p>
            {address && (
              <p className="text-sky-100 text-xs mt-1 flex items-center gap-1">
                📍 {address}
              </p>
            )}
          </div>
          {weather && (
            <div className="text-right">
              <div className="flex items-center gap-2">
                {getWeatherIcon(weather.condition)}
                <span className="text-3xl font-bold">{weather.temp}°C</span>
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs text-sky-100">
                <span className="flex items-center gap-1">
                  <Droplets className="w-3 h-3" />
                  {weather.humidity}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* AQI Warning */}
        {weather && (weather.aqiLevel === 'unhealthy' || weather.aqiLevel === 'hazardous') && (
          <div className="mt-4 flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <AlertTriangle className="w-5 h-5 text-yellow-300" />
            <div className="flex-1">
              <p className="font-medium text-sm">Air Quality Alert</p>
              <p className="text-xs text-sky-100">AQI {weather.aqi} - {weather.aqiLevel.toUpperCase()}</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAQIColor(weather.aqiLevel)}`}>
              {weather.aqi}
            </span>
          </div>
        )}
      </motion.div>

      {/* Health Tips Based on Weather */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-lg"
      >
        <div className="flex items-center gap-2 mb-4">
          <Leaf className="w-5 h-5 text-emerald-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Today's Health Tips</h3>
        </div>

        <div className="space-y-3">
          {tips.map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-xl"
            >
              <span className="text-2xl">{tip.icon}</span>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{tip.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{tip.tip}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Daily Health Reminders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-sky-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Daily Reminders</h3>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {reminders.filter(r => r.completed).length}/{reminders.length} done
          </span>
        </div>

        <div className="space-y-2">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                reminder.completed 
                  ? 'bg-emerald-50 dark:bg-emerald-900/20' 
                  : 'bg-gray-50 dark:bg-slate-700'
              }`}
            >
              <span className="text-xl">{reminder.icon}</span>
              <div className="flex-1">
                <p className={`font-medium ${
                  reminder.completed 
                    ? 'text-emerald-700 dark:text-emerald-300 line-through' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {reminder.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {reminder.time} • {reminder.description}
                </p>
              </div>
              {reminder.completed && (
                <span className="text-emerald-500">✓</span>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick Health Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 gap-4"
      >
        <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-4 text-white">
          <Heart className="w-6 h-6 mb-2" />
          <p className="text-2xl font-bold">72 bpm</p>
          <p className="text-rose-200 text-xs">Avg. Heart Rate</p>
        </div>
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-4 text-white">
          <Activity className="w-6 h-6 mb-2" />
          <p className="text-2xl font-bold">6,240</p>
          <p className="text-violet-200 text-xs">Steps Today</p>
        </div>
      </motion.div>
    </div>
  )
}

// Compact weather widget for sidebar
export function WeatherWidget() {
  return (
    <div className="bg-gradient-to-r from-sky-400 to-sky-500 rounded-xl p-3 text-white flex items-center gap-3">
      <Sun className="w-8 h-8" />
      <div>
        <p className="font-bold">32°C</p>
        <p className="text-xs text-sky-100">Sunny • AQI 156</p>
      </div>
    </div>
  )
}

