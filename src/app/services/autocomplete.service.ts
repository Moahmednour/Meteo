import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, debounceTime, switchMap, catchError } from 'rxjs/operators';

export interface CitySearchResult {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

@Injectable({
  providedIn: 'root'
})
export class AutocompleteService {
  private apiKey = 'bd5e378503939ddaee76f12ad7a97608';
  private geoUrl = 'https://api.openweathermap.org/geo/1.0';

  // Popular cities for quick suggestions
  private popularCities: CitySearchResult[] = [
    { name: 'London', country: 'GB', lat: 51.5074, lon: -0.1278 },
    { name: 'New York', country: 'US', state: 'NY', lat: 40.7128, lon: -74.0060 },
    { name: 'Tokyo', country: 'JP', lat: 35.6762, lon: 139.6503 },
    { name: 'Paris', country: 'FR', lat: 48.8566, lon: 2.3522 },
    { name: 'Sydney', country: 'AU', lat: -33.8688, lon: 151.2093 },
    { name: 'Dubai', country: 'AE', lat: 25.2048, lon: 55.2708 },
    { name: 'Singapore', country: 'SG', lat: 1.3521, lon: 103.8198 },
    { name: 'Los Angeles', country: 'US', state: 'CA', lat: 34.0522, lon: -118.2437 },
    { name: 'Berlin', country: 'DE', lat: 52.5200, lon: 13.4050 },
    { name: 'Mumbai', country: 'IN', lat: 19.0760, lon: 72.8777 }
  ];

  constructor(private http: HttpClient) {}

  searchCities(query: string): Observable<CitySearchResult[]> {
    if (!query || query.length < 2) {
      return of(this.popularCities.slice(0, 5));
    }

    // First check popular cities for quick matches
    const popularMatches = this.popularCities.filter(city =>
      city.name.toLowerCase().includes(query.toLowerCase()) ||
      city.country.toLowerCase().includes(query.toLowerCase())
    );

    if (popularMatches.length > 0) {
      return of(popularMatches.slice(0, 5));
    }

    // If no popular matches, search via API
    const url = `${this.geoUrl}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${this.apiKey}`;

    return this.http.get<any[]>(url).pipe(
      map(results => results.map(result => ({
        name: result.name,
        country: result.country,
        state: result.state,
        lat: result.lat,
        lon: result.lon
      }))),
      catchError(() => of([]))
    );
  }

  getPopularCities(): CitySearchResult[] {
    return this.popularCities;
  }
}
