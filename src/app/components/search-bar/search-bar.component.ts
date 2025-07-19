import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { AutocompleteService, CitySearchResult } from '../../services/autocomplete.service';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit, OnDestroy {
  @Output() search = new EventEmitter<{ city: string, lat?: number, lon?: number }>();
  @Output() locationRefresh = new EventEmitter<void>();

  searchQuery = '';
  suggestions: CitySearchResult[] = [];
  showSuggestions = false;
  isLoading = false;

  private searchSubject = new Subject<string>();
  private subscription: Subscription = new Subscription();

  constructor(private autocompleteService: AutocompleteService) {}

  ngOnInit(): void {
    // Set up autocomplete with debounce
    this.subscription.add(
      this.searchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(query => {
          if (query.length >= 2) {
            this.isLoading = true;
            return this.autocompleteService.searchCities(query);
          } else {
            return this.autocompleteService.searchCities(''); // Returns popular cities
          }
        })
      ).subscribe({
        next: (results) => {
          this.suggestions = results;
          this.showSuggestions = true;
          this.isLoading = false;
        },
        error: () => {
          this.suggestions = [];
          this.showSuggestions = false;
          this.isLoading = false;
        }
      })
    );

    // Load initial popular cities
    this.loadPopularCities();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onInputChange(): void {
    this.searchSubject.next(this.searchQuery);
  }

  onFocus(): void {
    if (this.suggestions.length > 0) {
      this.showSuggestions = true;
    } else {
      this.loadPopularCities();
    }
  }

  onBlur(): void {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  selectSuggestion(city: CitySearchResult): void {
    this.searchQuery = city.name;
    this.showSuggestions = false;
    this.search.emit({
      city: city.name,
      lat: city.lat,
      lon: city.lon
    });
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.showSuggestions = false;
      this.search.emit({ city: this.searchQuery.trim() });
    }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearch();
    } else if (event.key === 'Escape') {
      this.showSuggestions = false;
    }
  }

  onLocationClick(): void {
    this.locationRefresh.emit();
    this.showSuggestions = false;
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.showSuggestions = false;
    this.loadPopularCities();
  }

  private loadPopularCities(): void {
    this.suggestions = this.autocompleteService.getPopularCities().slice(0, 6);
    this.showSuggestions = true;
  }

  getCityDisplayName(city: CitySearchResult): string {
    if (city.state) {
      return `${city.name}, ${city.state}, ${city.country}`;
    }
    return `${city.name}, ${city.country}`;
  }
}
