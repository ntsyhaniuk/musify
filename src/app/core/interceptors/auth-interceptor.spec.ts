import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { Auth } from '../auth/auth';
import { Spinner } from '../spinner/spinner';
import { APP_ENVIRONMENT } from '../tokens/environment.token';
import { authInterceptor } from './auth-interceptor';

describe('authInterceptor', () => {
  const env = {
    production: false,
    CLIENT_ID: 'test-client',
    REDIRECT_URI: 'http://127.0.0.1:4300/',
    LASTFM_API_KEY: '',
    STORAGE_KEY: 'auth_token_test',
    BASE_SPOTIFY_URL: 'https://api.spotify.com/v1',
    BASE_LASTFM_URL: 'https://ws.audioscrobbler.com/2.0',
    AUTH_URL: 'https://accounts.spotify.com/authorize',
    TOKEN_URL: 'https://accounts.spotify.com/api/token',
  };

  let http: HttpTestingController;
  let auth: { getValidAccessToken: ReturnType<typeof vi.fn>; refreshAccessToken: ReturnType<typeof vi.fn>; authorize: ReturnType<typeof vi.fn> };
  let spinner: Spinner;

  beforeEach(() => {
    auth = {
      getValidAccessToken: vi.fn().mockResolvedValue('token-1'),
      refreshAccessToken: vi.fn().mockResolvedValue('token-2'),
      authorize: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: APP_ENVIRONMENT, useValue: env },
        { provide: Auth, useValue: auth },
      ],
    });

    http = TestBed.inject(HttpTestingController);
    spinner = TestBed.inject(Spinner);
  });

  afterEach(() => {
    http.verify();
  });

  it('attaches Authorization header to Spotify requests', async () => {
    const client = TestBed.inject(HttpClient);

    const pending = firstValueFrom(client.get('https://api.spotify.com/v1/me'));
    await Promise.resolve();

    const req = http.expectOne('https://api.spotify.com/v1/me');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-1');
    req.flush({ id: 'user' });
    await pending;
    expect(spinner.isLoading()).toBe(false);
  });

  it('does not attach Authorization to non-Spotify requests', async () => {
    const client = TestBed.inject(HttpClient);

    const pending = firstValueFrom(client.get('https://example.com/api'));
    const req = http.expectOne('https://example.com/api');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
    await pending;
  });

  it('refreshes and retries on 401', async () => {
    const client = TestBed.inject(HttpClient);

    const pending = firstValueFrom(client.get('https://api.spotify.com/v1/me'));
    await Promise.resolve();

    const first = http.expectOne('https://api.spotify.com/v1/me');
    first.flush({ error: 'expired' }, { status: 401, statusText: 'Unauthorized' });
    await Promise.resolve();
    await Promise.resolve();

    const retry = http.expectOne('https://api.spotify.com/v1/me');
    expect(retry.request.headers.get('Authorization')).toBe('Bearer token-2');
    retry.flush({ id: 'user' });
    await pending;
    expect(auth.refreshAccessToken).toHaveBeenCalled();
  });
});
