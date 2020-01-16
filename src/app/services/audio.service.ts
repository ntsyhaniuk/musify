import { Injectable } from '@angular/core';

import { Observable, BehaviorSubject } from 'rxjs';
import * as moment from 'moment';

import { IWebPlaybackState } from '../types/interfaces';
import { AuthService } from './auth.service';
import { HttpMethods, HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class AudioService {

  constructor(private auth: AuthService, private http$: HttpService) {
    this.initSpotifyWebSDK();
  }

  private player: any;
  private deviceId: string;
  private updateStateInterval: number;
  private state: IWebPlaybackState = {
    paused: true,
    position: 0,
    repeat_mode: 0,
    shuffle: false,
    context: {
      uri: null
    },
    track_window: {
      current_track: null,
      previous_tracks: null,
      next_tracks: null
    }
  };

  private stateChange: BehaviorSubject<IWebPlaybackState> = new BehaviorSubject(this.state);

  initSpotifyWebSDK() {
    (window as any).onSpotifyWebPlaybackSDKReady = () => {
      const token = this.auth.getSessionKey();

      const errorHandler = ({message}) => console.log(message);
      const stateHandler = state => {
        if (!state) return;
        this.stateChange.next(state);
      };

      this.player = new (window as any).Spotify.Player({
        name: 'Musify',
        getOAuthToken(cb) {cb(token); }
      });
      this.player.addListener('account_error', errorHandler);
      this.player.addListener('playback_error', errorHandler);
      this.player.addListener('authentication_error', errorHandler);
      this.player.addListener('initialization_error', errorHandler);
      this.player.addListener('not_ready', ({ device_id }) => { console.log('Device ID has gone offline', device_id); });
      this.player.addListener('ready', ({ device_id }) => this.deviceId = device_id);
      this.player.addListener('player_state_changed', stateHandler.bind(this));

      this.updateStateInterval = setInterval(() => {
        this.player.getCurrentState().then(stateHandler);
      }, 500);

      this.player.connect();
    };

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    document.body.appendChild(script);
  }

  playTrack(body) {
    const params = {
      body,
      httpMethod: HttpMethods.PUT,
      endpoint: 'me/player/play',
      queryParams: {
        device_id: this.deviceId
      }
    };

    return this.http$.request(params);
  }

  togglePlay() {
    this.player.togglePlay();
  }

  formatTime(time: number, format: string = 'mm:ss') {
    const momentTime = time * 1000;
    return moment.utc(momentTime).format(format);
  }

  getState(): Observable<IWebPlaybackState> {
    return this.stateChange.asObservable();
  }
}
