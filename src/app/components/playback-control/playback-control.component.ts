import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import get from 'lodash.get';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { AudioService } from '../../services/audio.service';

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

  constructor(private audio: AudioService, private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.stateSubscribtion$ = this.audio.getState().subscribe(newState => {
      this.state = newState;
      this.updateCurrentTrack();
    });

    this.seekToPosition$.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(value => this.audio.seekToPosition(value));
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

  get isPlaying() {
    return this.state && !this.state.paused;
  }

  get isShuffle() {
    return this.state && this.state.shuffle;
  }

  isNameAnimated(name) {
    return name && name.length >= 19;
  }

  isArtistAnimated(artists) {
    return artists && artists.map(({name}) => name).join('').length >= 19;
  }

  parseArtists(artists) {
    return artists && artists.reduce((acc, {name, uri}) => {
      const id = uri.match(/[^:]+$/)[0];
      return [...acc, {name, id}];
    }, []);
  }
}
