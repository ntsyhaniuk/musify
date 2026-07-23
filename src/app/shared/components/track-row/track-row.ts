import {
  Component,
  ChangeDetectionStrategy,
  computed,
  inject,
  input,
} from '@angular/core';
import { Router } from '@angular/router';

import { Player } from '../../../features/player/player';
import { SpotifyTrackSummary } from '../../models/spotify.models';

@Component({
  selector: 'app-track-row',
  imports: [],
  templateUrl: './track-row.html',
  styleUrl: './track-row.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackRow {
  readonly track = input.required<SpotifyTrackSummary>();

  private readonly player = inject(Player);
  private readonly router = inject(Router);

  protected readonly isCurrent = computed(() => {
    const current = this.player.currentTrack();
    if (!current) {
      return false;
    }
    const uri = this.track().uri;
    return current.uri === uri || current.linkedFromUri === uri;
  });

  protected readonly isPlaying = computed(
    () => this.isCurrent() && this.player.isPlaying(),
  );

  protected playPause(): void {
    const track = this.track();
    if (this.isCurrent()) {
      this.player.togglePlay();
      return;
    }

    if (track.contextUri) {
      const offset =
        track.trackOrder !== undefined
          ? { position: track.trackOrder }
          : { uri: track.uri };
      this.player.playTrack({
        context_uri: track.contextUri,
        offset,
      });
      return;
    }

    this.player.playTrack({ uris: [track.uri] });
  }

  protected formatDuration(ms: number): string {
    if (!ms) {
      return '';
    }
    return this.player.formatTime(ms);
  }

  protected goToArtist(id: string | undefined): void {
    if (id) {
      void this.router.navigate(['/details', 'artist', id]);
    }
  }
}
