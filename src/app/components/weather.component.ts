import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WeatherService, WeatherData, ForecastData, AirQualityData } from '../services/weather.service';
import { LocationService, Location } from '../services/location.service';
import { WeatherCardComponent } from './weather-card/weather-card.component';
import { ForecastCardComponent } from './forecast-card/forecast-card.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { WeatherDetailsComponent } from './weather-details/weather-details.component';

@Component({
  selector: 'app-weather',
  standalone: true,
  imports: [CommonModule, FormsModule, WeatherCardComponent, ForecastCardComponent, SearchBarComponent, WeatherDetailsComponent],
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.scss']
})
export class WeatherComponent implements OnInit {
  currentWeather: WeatherData | null = null;
  forecast: ForecastData | null = null;
  airQuality: AirQualityData | null = null;
  uvIndex: any = null; // Using any for UV data
  isLoading = false;
  error: string | null = null;
  searchQuery = '';
  showDetails = false;

  constructor(
    private weatherService: WeatherService,
    private locationService: LocationService
  ) {}

  ngOnInit(): void {
    this.loadUserLocationWeather();
  }

  loadUserLocationWeather(): void {
    this.isLoading = true;
    this.error = null;

    this.locationService.getCurrentLocation().subscribe({
      next: (location: Location) => {
        this.loadWeatherByCoordinates(location.latitude, location.longitude);
      },
      error: (error) => {
        console.error('Error getting location:', error);
        // Fallback to default city
        this.loadWeatherByCity('London');
      }
    });
  }

  loadWeatherByCoordinates(lat: number, lon: number): void {
    this.weatherService.getWeatherByCoordinates(lat, lon).subscribe({
      next: (data: WeatherData) => {
        this.currentWeather = data;
        this.loadForecastByCoordinates(lat, lon);
        this.loadAirQuality(lat, lon);
        this.loadUVIndex(lat, lon);
      },
      error: (error) => {
        console.error('Error loading weather:', error);
        this.error = 'Failed to load weather data. Please try again.';
        this.isLoading = false;
      }
    });
  }

  loadForecastByCoordinates(lat: number, lon: number): void {
    this.weatherService.getForecastByCoordinates(lat, lon).subscribe({
      next: (data: ForecastData) => {
        this.forecast = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading forecast:', error);
        this.isLoading = false;
      }
    });
  }

  loadWeatherByCity(city: string): void {
    if (!city.trim()) return;

    this.isLoading = true;
    this.error = null;

    this.weatherService.getCurrentWeather(city).subscribe({
      next: (data: WeatherData) => {
        this.currentWeather = data;
        this.loadForecastByCity(city);
        // Load additional data using coordinates
        this.loadAirQuality(data.coord.lat, data.coord.lon);
        this.loadUVIndex(data.coord.lat, data.coord.lon);
      },
      error: (error) => {
        console.error('Error loading weather:', error);
        this.error = 'City not found. Please check the spelling and try again.';
        this.isLoading = false;
      }
    });
  }

  loadAirQuality(lat: number, lon: number): void {
    this.weatherService.getAirQuality(lat, lon).subscribe({
      next: (data: AirQualityData) => {
        this.airQuality = data;
      },
      error: (error) => {
        console.error('Error loading air quality:', error);
        // Don't set main error since this is optional data
      }
    });
  }

  loadUVIndex(lat: number, lon: number): void {
    this.weatherService.getUVIndex(lat, lon).subscribe({
      next: (data: any) => {
        this.uvIndex = data;
      },
      error: (error) => {
        console.error('Error loading UV index:', error);
        // Don't set main error since this is optional data
      }
    });
  }

  loadForecastByCity(city: string): void {
    this.weatherService.getForecast(city).subscribe({
      next: (data: ForecastData) => {
        this.forecast = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading forecast:', error);
        this.isLoading = false;
      }
    });
  }

  onSearch(searchData: { city: string, lat?: number, lon?: number }): void {
    this.searchQuery = searchData.city;
    if (searchData.lat && searchData.lon) {
      // Use coordinates if available (more accurate)
      this.loadWeatherByCoordinates(searchData.lat, searchData.lon);
    } else {
      // Fallback to city name search
      this.loadWeatherByCity(searchData.city);
    }
  }

  onRefresh(): void {
    if (this.currentWeather) {
      this.loadWeatherByCity(this.currentWeather.name);
    } else {
      this.loadUserLocationWeather();
    }
  }

  onLocationRefresh(): void {
    this.loadUserLocationWeather();
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }
}
