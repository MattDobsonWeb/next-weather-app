import React from "react";
import cities from "../../lib/city.list.json";
import TodaysWeather from "../../components/TodaysWeather";
import HourlyWeather from "../../components/HourlyWeather";
import WeeklyWeather from "../../components/WeeklyWeather";
import Link from "next/link";
import Head from "next/head";
import SearchBox from "../../components/SearchBox";

export async function getServerSideProps(context) {
  const city = getCityId(context.params.city);

  if (!city) {
    return {
      notFound: true,
    };
  }

  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${city.coord.lat}&lon=${city.coord.lon}&appid=${process.env.API_KEY}&exclude=minutely&units=metric`
  );

  const data = await res.json();

  if (!data) {
    return {
      notFound: true,
    };
  }

  const hourlyWeather = getHourlyWeather(data.hourly);

  const weeklyWeather = data.daily;

  return {
    props: {
      city: city,
      currentWeather: data.current,
      hourlyWeather: hourlyWeather,
      weeklyWeather: weeklyWeather,
    }, // will be passed to the page component as props
  };
}

const getCityId = (param) => {
  const cityParam = param.trim();
  // get the id of the city
  const splitCity = cityParam.split("-");
  const id = splitCity[splitCity.length - 1];

  if (!id) {
    return null;
  }

  const city = cities.find((city) => city.id.toString() == id);

  if (city) {
    return city;
  } else {
    return null;
  }
};

const getHourlyWeather = (hourlyData) => {
  const current = new Date();
  current.setHours(current.getHours(), 0, 0, 0);
  const tomorrow = new Date(current);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  // divide by 1000 to get timestamps in seconds
  const currentTimeStamp = Math.floor(current.getTime() / 1000);
  const tomorrowTimeStamp = Math.floor(tomorrow.getTime() / 1000);

  const todaysData = hourlyData.filter((data) => data.dt < tomorrowTimeStamp);

  return todaysData;
};

export default function City({
  city,
  weather,
  currentWeather,
  hourlyWeather,
  weeklyWeather,
}) {
  return (
    <>
      <Head>
        <title>{city.name} Weather - Next Weather App</title>
      </Head>

      <div className="page-wrapper">
        <div className="container">
          <Link href="/">
            <a className="back-link">&larr; Home</a>
          </Link>
          <SearchBox placeholder="Search for another location..." />
          <TodaysWeather city={city} weather={weeklyWeather[0]} />
          <HourlyWeather hourlyWeather={hourlyWeather} />
          <WeeklyWeather weeklyWeather={weeklyWeather} />
        </div>
      </div>
    </>
  );
}
