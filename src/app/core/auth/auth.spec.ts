import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { APP_ENVIRONMENT } from '@app/core/tokens/environment.token';
import { Auth, SPOTIFY_SCOPES } from './auth';
import { createCodeChallenge, generateCodeVerifier } from './pkce';

describe('pkce', () => {
  it('generates a verifier of the requested length', () => {
    const verifier = generateCodeVerifier(64);
    expect(verifier.length).toBe(64);
    expect(verifier).toMatch(/^[\w.~-]+$/);
  });

  it('creates an S256 code challenge', async () => {
    const challenge = await createCodeChallenge('test-verifier');
    expect(challenge).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(challenge.includes('=')).toBe(false);
  });
});

describe('Auth', () => {
  let service: Auth;
  let storage: Record<string, string>;

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

  beforeEach(() => {
    storage = {};
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => storage[key] ?? null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      storage[key] = String(value);
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key) => {
      delete storage[key];
    });

    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: APP_ENVIRONMENT, useValue: env }],
    });
    service = TestBed.inject(Auth);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('restores tokens from storage on init when not expired', async () => {
    storage[env.STORAGE_KEY] = JSON.stringify({
      access_token: 'access',
      refresh_token: 'refresh',
      expires_at: Date.now() + 3_600_000,
    });

    await service.init();

    expect(service.isAuthenticated()).toBe(true);
    expect(service.accessToken()).toBe('access');
  });

  it('logs out and clears storage', () => {
    storage[env.STORAGE_KEY] = JSON.stringify({
      access_token: 'access',
      refresh_token: 'refresh',
      expires_at: Date.now() + 3_600_000,
    });
    service['restoreFromStorage']();
    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.accessToken()).toBeNull();
    expect(storage[env.STORAGE_KEY]).toBeUndefined();
  });

  it('skips authorize redirect when CLIENT_ID is empty', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: APP_ENVIRONMENT, useValue: { ...env, CLIENT_ID: '' } },
      ],
    });
    const auth = TestBed.inject(Auth);
    const assign = vi.fn();
    vi.stubGlobal('location', { ...window.location, assign });

    auth.authorize();

    expect(assign).not.toHaveBeenCalled();
  });

  it('includes required scopes in authorize redirect', async () => {
    const assign = vi.fn();
    vi.stubGlobal('location', {
      href: 'http://127.0.0.1:4300/',
      assign,
      search: '',
    });

    service.authorize();
    // redirect is async (challenge hash)
    await vi.waitFor(() => expect(assign).toHaveBeenCalled());

    const url = new URL(assign.mock.calls[0][0] as string);
    expect(url.origin + url.pathname).toBe(env.AUTH_URL);
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    expect(url.searchParams.get('client_id')).toBe(env.CLIENT_ID);
    for (const scope of SPOTIFY_SCOPES) {
      expect(url.searchParams.get('scope')).toContain(scope);
    }
  });

  it('exchanges code for tokens on callback', async () => {
    storage['musify_pkce_verifier'] = 'verifier';
    storage['musify_pkce_state'] = 'state-1';

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'new-access',
        refresh_token: 'new-refresh',
        expires_in: 3600,
        token_type: 'Bearer',
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(history, 'replaceState').mockImplementation(() => undefined);

    await service.handleCallback('auth-code', 'state-1');

    expect(fetchMock).toHaveBeenCalledWith(
      env.TOKEN_URL,
      expect.objectContaining({ method: 'POST' }),
    );
    expect(service.accessToken()).toBe('new-access');
    expect(service.isAuthenticated()).toBe(true);
  });

  it('refreshes access token', async () => {
    storage[env.STORAGE_KEY] = JSON.stringify({
      access_token: 'old',
      refresh_token: 'refresh',
      expires_at: Date.now() - 1,
    });
    service['restoreFromStorage']();

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'fresh',
        expires_in: 3600,
        token_type: 'Bearer',
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const token = await service.refreshAccessToken();

    expect(token).toBe('fresh');
    expect(service.accessToken()).toBe('fresh');
  });
});
