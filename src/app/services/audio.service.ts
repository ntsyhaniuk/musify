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

  public player: any;
  private newState: IWebPlaybackState = {
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

  private newStateChange: BehaviorSubject<IWebPlaybackState> = new BehaviorSubject(this.newState);

  initSpotifyWebSDK() {
    (window as any).onSpotifyWebPlaybackSDKReady = () => {
      const token = this.auth.getSessionKey();

      const errorHandler = ({message}) => console.log(message);

      this.player = new (window as any).Spotify.Player({
        name: 'Musify',
        getOAuthToken(cb: (token: string) => void): void {
          cb(token);
        }
      });
      this.player.addListener('account_error', errorHandler);
      this.player.addListener('playback_error', errorHandler);
      this.player.addListener('authentication_error', errorHandler);
      this.player.addListener('initialization_error', errorHandler);
      this.player.addListener('not_ready', ({ device_id }) => { console.log('Device ID has gone offline', device_id); });
      this.player.addListener('player_state_changed', this.newStateChange.next.bind(this));

      setInterval(() => {
        this.player.getCurrentState().then(state => {
          if (!state) return;
          this.newStateChange.next(state);
        });
      }, 500);

      this.player.connect();
    };

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    document.body.appendChild(script);
  }

  playTrack(body) {
    const {id} = this.player._options;

    const params = {
      body,
      httpMethod: HttpMethods.PUT,
      endpoint: 'me/player/play',
      queryParams: {
        device_id: id
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

  getNewState(): Observable<IWebPlaybackState> {
    return this.newStateChange.asObservable();
  }
}
