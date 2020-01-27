import { Component, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import get from 'lodash.get';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

import { AudioService } from '../../services/audio.service';

import { parseArtists } from '../../utils/utils';

import { ITrack, IWebPlaybackState } from '../../types/interfaces';

@Component({
  selector: 'app-track',
  templateUrl: './track.component.html',
  styleUrls: ['./track.component.scss']
})
export class TrackComponent implements OnInit, OnDestroy {
  @Input() track: ITrack;

  state: IWebPlaybackState;
  stateSubscribtion$: Subscription;

  constructor(private audioService: AudioService, private zone: NgZone, private router: Router) { }

  ngOnInit() {
    this.stateSubscribtion$ = this.audioService.getState().subscribe(newState => {
      this.state = newState;
    });
  }

  get stateTrackUri() {
    const linkedUri = get(this.state, 'track_window.current_track.linked_from_uri', null);
    const trackUri = get(this.state, 'track_window.current_track.uri', null);
    return linkedUri || trackUri;
  }

  playPause() {
    if (this.track.uri === this.stateTrackUri) {
      this.audioService.togglePlay();
    } else {
      const body = this.track.contextUri.includes('artist')
        ? {
          uris: [this.track.uri]
        }
        : {
          context_uri: this.track.contextUri,
          offset: {
            uri: this.track.uri
          }
        };
      this.audioService.playTrack(body);
    }
  }

  msToMinSec(ms: number) {
    return moment(ms).format('mm:ss');
  }

  isCurrentTrack() {
    return this.track.uri === this.stateTrackUri;
  }

  isPlaying() {
    return this.isCurrentTrack() && this.state && !this.state.paused;
  }

  getArtists(artists) {
    return parseArtists(artists);
  }

  redirectTo(id) {
    this.zone.run(() => this.router.navigate([`/artists/${id}`])).then();
  }

  ngOnDestroy() {
    this.stateSubscribtion$.unsubscribe();
  }
}
