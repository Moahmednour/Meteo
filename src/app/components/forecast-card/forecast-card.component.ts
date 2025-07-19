import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForecastData } from '../../services/weather.service';

@Component({
  selector: 'app-forecast-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './forecast-card.component.html',
  styleUrls: ['./forecast-card.component.scss']
})
export class ForecastCardComponent {
  @Input() forecastData: ForecastData | null = null;

  getWeatherIconUrl(icon: string): string {
    return `https://openweathermap.org/img/wn/${icon}.png`;
  }

  getDayName(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
  }

  getTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  getHourlyForecast() {
    if (!this.forecastData) return [];

    // Get next 24 hours (8 entries, 3-hour intervals)
    return this.forecastData.list.slice(0, 8);
  }

  getDailyForecast() {
    if (!this.forecastData) return [];

    const dailyData: any[] = [];
    const processedDays = new Set();

    this.forecastData.list.forEach(item => {
      const date = new Date(item.dt_txt);
      const dayKey = date.toDateString();

      if (!processedDays.has(dayKey)) {
        processedDays.add(dayKey);

        // Find all entries for this day to calculate min/max
        const dayEntries = this.forecastData!.list.filter(entry => {
          const entryDate = new Date(entry.dt_txt);
          return entryDate.toDateString() === dayKey;
        });

        const temps = dayEntries.map(entry => entry.main.temp);
        const minTemp = Math.min(...temps);
        const maxTemp = Math.max(...temps);

        dailyData.push({
          ...item,
          minTemp,
          maxTemp,
          dayName: this.getDayName(item.dt_txt)
        });
      }
    });

    return dailyData.slice(0, 5); // Next 5 days
  }
}
