import { Injectable, signal } from '@angular/core';

/** Blurred album-art background for the app shell. */
@Injectable({
  providedIn: 'root',
})
export class Background {
  readonly backgroundUrl = signal<string | null>(null);

  setBackground(url: string | null): void {
    this.backgroundUrl.set(url);
  }
}
