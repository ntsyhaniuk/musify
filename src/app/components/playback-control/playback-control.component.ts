import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import get from 'lodash.get';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { AudioService } from '../../services/audio.service';

import { parseArtists } from '../../utils/utils';

import { IWebPlaybackState } from '../../types/interfaces';

@Component({
  selector: 'app-playing-control',
  templateUrl: './playback-control.component.html',
  styleUrls: ['./playback-control.component.scss']
})
export class PlaybackControlComponent implements OnInit {

  currentTrack: any;
  state: IWebPlaybackState;
  stateSubscribtion$: Subscription;
  seekToPosition$: Subject<number> = new Subject<number>();
  volumeLevel$: BehaviorSubject<number> = new BehaviorSubject<number>(100);

  constructor(private audio: AudioService, private cd: ChangeDetectorRef, private router: Router, private zone: NgZone) {}

  ngOnInit() {
    this.stateSubscribtion$ = this.audio.getState().subscribe(newState => {
      this.state = newState;
      this.updateCurrentTrack();
    });

    this.seekToPosition$.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(value => this.audio.seekToPosition(value));

    this.volumeLevel$.subscribe(value => this.audio.changeVolume(value));
  }

  get isPlaying() {
    return this.state && !this.state.paused;
  }

  get isShuffle() {
    return this.state && this.state.shuffle;
  }

  get isNextAvailable() {
    return !!get(this.state, 'track_window.next_tracks', []).length;
  }

  get isPreviousAvailable() {
    return !!get(this.state, 'track_window.previous_tracks', []).length;
  }

  get isPlaybackVisible() {
    return !!get(this.state, 'track_window.current_track', null);
  }

  getVolumeIcon(val) {
    const between = (value, min, max) => min < value && value <= max;
    return ({
      'ion-ios-volume-high': between(val, 50, 100),
      'ion-ios-volume-low': between(val, 0, 50),
      'ion-ios-volume-off': val === 0
    });
  }

  updateCurrentTrack() {
    const stateTrack = get(this.state, 'track_window.current_track', null);
    if (stateTrack) {
      this.currentTrack = {
        name: stateTrack.name,
        uri: stateTrack.uri,
        artists: stateTrack.artists,
        image: stateTrack.album.images[1].url
      };
      this.cd.detectChanges();
    }
  }

  togglePlay() {
    this.audio.togglePlay();
  }

  toggleShuffle() {
    this.audio.toggleShuffle(!this.isShuffle);
  }

  nextTrack() {
    this.audio.prevOrNext('next');
  }

  previousTrack() {
    this.audio.prevOrNext('previous');
  }

  formatTime(time) {
    return this.audio.formatTime(time);
  }

  isNameAnimated(name, { offsetWidth }) {
    return name && name.length >= offsetWidth / 8; // 8 - pixels per symbol
  }

  isArtistAnimated(artists, { offsetWidth }) {
    return artists && artists.map(({name}) => name).join('').length >= offsetWidth / 8; // 8 - pixels per symbol
  }

  redirectTo(id) {
    this.zone.run(() => this.router.navigate([`/artists/${id}`])).then();
  }

  toggleRepeatMode(value) {
    const options = {
      0: 'track',
      1: 'context',
      2: 'off'
    };

    this.audio.toggleRepeatMode(options[value]);
  }

  parseArtists(artists) {
    return parseArtists(artists);
  }
}
