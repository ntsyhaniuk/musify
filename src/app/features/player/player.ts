import { Injectable, signal } from '@angular/core';

/**
 * Spotify Web Playback SDK wrapper — Phase 2 (player-sdk).
 * Signal-based player state for the playback bar.
 */
@Injectable({
  providedIn: 'root',
})
export class Player {
  readonly isReady = signal(false);
  readonly isPlaying = signal(false);
  readonly position = signal(0);
  readonly duration = signal(0);
  readonly volume = signal(50);

  // TODO(Phase 2): load SDK script, connect device, wire SDK events
}
