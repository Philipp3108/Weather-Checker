import React from 'react'
import { FiDroplet } from 'react-icons/fi'
import { ImMeter } from 'react-icons/im'
import { LuEye, LuSunrise, LuSunset } from 'react-icons/lu'
import { MdAir } from 'react-icons/md'
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface WeatherDetailProps {
  visibility: string
  humidity: string
  windSpeed: string
  airPressure: string
  sunrise: string
  sunset: string
  className?: string
}

export default function WeatherDetails(props: WeatherDetailProps) {
  const {
    visibility = '10km',
    humidity = '85%',
    windSpeed = '4 km/h',
    airPressure = '1016 hPa',
    sunrise = '6:20',
    sunset = '18:48',
    className=""
  } = props

  return (
    <>
      <SingleWeatherDetail className={className} information="Visibility" icon={<LuEye />} value={visibility} />
      <SingleWeatherDetail className={className} information="Humidity" icon={<FiDroplet />} value={humidity} />
      <SingleWeatherDetail className={className} information="Wind Speed" icon={<MdAir />} value={windSpeed} />
      <SingleWeatherDetail className={className} information="Air Pressure" icon={<ImMeter />} value={airPressure} />
      <SingleWeatherDetail className={className} information="Sunrise" icon={<LuSunrise />} value={sunrise} />
      <SingleWeatherDetail className={className} information="Sunset" icon={<LuSunset />} value={sunset} />
    </>
  )
}

export interface SingleWeatherDetailProps {
  information: string
  icon: React.ReactNode
  value: string
  className?: string
}

function SingleWeatherDetail(props: SingleWeatherDetailProps) {
  return (
    <div
      className={cn(
        'flex flex-col justify-between gap-2 items-center text-xs font-semibold text-white/80',
        props.className
      )}
    >
      <p className="whitespace-nowrap">{props.information}</p>
      <div className="text-3xl">{props.icon}</div>
      <p>{props.value}</p>
    </div>
  )
}
