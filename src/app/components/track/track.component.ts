import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import get from 'lodash.get';

import { AudioService } from '../../services/audio.service';
import { ITrack, IWebPlaybackState } from '../../types/interfaces';
import { Subscription } from 'rxjs';
import * as moment from 'moment';

@Component({
  selector: 'app-track',
  templateUrl: './track.component.html',
  styleUrls: ['./track.component.scss']
})
export class TrackComponent implements OnInit, OnDestroy {
  @Input() track: ITrack;

  state: IWebPlaybackState;
  stateSubscribtion$: Subscription;

  constructor(private audioService: AudioService) { }

  ngOnInit() {
    this.stateSubscribtion$ = this.audioService.getNewState().subscribe(newState => {
      this.state = newState;
    });
  }

  playPause() {
    const stateUri = get(this.state, 'track_window.current_track.uri', null);
    if (this.track.uri === stateUri) {
      this.audioService.togglePlay();
    } else {
      this.audioService.playTrack(this.track.uri).subscribe();
    }
  }

  msToMinSec(ms: number) {
    return moment(ms).format('m:ss');
  }

  isCurrentTrack() {
    return this.track.id === get(this.state, 'track_window.current_track.id', null);
  }

  isPlaying() {
    return this.state && !this.state.paused;
  }

  ngOnDestroy() {
    this.stateSubscribtion$.unsubscribe();
  }
}
