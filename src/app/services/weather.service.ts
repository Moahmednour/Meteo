import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  visibility: number;
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
  coord: {
    lat: number;
    lon: number;
  };
}

export interface ForecastData {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      temp_min: number;
      temp_max: number;
      humidity: number;
      pressure: number;
    };
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
    wind: {
      speed: number;
      deg?: number;
    };
    dt_txt: string;
    pop: number; // Probability of precipitation
  }>;
  city: {
    id: number;
    name: string;
    country: string;
    timezone: number;
    coord: {
      lat: number;
      lon: number;
    };
  };
}

export interface AirQualityData {
  coord: {
    lon: number;
    lat: number;
  };
  list: Array<{
    main: {
      aqi: number; // Air Quality Index: 1-5 (1=Good, 5=Very Poor)
    };
    components: {
      co: number;
      no: number;
      no2: number;
      o3: number;
      so2: number;
      pm2_5: number;
      pm10: number;
      nh3: number;
    };
    dt: number;
  }>;
}

export interface UVIndexData {
  lat: number;
  lon: number;
  date_iso: string;
  date: number;
  value: number;
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiKey = 'bd5e378503939ddaee76f12ad7a97608';
  private baseUrl = 'https://api.openweathermap.org/data/2.5';

  constructor(private http: HttpClient) {}

  getCurrentWeather(city: string): Observable<WeatherData> {
    const url = `${this.baseUrl}/weather?q=${city}&appid=${this.apiKey}&units=metric`;
    return this.http.get<WeatherData>(url);
  }

  getWeatherByCoordinates(lat: number, lon: number): Observable<WeatherData> {
    const url = `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;
    return this.http.get<WeatherData>(url);
  }

  getForecast(city: string): Observable<ForecastData> {
    const url = `${this.baseUrl}/forecast?q=${city}&appid=${this.apiKey}&units=metric`;
    return this.http.get<ForecastData>(url);
  }

  getForecastByCoordinates(lat: number, lon: number): Observable<ForecastData> {
    const url = `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;
    return this.http.get<ForecastData>(url);
  }

  getAirQuality(lat: number, lon: number): Observable<AirQualityData> {
    const url = `${this.baseUrl}/air_pollution?lat=${lat}&lon=${lon}&appid=${this.apiKey}`;
    return this.http.get<AirQualityData>(url);
  }

  getUVIndex(lat: number, lon: number): Observable<UVIndexData> {
    const url = `${this.baseUrl}/uvi?lat=${lat}&lon=${lon}&appid=${this.apiKey}`;
    return this.http.get<UVIndexData>(url);
  }

  getWeatherIconUrl(icon: string): string {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
  }

  getAirQualityLevel(aqi: number): { level: string; color: string; description: string } {
    switch (aqi) {
      case 1:
        return { level: 'Good', color: '#00E400', description: 'Air quality is good. Air pollution poses little or no risk.' };
      case 2:
        return { level: 'Fair', color: '#FFFF00', description: 'Air quality is fair. Unusually sensitive people should consider reducing outdoor activities.' };
      case 3:
        return { level: 'Moderate', color: '#FF7E00', description: 'Air quality is moderate. Sensitive people should reduce outdoor activities.' };
      case 4:
        return { level: 'Poor', color: '#FF0000', description: 'Air quality is poor. Everyone should reduce outdoor activities.' };
      case 5:
        return { level: 'Very Poor', color: '#8F3F97', description: 'Air quality is very poor. Avoid outdoor activities.' };
      default:
        return { level: 'Unknown', color: '#CCCCCC', description: 'Air quality data unavailable.' };
    }
  }

  getUVLevel(uvIndex: number): { level: string; color: string; description: string } {
    if (uvIndex <= 2) {
      return { level: 'Low', color: '#289500', description: 'No protection needed. Safe to be outside.' };
    } else if (uvIndex <= 5) {
      return { level: 'Moderate', color: '#F7E400', description: 'Some protection needed. Seek shade during midday hours.' };
    } else if (uvIndex <= 7) {
      return { level: 'High', color: '#F85900', description: 'Protection needed. Reduce time in the sun 10am-4pm.' };
    } else if (uvIndex <= 10) {
      return { level: 'Very High', color: '#D8001D', description: 'Extra protection needed. Avoid sun 10am-4pm.' };
    } else {
      return { level: 'Extreme', color: '#6B49C8', description: 'Maximum protection needed. Avoid sun 10am-4pm.' };
    }
  }

  getPrecipitationChance(pop: number): string {
    if (pop === 0) return 'No chance';
    if (pop <= 0.2) return 'Low chance';
    if (pop <= 0.5) return 'Moderate chance';
    if (pop <= 0.8) return 'High chance';
    return 'Very high chance';
  }
}
