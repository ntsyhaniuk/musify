import { Component, Input } from '@angular/core';
import { state, style, transition, animate, trigger } from '@angular/animations';

import { MusicApiService } from '../../services/music-api.service';
import { AudioService } from '../../services/audio.service';
import { ITrack } from '../../types/interfaces';

@Component({
  selector: 'app-track-list',
  templateUrl: './track-list.component.html',
  styleUrls: ['./track-list.component.scss'],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        transform: 'translate3d(0, 0, 0)'
      })),
      state('out', style({
        transform: 'translate3d(100%, 0, 0)'
      })),
      transition('in => out', animate('400ms ease-in-out')),
      transition('out => in', animate('400ms ease-in-out'))
    ]),
  ]
})
export class TrackListComponent {
  @Input() tracks: ITrack[] = [];
  @Input() title: string;
  @Input() listId: string;

  isPlaylistClosed = true;
  isRandomize = false;
  isRepeatable = false;

  constructor(
    private musicApi: MusicApiService,
    private audioService: AudioService
  ) {}

  togglePlaylist() {
    this.isPlaylistClosed = !this.isPlaylistClosed;
  }

  getButtonTitle(key) {
    const props = {
      repeat: this.isRepeatable,
      random: this.isRandomize
    };
    return `Turn ${key} ${props[key] ? 'off' : 'on'}`;
  }
}
