'use client'

import Container from "@/components/Container";
import ForecastWeatherDetail from "@/components/ForecastWeatherDetail";
import Navbar from "@/components/Navbar";
import WeatherDetails from "@/components/WeatherDetails";
import WeatherIcon from "@/components/WeatherIcon";
import { metersToKilometers } from "@/utils/metersToKilometers";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format, fromUnixTime, parseISO } from "date-fns";
import { useAtom } from "jotai";
import { loadingCityAtom, placeAtom } from "./atom";
import { useEffect } from "react";

interface WeatherDetail {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    sea_level: number;
    grnd_level: number;
    humidity: number;
    temp_kf: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  clouds: {
    all: number;
  };
  wind: {
    speed: number;
    deg: number;
    gust: number;
  };
  visibility: number;
  pop: number;
  rain?: {
    "3h": number;
  };
  sys: {
    pod: string;
  };
  dt_txt: string;
};

interface WeatherData {
  cod: string;
  message: number;
  cnt: number;
  list: WeatherDetail[];
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
};


export default function Page() {
  const [place, setPlace] = useAtom(placeAtom)
  const [loadingCity, setLoadingCity] = useAtom(loadingCityAtom)

  const { isPending, error, data, refetch } = useQuery<WeatherData>({
    queryKey: ['repoData'],
    queryFn: async () => {
      const {data} = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${place}&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}&units=metric&cnt=56`)
      return data
      }
    }
  )

  useEffect(() => {
    refetch()
  }, [place, refetch])

  const firstData = data?.list[0]

  console.log("data", data)

  const uniqueDates = [
      ...new Set(
        data?.list.map(
          (entry) => new Date(entry.dt * 1000).toISOString().split("T")[0]
        )
      )
    ]

  const days = uniqueDates.map((date) => ({
    date,
    entries:
      data?.list.filter((entry) => {
        const entryDate = new Date(entry.dt * 1000).toISOString().split("T")[0];
        return entryDate === date;
      }) ?? [],
  }));

  console.log("days", days)

  const firstDataForEachDate = uniqueDates.map((date) => {
    return data?.list.find((entry) => {
      const entryDate = new Date(entry.dt * 1000).toISOString().split("T")[0]
      const entryTime = new Date(entry.dt * 1000).getHours()
      return entryDate === date && entryTime >= 6
    })
  })

  if (isPending) return (
    <div className="flex items-center min-h-screen justify-center">
      <p className="animate-bounce">Loading...</p>
    </div>
  )

  return (
    <div className="flex flex-col gap-4 bg-[#303338] min-h-screen">
      <Navbar location={data?.city.name ?? ""} />
      <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4">
        {loadingCity ? <WeatherSkeleton /> :
        <>
        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="flex gap-1 text-2xl items-end text-white">
              <p>{format(parseISO(firstData?.dt_txt ?? ''),'EEEE')}</p>
              <p className="text-lg">({format(parseISO(firstData?.dt_txt ?? ''),'dd.MM.yyyy')})</p>
            </h2>
            <Container className="bg-[#00E1FF] gap-10 px-6 items-center text-black border-gray-500">
              <div className="flex flex-col px-4">
                <span className="text-5xl">
                  {Math.round(firstData?.main.temp ?? 0)}°C
                </span>
                <p className="text-sm space-x-1 whitespace-nowrap">
                  <span> Feels like</span>
                  <span>{Math.round(firstData?.main.feels_like ?? 0)}°C</span>
                </p>
                <p className="text-sm space-x-2">
                  <span>
                    {Math.round(firstData?.main.temp_min ?? 0)}°↓ {" "}
                  </span>
                  <span>
                    {" "} {Math.round(firstData?.main.temp_max ?? 0)}°↑ 
                  </span>
                </p>
              </div>
              <div className="flex gap-10 sm:gap-16 overflow-x-auto w-full justify-between pr-3">
                {data?.list.slice(0,8).map((d, i) => 
                  <div key={i} className="flex flex-col justify-between gap-2 items-center text-xs font-semibold pb-2">
                    <p className="whitespace-nowrap">
                      {format(parseISO(d.dt_txt),'H:mm')}
                    </p>
                    <WeatherIcon iconName={d.weather[0].icon} />
                    <p>{Math.round(d?.main.temp ?? 0)}°C</p>
                  </div>
                )}
              </div>
            </Container>
          </div>
          <div className="flex gap-4">
            <Container className="bg-[#00E1FF] w-fit justify-center flex-col px-4 items-center text-black border-gray-500">
                <p className="capitalize text-center">{firstData?.weather[0].description}</p>
                <WeatherIcon iconName={firstData?.weather[0].icon ?? ""} />
            </Container>
            <Container className="bg-[#00E1FF] border-gray-500 px-6 gap-4 justify-between overflow-x-auto w-full">
                <WeatherDetails className="text-black" visibility={metersToKilometers(firstData?.visibility??10000)} humidity={`${firstData?.main.humidity??80}%`} windSpeed={`${Math.round(firstData?.wind.speed??4)} km/h`} airPressure={`${firstData?.main.pressure} hPa`} sunrise={format(fromUnixTime(data?.city.sunrise ?? 1757825436), "H:mm")} sunset={format(fromUnixTime(data?.city.sunset ?? 1757871188), "H:mm")} />
            </Container>
          </div>
        </section>

        <section className="flex w-full flex-col gap-4">
          <p className="text-2xl text-white">Forecast (7 Days)</p>

          {days.map((day, i) => {
            const head = day.entries[0];
            if (!head) return null;

            return (
              <Container
                key={i}
                className="text-white border-gray-500 px-6 py-4 gap-6 justify-between items-center w-full"
              >
                <div className="flex items-center gap-4 min-w-[220px]">
                  <WeatherIcon iconName={head.weather[0]?.icon ?? "01d"} />
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold">
                      {format(parseISO(head.dt_txt), "EEEE")}
                    </span>
                    <span className="text-sm opacity-80">
                      {format(parseISO(head.dt_txt), "dd.MM.yyyy")}
                    </span>
                  </div>
                </div>

                <div className="flex gap-10 sm:gap-16 overflow-x-auto w-full justify-between pr-3">
                  {day.entries.slice(0, 8).map((d, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col justify-between gap-2 items-center text-xs font-semibold"
                    >
                      <p className="whitespace-nowrap">{format(parseISO(d.dt_txt), "H:mm")}</p>
                      <WeatherIcon iconName={d.weather[0].icon} />
                      <p className="pb-2">{Math.round(d.main.temp)}°C</p>
                    </div>
                  ))}
                </div>
              </Container>
            );
          })}
        </section>

        </>
        }
      </main>
    </div>
  );
}

function WeatherSkeleton() {
  return (
    <section className="space-y-8 ">
      <div className="space-y-2 animate-pulse">
        <div className="flex gap-1 text-2xl items-end ">
          <div className="h-6 w-24 bg-gray-300 rounded"></div>
          <div className="h-6 w-24 bg-gray-300 rounded"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="flex flex-col items-center space-y-2">
              <div className="h-6 w-16 bg-gray-300 rounded"></div>
              <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
              <div className="h-6 w-16 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 animate-pulse">
        <p className="text-2xl h-8 w-36 bg-gray-300 rounded"></p>

        {[1, 2, 3, 4, 5, 6, 7].map((index) => (
          <div key={index} className="grid grid-cols-2 md:grid-cols-4 gap-4 ">
            <div className="h-8 w-28 bg-gray-300 rounded"></div>
            <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
            <div className="h-8 w-28 bg-gray-300 rounded"></div>
            <div className="h-8 w-28 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>
    </section>
  );
}