import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { state, style, transition, animate, trigger } from '@angular/animations';
import * as moment from 'moment';

import { SpotifyApiService } from '../../services/spotify.service';
import { AudioService } from '../../services/audio.service';
import { ITrack, IStreamState } from '../../types/interfaces';
import { isEqual } from '../../utils/utils';

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
export class TrackListComponent implements OnInit, OnChanges {
  @Input() tracks: ITrack[] = [];
  @Input() title: string;
  @Input() listId: string;
  public isPlaylistClosed = true;
  public state: IStreamState;
  public currentTrack: ITrack;

  constructor(
    private spotifyService: SpotifyApiService,
    private audioService: AudioService
  ) {}

  ngOnInit() {
    this.audioService.getState().subscribe(newState => this.state = newState);
  }

  ngOnChanges() {
    const previousListId = this.audioService.getListId();

    this.tracks = this.tracks.filter(track => track);
    if (previousListId === this.listId) {
      const audioID = this.audioService.getAudioID();

      this.tracks.forEach(track => {
        if (track.id === audioID) {
          track.isPlaying = true;
          this.currentTrack = track;
        }
      });
    }

  }

  playStream(track: ITrack) {
    this.currentTrack = track;
    this.audioService.playStream(track, this.listId).subscribe((event: Event) => {
      if (event.type === 'ended') {
        this.playNextTrack();
      }
    });
  }

  playPause(track: ITrack) {
    if (track.isPlaying) {
      this.pause(track);
    } else {
      this.play(track);
    }
  }

  pause(track: ITrack) {
    track.isPlaying = false;
    this.audioService.pause();
  }

  play(track: ITrack) {
    const id = this.audioService.getAudioID();
    track.isPlaying = true;
    if (id === track.id) {
      this.audioService.play();
    } else {
      if (this.currentTrack) {
        this.currentTrack.isPlaying = false;
      }
      this.playStream(track);
    }
  }

  stop() {
    // this.currentTrack.isPlaying = false;
    const id = this.audioService.getAudioID();
    this.tracks.forEach(track => {
      if (track.id === id) {
        track.isPlaying = false;
      }
    });
    this.audioService.stop();
  }

  onSliderTimeChanged(change) {
    this.audioService.rewindTo(change.value);
  }

  togglePlaylist() {
    this.isPlaylistClosed = !this.isPlaylistClosed;
  }

  msToMinSec(ms: number) {
    return moment(ms).format('m:ss');
  }

  playNextTrack() {
    const currentTrackOrder = this.currentTrack.trackOrder;
    const nextTrack = this.tracks.find(track => track.trackOrder - 1 === currentTrackOrder);
    const isTrackListEnd = this.tracks.length === currentTrackOrder;
    this.stop();
    if (isTrackListEnd) return;
    this.play(nextTrack);
  }
}
