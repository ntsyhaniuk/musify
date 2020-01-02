import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { AudioService } from '../../services/audio.service';
import { IStreamState, ITrack } from '../../types/interfaces';
import { Subscription } from 'rxjs';
import * as moment from 'moment';

@Component({
  selector: 'app-track',
  templateUrl: './track.component.html',
  styleUrls: ['./track.component.scss']
})
export class TrackComponent implements OnInit, OnDestroy {
  @Input() track: ITrack;

  private state: IStreamState;
  private stateSubscribtion$: Subscription;

  constructor(private audioService: AudioService) { }

  ngOnInit() {
    this.stateSubscribtion$ = this.audioService.getState().subscribe(newState => {
      this.state = newState;
    });
  }

  playPause(track: ITrack) {
    if (track.isPlaying) {
      this.pause(track);
    } else {
      this.play(track);
    }
  }

  play(track: ITrack) {
    this.audioService.play(track);
  }

  pause(track: ITrack) {
    this.audioService.pause(track);
  }

  onSliderTimeChanged(change) {
    this.audioService.rewindTo(change.value);
  }

  msToMinSec(ms: number) {
    return moment(ms).format('m:ss');
  }

  isPlaying(track) {
    const { currentId, playing } = this.state;
    return playing && track.id === currentId;
  }

  ngOnDestroy() {
    this.stateSubscribtion$.unsubscribe();
  }
}
