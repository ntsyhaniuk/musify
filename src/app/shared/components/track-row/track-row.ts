import { Component, input, output } from '@angular/core';

import { SpotifyTrackSummary } from '@app/shared/models/spotify.models';
import { formatTrackDuration } from '@app/shared/utils/format-duration';

@Component({
  selector: 'app-track-row',
  templateUrl: './track-row.html',
  styleUrl: './track-row.scss',
})
export class TrackRow {
  readonly track = input.required<SpotifyTrackSummary>();
  readonly isCurrent = input(false);
  readonly isPlaying = input(false);

  readonly playPause = output<void>();
  readonly artistNavigate = output<string>();

  protected readonly formatDuration = formatTrackDuration;

  protected onPlayPause(): void {
    this.playPause.emit();
  }

  protected onArtistNavigate(id: string | undefined): void {
    if (id) {
      this.artistNavigate.emit(id);
    }
  }
}
