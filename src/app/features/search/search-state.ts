import { Injectable, signal } from '@angular/core';

/** Shared search query so navbar search drives the home hub. */
@Injectable({
  providedIn: 'root',
})
export class SearchState {
  readonly query = signal('');

  setQuery(value: string): void {
    this.query.set(value.trim());
  }

  clear(): void {
    this.query.set('');
  }
}
