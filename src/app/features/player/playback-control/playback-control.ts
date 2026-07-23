import { Component, ChangeDetectionStrategy, ElementRef, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSliderModule } from '@angular/material/slider';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Player } from '@app/features/player/player';

/**
 * Bottom playback bar — Material used for mat-slider only.
 */
@Component({
  selector: 'app-playback-control',
  imports: [MatSliderModule],
  templateUrl: './playback-control.html',
  styleUrl: './playback-control.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaybackControl {
  protected readonly player = inject(Player);
  private readonly router = inject(Router);

  @ViewChild('trackInfo') trackInfo?: ElementRef<HTMLElement>;

  private readonly seek$ = new Subject<number>();
  private readonly volume$ = new Subject<number>();

  constructor() {
    this.seek$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((position) => this.player.seek(position));

    this.volume$
      .pipe(debounceTime(100), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((volume) => this.player.setVolume(volume));
  }

  protected onSeek(value: number): void {
    this.seek$.next(value);
  }

  protected onVolume(value: number): void {
    this.volume$.next(value);
  }

  protected isNameAnimated(name: string | undefined): boolean {
    const width = this.trackInfo?.nativeElement.offsetWidth ?? 0;
    return !!name && name.length >= width / 8;
  }

  protected isArtistAnimated(artists: { name: string }[] | undefined): boolean {
    const width = this.trackInfo?.nativeElement.offsetWidth ?? 0;
    const len = artists?.map((a) => a.name).join('').length ?? 0;
    return len >= width / 8;
  }

  protected goToArtist(artist: { id?: string; uri?: string }): void {
    const id = artist.id ?? artist.uri?.split(':').pop();
    if (id) {
      void this.router.navigate(['/details', 'artist', id]);
    }
  }

  protected goToAlbum(): void {
    const albumId = this.player.currentTrack()?.albumId;
    if (albumId) {
      void this.router.navigate(['/details', 'album', albumId]);
    }
  }
}
