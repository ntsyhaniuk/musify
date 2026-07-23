/// <reference types="spotify-web-playback-sdk" />

import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { Auth } from '@app/core/auth/auth';
import { PlayBody, SpotifyApi } from '@app/data-access/spotify/spotify-api';
import { formatTrackDuration } from '@app/shared/utils/format-duration';

const SDK_SCRIPT_SRC = 'https://sdk.scdn.co/spotify-player.js';
const POLL_MS = 500;

export interface PlayerTrackView {
  id: string;
  name: string;
  uri: string;
  /** Present when Spotify remapped the playing track (linked_from). */
  linkedFromUri?: string | null;
  albumId?: string | null;
  artists: { id?: string; name: string; uri?: string }[];
  image: string | null;
}

/**
 * Typed Spotify Web Playback SDK wrapper with signal-based state.
 */
@Injectable({
  providedIn: 'root',
})
export class Player {
  private readonly auth = inject(Auth);
  private readonly spotify = inject(SpotifyApi);

  private sdkPlayer: Spotify.Player | null = null;
  private pollId: ReturnType<typeof setInterval> | null = null;
  private scriptLoading = false;
  private initPromise: Promise<void> | null = null;

  readonly isReady = signal(false);
  readonly deviceId = signal<string | null>(null);
  readonly paused = signal(true);
  readonly position = signal(0);
  readonly duration = signal(0);
  readonly volume = signal(100);
  readonly shuffle = signal(false);
  readonly repeatMode = signal(0);
  readonly contextUri = signal<string | null>(null);
  readonly currentTrack = signal<PlayerTrackView | null>(null);
  readonly nextTracks = signal<Spotify.Track[]>([]);
  readonly previousTracks = signal<Spotify.Track[]>([]);

  readonly isPlaying = computed(() => !!this.currentTrack() && !this.paused());
  readonly isVisible = computed(() => !!this.currentTrack());
  readonly hasNext = computed(() => this.nextTracks().length > 0);
  readonly hasPrevious = computed(() => this.previousTracks().length > 0);

  /** Start SDK once the user has a valid token. Safe to call multiple times. */
  init(): Promise<void> {
    if (this.sdkPlayer) {
      return Promise.resolve();
    }
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      const token = await this.auth.getValidAccessToken();
      if (!token) {
        this.initPromise = null;
        return;
      }
      await this.loadSdkScript();
      await this.createPlayer();
    })();

    return this.initPromise;
  }

  playTrack(body: PlayBody): void {
    const deviceId = this.deviceId();
    if (!deviceId) {
      console.warn('[Player] Device not ready');
      return;
    }
    void firstValueFrom(this.spotify.play(deviceId, body)).catch((err: unknown) =>
      console.error('[Player] play failed', err),
    );
  }

  togglePlay(): void {
    void this.sdkPlayer?.togglePlay();
  }

  nextTrack(): void {
    void this.sdkPlayer?.nextTrack();
  }

  previousTrack(): void {
    void this.sdkPlayer?.previousTrack();
  }

  seek(positionMs: number): void {
    void this.sdkPlayer?.seek(positionMs);
  }

  setVolume(percent: number): void {
    const clamped = Math.max(0, Math.min(100, percent));
    this.volume.set(clamped);
    void this.sdkPlayer?.setVolume(clamped / 100);
  }

  toggleShuffle(): void {
    const deviceId = this.deviceId();
    if (!deviceId) {
      return;
    }
    const next = !this.shuffle();
    void firstValueFrom(this.spotify.setShuffle(deviceId, next))
      .then(() => this.shuffle.set(next))
      .catch((err: unknown) => console.error('[Player] shuffle failed', err));
  }

  cycleRepeatMode(): void {
    const deviceId = this.deviceId();
    if (!deviceId) {
      return;
    }
    const current = this.repeatMode();
    const nextState: 'track' | 'context' | 'off' =
      current === 0 ? 'track' : current === 1 ? 'context' : 'off';
    void firstValueFrom(this.spotify.setRepeat(deviceId, nextState)).catch((err: unknown) =>
      console.error('[Player] repeat failed', err),
    );
  }

  formatTime(ms: number | null | undefined): string {
    return formatTrackDuration(ms);
  }

  destroy(): void {
    if (this.pollId) {
      clearInterval(this.pollId);
      this.pollId = null;
    }
    void this.sdkPlayer?.disconnect();
    this.sdkPlayer = null;
    this.initPromise = null;
    this.isReady.set(false);
  }

  private loadSdkScript(): Promise<void> {
    if (window.Spotify) {
      return Promise.resolve();
    }
    if (this.scriptLoading) {
      return new Promise((resolve) => {
        const prev = window.onSpotifyWebPlaybackSDKReady;
        window.onSpotifyWebPlaybackSDKReady = () => {
          prev?.();
          resolve();
        };
      });
    }

    this.scriptLoading = true;
    return new Promise((resolve, reject) => {
      window.onSpotifyWebPlaybackSDKReady = () => resolve();
      const script = document.createElement('script');
      script.src = SDK_SCRIPT_SRC;
      script.async = true;
      script.onerror = () => reject(new Error('Failed to load Spotify Web Playback SDK'));
      document.body.appendChild(script);
    });
  }

  private async createPlayer(): Promise<void> {
    this.sdkPlayer = new Spotify.Player({
      name: 'Musify',
      getOAuthToken: (cb) => {
        void this.auth.getValidAccessToken().then((token) => cb(token ?? ''));
      },
      volume: 1,
    });

    const logError = (e: Spotify.Error) => console.error('[Player]', e.message);

    this.sdkPlayer.addListener('initialization_error', logError);
    this.sdkPlayer.addListener('authentication_error', logError);
    this.sdkPlayer.addListener('account_error', logError);
    this.sdkPlayer.addListener('playback_error', logError);

    this.sdkPlayer.addListener('ready', ({ device_id }) => {
      this.deviceId.set(device_id);
      this.isReady.set(true);
      void firstValueFrom(this.spotify.transferPlayback(device_id, false)).catch(
        (err: unknown) => console.warn('[Player] transferPlayback', err),
      );
    });

    this.sdkPlayer.addListener('not_ready', () => {
      this.isReady.set(false);
      this.deviceId.set(null);
    });

    this.sdkPlayer.addListener('player_state_changed', (state) => {
      this.applySdkState(state);
    });

    const connected = await this.sdkPlayer.connect();
    if (!connected) {
      console.error('[Player] Failed to connect SDK player');
      return;
    }

    this.startLightPoll();
  }

  private startLightPoll(): void {
    if (this.pollId) {
      return;
    }
    // Keep volume/position fresh when SDK events are sparse.
    this.pollId = setInterval(() => {
      if (!this.sdkPlayer) {
        return;
      }
      void Promise.all([this.sdkPlayer.getVolume(), this.sdkPlayer.getCurrentState()]).then(
        ([vol, state]) => {
          if (typeof vol === 'number') {
            this.volume.set(Math.round(vol * 100));
          }
          this.applySdkState(state);
        },
      );
    }, POLL_MS);
  }

  private applySdkState(state: Spotify.PlaybackState | null): void {
    if (!state) {
      return;
    }

    this.paused.set(state.paused);
    this.position.set(state.position);
    this.duration.set(state.duration);
    this.shuffle.set(state.shuffle);
    this.repeatMode.set(state.repeat_mode);
    this.contextUri.set(state.context?.uri ?? null);
    this.nextTracks.set(state.track_window.next_tracks ?? []);
    this.previousTracks.set(state.track_window.previous_tracks ?? []);

    const track = state.track_window.current_track;
    if (!track) {
      this.currentTrack.set(null);
      return;
    }

    const images = track.album?.images ?? [];
    const albumUri = track.album?.uri;
    const linkedFrom = (
      track as Spotify.Track & { linked_from?: { uri?: string } | null }
    ).linked_from;
    this.currentTrack.set({
      id: track.id ?? '',
      name: track.name,
      uri: track.uri,
      linkedFromUri: linkedFrom?.uri ?? null,
      albumId: albumUri?.split(':').pop() ?? null,
      artists: (track.artists ?? []).map((a) => ({
        name: a.name,
        uri: a.uri,
        id: a.uri?.split(':').pop(),
      })),
      image: images[1]?.url ?? images[0]?.url ?? null,
    });
  }
}
