import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { state, style, transition, animate, trigger } from '@angular/animations';
import * as moment from 'moment';

import { SpotifyApiService } from '../../services/spotify.service';
import { AudioService } from '../../services/audio.service';
import { ITrack, StreamState } from '../../types/interfaces';
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
  public isPlaylistClosed = true;
  public state: StreamState;
  public currentTrack: ITrack;

  constructor(
    private spotifyService: SpotifyApiService,
    private audioService: AudioService
  ) {}

  ngOnInit() {
    this.audioService.getState().subscribe(newState => this.state = newState);
  }

  ngOnChanges() {
    const audioID = this.audioService.getAudioID();
    const serviceTracks: ITrack[] = this.audioService.getTrackList();
    if (serviceTracks.length && isEqual(this.tracks, serviceTracks)) {
      return this.tracks = serviceTracks;
    }
    this.tracks = this.tracks
      .filter(track => track)
      .map(track => {
        if (audioID === track.id) {
          this.currentTrack = track;
          track.isPlaying = true;
        }
        return track;
      });
  }

  playStream(track: ITrack) {
    this.currentTrack = track;
    this.audioService.playStream(track, this.tracks).subscribe((event: Event) => {
      if (event.type === 'ended') {
        // setting track list when switching between albums
        const trackId = this.audioService.getAudioID();
        this.currentTrack = this.tracks.find(resTrack => resTrack.id === trackId);
        this.tracks = this.audioService.getTrackList();
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
    this.stopOtherTracks();
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
    this.currentTrack.isPlaying = false;
    this.audioService.stop();
  }

  stopOtherTracks() {
    this.tracks.map(track => {
      track.isPlaying = false;
    });
  }

  onSliderTimeChanged(change) {
    this.audioService.rewindTo(change.value);
  }

  togglePlaylist() {
    this.isPlaylistClosed = !this.isPlaylistClosed;
  }

  displayMillisecInMinSec(ms: number) {
    return moment(ms).format('m:ss');
  }

  playNextTrack() {
    const currentTrackNumber = this.currentTrack.track_number;
    const nextTrack = this.tracks.find(track => track.track_number - 1 === currentTrackNumber);
    const isTrackListEnd = this.tracks.length === currentTrackNumber;
    this.stop();
    if (isTrackListEnd) return;
    this.play(nextTrack);
  }
}
