import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { Auth } from '@app/core/auth/auth';
import { APP_ENVIRONMENT } from '@app/core/tokens/environment.token';
import { Player } from './player';

describe('Player', () => {
  let player: Player;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideRouter([]),
        {
          provide: APP_ENVIRONMENT,
          useValue: {
            production: false,
            CLIENT_ID: '',
            REDIRECT_URI: 'http://127.0.0.1:4300/',
            LASTFM_API_KEY: '',
            STORAGE_KEY: 'auth_token',
            BASE_SPOTIFY_URL: 'https://api.spotify.com/v1',
            BASE_LASTFM_URL: 'https://ws.audioscrobbler.com/2.0',
            AUTH_URL: 'https://accounts.spotify.com/authorize',
            TOKEN_URL: 'https://accounts.spotify.com/api/token',
          },
        },
        {
          provide: Auth,
          useValue: {
            getValidAccessToken: vi.fn().mockResolvedValue(null),
            isAuthenticated: vi.fn().mockReturnValue(false),
          },
        },
      ],
    });
    player = TestBed.inject(Player);
  });

  it('should be created', () => {
    expect(player).toBeTruthy();
  });

  it('formats time without moment', () => {
    expect(player.formatTime(0)).toBe('0:00');
    expect(player.formatTime(65_000)).toBe('1:05');
    expect(player.formatTime(null)).toBe('0:00');
  });

  it('skips SDK init when there is no token', async () => {
    await player.init();
    expect(player.isReady()).toBe(false);
    expect(player.deviceId()).toBeNull();
  });

  it('computes visibility from current track', () => {
    expect(player.isVisible()).toBe(false);
    player.currentTrack.set({
      id: '1',
      name: 'Song',
      uri: 'spotify:track:1',
      artists: [{ name: 'A' }],
      image: null,
    });
    player.paused.set(false);
    expect(player.isVisible()).toBe(true);
    expect(player.isPlaying()).toBe(true);
    player.paused.set(true);
    expect(player.isPlaying()).toBe(false);
  });
});
