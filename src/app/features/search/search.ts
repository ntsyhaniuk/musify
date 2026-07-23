import { Component, ChangeDetectionStrategy, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, debounceTime, filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { SearchState } from '@app/core/search/search-state';

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
  /** Last value pushed to `input$`; used to reset the stream on external clear. */
  private lastPushed = '';
  protected readonly draft = signal('');

  constructor() {
    effect(() => {
      const query = this.searchState.query();
      this.draft.set(query);
      // Logo clear only resets SearchState; also reset the Subject so the same query can re-fire.
      if (query === '' && this.lastPushed !== '') {
        this.pushInput('');
      }
    });

    this.input$
      .pipe(
        debounceTime(400),
        // Compare to committed query (not prior emission) so logo clear allows the same string again
        // even if '' was swallowed by debounce before the next keystrokes.
        filter((value) => value.trim() !== this.searchState.query()),
        takeUntilDestroyed(),
      )
      .subscribe((value) => {
        this.searchState.setQuery(value);
        if (value && !this.router.url.startsWith('/?') && this.router.url !== '/') {
          void this.router.navigateByUrl('/');
        }
      });
  }

  protected onInput(value: string): void {
    this.draft.set(value);
    this.pushInput(value);
  }

  protected clear(): void {
    this.draft.set('');
    this.pushInput('');
    this.searchState.clear();
  }

  private pushInput(value: string): void {
    this.lastPushed = value;
    this.input$.next(value);
  }
}
