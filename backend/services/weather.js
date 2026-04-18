// services/weather.js — OpenWeatherMap Integration
const axios = require('axios');

// District to city mapping for OpenWeatherMap
const DISTRICT_CITIES = {
  Ayodhya: 'Ayodhya,IN',
  Mathura:  'Mathura,IN',
  Agra:     'Agra,IN',
  Delhi:    'Delhi,IN',
};

/**
 * getWeather(district)
 * Returns current weather + 5-day forecast for a district
 */
async function getWeather(district) {
  const apiKey = process.env.WEATHER_API_KEY;
  const city   = DISTRICT_CITIES[district] || `${district},IN`;

  if (!apiKey || apiKey === 'your_openweather_api_key_here') {
    // Return realistic mock data when API key not configured
    return getMockWeather(district);
  }

  try {
    const [currentRes, forecastRes] = await Promise.all([
      axios.get('https://api.openweathermap.org/data/2.5/weather', {
        params: { q: city, appid: apiKey, units: 'metric' },
        timeout: 8000,
      }),
      axios.get('https://api.openweathermap.org/data/2.5/forecast', {
        params: { q: city, appid: apiKey, units: 'metric', cnt: 5 },
        timeout: 8000,
      }),
    ]);

    const current = currentRes.data;
    const forecast = forecastRes.data.list;

    return {
      district,
      current: {
        temp:        Math.round(current.main.temp),
        feelsLike:   Math.round(current.main.feels_like),
        humidity:    current.main.humidity,
        description: current.weather[0].description,
        icon:        getWeatherEmoji(current.weather[0].main),
        windSpeed:   current.wind.speed,
      },
      forecast: forecast.map(f => ({
        date:        new Date(f.dt * 1000).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
        temp:        Math.round(f.main.temp),
        description: f.weather[0].description,
        icon:        getWeatherEmoji(f.weather[0].main),
        rain:        f.pop > 0.5, // probability of precipitation > 50%
        rainChance:  Math.round(f.pop * 100),
      })),
      source: 'live',
    };
  } catch (err) {
    console.error('Weather API error:', err.message);
    return getMockWeather(district);
  }
}

function getWeatherEmoji(main) {
  const map = {
    Clear:        '☀️',
    Clouds:       '⛅',
    Rain:         '🌧️',
    Drizzle:      '🌦️',
    Thunderstorm: '⛈️',
    Snow:         '❄️',
    Mist:         '🌫️',
    Haze:         '🌫️',
    Fog:          '🌫️',
  };
  return map[main] || '🌤️';
}

function getMockWeather(district) {
  const seasons = {
    Ayodhya: { temp: 32, desc: 'Clear sky', icon: '☀️' },
    Mathura:  { temp: 34, desc: 'Partly cloudy', icon: '⛅' },
    Agra:     { temp: 33, desc: 'Sunny', icon: '☀️' },
    Delhi:    { temp: 35, desc: 'Hazy sunshine', icon: '🌤️' },
  };
  const base = seasons[district] || { temp: 32, desc: 'Clear', icon: '☀️' };

  return {
    district,
    current: {
      temp: base.temp, feelsLike: base.temp + 2,
      humidity: 45, description: base.desc,
      icon: base.icon, windSpeed: 12,
    },
    forecast: [
      { date: 'Today',    temp: base.temp,     icon: base.icon, description: base.desc,   rain: false, rainChance: 10 },
      { date: 'Tomorrow', temp: base.temp - 1,  icon: '⛅',      description: 'Cloudy',    rain: false, rainChance: 20 },
      { date: 'Thu',      temp: base.temp - 3,  icon: '🌧️',     description: 'Heavy rain',rain: true,  rainChance: 85 },
      { date: 'Fri',      temp: base.temp - 5,  icon: '⛈️',     description: 'Thunderstorm', rain: true, rainChance: 90 },
      { date: 'Sat',      temp: base.temp - 2,  icon: '⛅',      description: 'Clearing', rain: false, rainChance: 30 },
    ],
    source: 'demo',
  };
}

module.exports = { getWeather };
