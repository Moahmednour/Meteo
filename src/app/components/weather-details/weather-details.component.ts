import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AirQualityData, UVIndexData, WeatherService } from '../../services/weather.service';

@Component({
  selector: 'app-weather-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weather-details.component.html',
  styleUrls: ['./weather-details.component.scss']
})
export class WeatherDetailsComponent {
  @Input() airQuality: AirQualityData | null = null;
  @Input() uvIndex: UVIndexData | null = null;

  constructor(private weatherService: WeatherService) {}

  getAirQualityValue(): string {
    if (!this.airQuality?.list?.[0]?.main) {
      return 'N/A';
    }
    return this.airQuality.list[0].main.aqi?.toString() || 'N/A';
  }

  getAirQualityInfo() {
    if (!this.airQuality || !this.airQuality.list[0]) {
      return { level: 'N/A', color: '#CCCCCC', description: 'Air quality data unavailable' };
    }
    return this.weatherService.getAirQualityLevel(this.airQuality.list[0].main.aqi);
  }

  getUVInfo() {
    if (!this.uvIndex) {
      return { level: 'N/A', color: '#CCCCCC', description: 'UV index data unavailable' };
    }
    return this.weatherService.getUVLevel(this.uvIndex.value);
  }

  getPM25Level(value: number): string {
    if (value <= 12) return 'Good';
    if (value <= 35) return 'Moderate';
    if (value <= 55) return 'Unhealthy for Sensitive Groups';
    if (value <= 150) return 'Unhealthy';
    if (value <= 250) return 'Very Unhealthy';
    return 'Hazardous';
  }

  getPM25Color(value: number): string {
    if (value <= 12) return '#00E400';
    if (value <= 35) return '#FFFF00';
    if (value <= 55) return '#FF7E00';
    if (value <= 150) return '#FF0000';
    if (value <= 250) return '#99004C';
    return '#7E0023';
  }

  shouldShowAirQualityWarning(): boolean {
    return !!(this.airQuality?.list?.[0]?.main?.aqi && this.airQuality.list[0].main.aqi >= 3);
  }

  shouldShowSevereAirQualityWarning(): boolean {
    return !!(this.airQuality?.list?.[0]?.main?.aqi && this.airQuality.list[0].main.aqi >= 4);
  }
}
