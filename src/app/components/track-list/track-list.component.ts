import { Component, Input, OnChanges } from '@angular/core';
import { state, style, transition, animate, trigger } from '@angular/animations';

import { SpotifyApiService } from '../../services/spotify.service';
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
export class TrackListComponent implements OnChanges {
  @Input() tracks: ITrack[] = [];
  @Input() title: string;
  @Input() listId: string;

  private isPlaylistClosed = true;
  private isRandomize = false;

  constructor(
    private spotifyService: SpotifyApiService,
    private audioService: AudioService
  ) {}

  ngOnChanges() {
    this.audioService.setListData(this.listId, this.tracks);
  }

  togglePlaylist() {
    this.isPlaylistClosed = !this.isPlaylistClosed;
  }

  toggleRandomize() {
    this.isRandomize = !this.isRandomize;
    this.audioService.randomize(this.isRandomize);
  }
}
