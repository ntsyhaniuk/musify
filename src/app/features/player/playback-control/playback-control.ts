import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatSliderModule } from '@angular/material/slider';

import { Player } from '../player';

/**
 * Bottom playback bar — Phase 2 (player-sdk) wires SDK state.
 * Material is used for mat-slider only.
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
}
