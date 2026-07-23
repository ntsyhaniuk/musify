import { Component, ChangeDetectionStrategy, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { SearchState } from './search-state';

/**
 * Debounced Spotify search input in the navbar.
 */
@Component({
  selector: 'app-search',
  imports: [],
  templateUrl: './search.html',
  styleUrl: './search.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Search {
  private readonly searchState = inject(SearchState);
  private readonly router = inject(Router);

  private readonly input$ = new Subject<string>();
  protected readonly draft = signal('');

  constructor() {
    effect(() => {
      this.draft.set(this.searchState.query());
    });

    this.input$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((value) => {
        this.searchState.setQuery(value);
        if (value && !this.router.url.startsWith('/?') && this.router.url !== '/') {
          void this.router.navigateByUrl('/');
        }
      });
  }

  protected onInput(value: string): void {
    this.draft.set(value);
    this.input$.next(value);
  }

  protected clear(): void {
    this.draft.set('');
    this.input$.next('');
    this.searchState.clear();
  }
}
