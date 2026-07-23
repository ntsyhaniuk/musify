import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { APP_ENVIRONMENT } from '@app/core/tokens/environment.token';
import { createCodeChallenge, generateCodeVerifier, generateRandomState } from './pkce';

export interface StoredTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

const PKCE_VERIFIER_KEY = 'musify_pkce_verifier';
const PKCE_STATE_KEY = 'musify_pkce_state';

/** Scopes needed for library hub, search, playback, and library follow/save. */
export const SPOTIFY_SCOPES = [
  'streaming',
  'user-read-email',
  'user-follow-read',
  'user-read-private',
  'user-read-playback-state',
  'user-read-currently-playing',
  'user-modify-playback-state',
  'user-read-recently-played',
  'user-library-read',
  'user-library-modify',
  'playlist-read-private',
  'playlist-read-collaborative',
] as const;

/**
 * Spotify Authorization Code + PKCE.
 * Token exchange/refresh uses `fetch` (not HttpClient) to avoid interceptor cycles.
 */
@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly env = inject(APP_ENVIRONMENT);
  private readonly router = inject(Router);

  readonly isAuthenticated = signal(false);
  readonly accessToken = signal<string | null>(null);

  private refreshToken: string | null = null;
  private expiresAt = 0;
  private refreshInFlight: Promise<string | null> | null = null;

  /** Restore session, handle OAuth callback, or start login when needed. */
  async init(): Promise<void> {
    this.restoreFromStorage();

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');
    const state = params.get('state');

    if (error) {
      console.error('[Auth] Spotify authorize error:', error);
      this.clearPkceSession();
      this.stripAuthParamsFromUrl();
      return;
    }

    if (code) {
      await this.handleCallback(code, state);
      return;
    }

    if (this.isAuthenticated() && this.isExpired()) {
      const token = await this.refreshAccessToken();
      if (!token) {
        this.authorize();
      }
      return;
    }

    if (!this.isAuthenticated()) {
      this.authorize();
    }
  }

  /** Start PKCE authorize redirect when CLIENT_ID is configured. */
  authorize(): void {
    if (!this.env.CLIENT_ID) {
      console.warn('[Auth] CLIENT_ID is empty — set it via environment before login.');
      return;
    }

    if (this.isAuthenticated() && !this.isExpired()) {
      return;
    }

    void this.redirectToSpotify();
  }

  /** Exchange authorization code for tokens (PKCE). */
  async handleCallback(code: string, returnedState: string | null = null): Promise<void> {
    const expectedState = sessionStorage.getItem(PKCE_STATE_KEY);
    const verifier = sessionStorage.getItem(PKCE_VERIFIER_KEY);

    if (!verifier) {
      console.error('[Auth] Missing PKCE verifier — restarting login.');
      this.clearPkceSession();
      this.stripAuthParamsFromUrl();
      this.authorize();
      return;
    }

    if (expectedState && returnedState !== expectedState) {
      console.error('[Auth] OAuth state mismatch — possible CSRF. Restarting login.');
      this.clearPkceSession();
      this.stripAuthParamsFromUrl();
      this.logout();
      this.authorize();
      return;
    }

    try {
      const tokens = await this.exchangeCode(code, verifier);
      this.applyTokens(tokens);
      this.clearPkceSession();
      this.stripAuthParamsFromUrl();
      await this.router.navigateByUrl('/');
    } catch (err) {
      console.error('[Auth] Code exchange failed:', err);
      this.clearPkceSession();
      this.stripAuthParamsFromUrl();
      this.logout();
    }
  }

  /** Return a valid access token, refreshing if expired or near expiry. */
  async getValidAccessToken(): Promise<string | null> {
    if (!this.accessToken()) {
      return null;
    }
    if (!this.isExpired(60_000)) {
      return this.accessToken();
    }
    return this.refreshAccessToken();
  }

  /** Sync getter for interceptors that already ensured freshness. */
  getAccessToken(): string | null {
    return this.accessToken();
  }

  logout(): void {
    this.accessToken.set(null);
    this.refreshToken = null;
    this.expiresAt = 0;
    this.isAuthenticated.set(false);
    localStorage.removeItem(this.env.STORAGE_KEY);
  }

  private async redirectToSpotify(): Promise<void> {
    const verifier = generateCodeVerifier();
    const challenge = await createCodeChallenge(verifier);
    const state = generateRandomState();

    sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier);
    sessionStorage.setItem(PKCE_STATE_KEY, state);

    const params = new URLSearchParams({
      client_id: this.env.CLIENT_ID,
      response_type: 'code',
      redirect_uri: this.env.REDIRECT_URI,
      scope: SPOTIFY_SCOPES.join(' '),
      code_challenge_method: 'S256',
      code_challenge: challenge,
      state,
    });

    window.location.assign(`${this.env.AUTH_URL}?${params.toString()}`);
  }

  private async exchangeCode(code: string, verifier: string): Promise<TokenResponse> {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.env.REDIRECT_URI,
      client_id: this.env.CLIENT_ID,
      code_verifier: verifier,
    });

    return this.postToken(body);
  }

  async refreshAccessToken(): Promise<string | null> {
    if (!this.refreshToken || !this.env.CLIENT_ID) {
      this.logout();
      return null;
    }

    if (this.refreshInFlight) {
      return this.refreshInFlight;
    }

    this.refreshInFlight = (async () => {
      try {
        const body = new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken!,
          client_id: this.env.CLIENT_ID,
        });
        const tokens = await this.postToken(body);
        this.applyTokens(tokens);
        return this.accessToken();
      } catch (err) {
        console.error('[Auth] Refresh failed:', err);
        this.logout();
        return null;
      } finally {
        this.refreshInFlight = null;
      }
    })();

    return this.refreshInFlight;
  }

  private async postToken(body: URLSearchParams): Promise<TokenResponse> {
    const res = await fetch(this.env.TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Token request failed (${res.status}): ${text}`);
    }

    return res.json() as Promise<TokenResponse>;
  }

  private applyTokens(tokens: TokenResponse): void {
    const refresh = tokens.refresh_token ?? this.refreshToken;
    if (!refresh) {
      throw new Error('No refresh_token available');
    }

    const stored: StoredTokens = {
      access_token: tokens.access_token,
      refresh_token: refresh,
      expires_at: Date.now() + tokens.expires_in * 1000,
    };

    this.accessToken.set(stored.access_token);
    this.refreshToken = stored.refresh_token;
    this.expiresAt = stored.expires_at;
    this.isAuthenticated.set(true);
    localStorage.setItem(this.env.STORAGE_KEY, JSON.stringify(stored));
  }

  private restoreFromStorage(): void {
    const raw = localStorage.getItem(this.env.STORAGE_KEY);
    if (!raw) {
      return;
    }

    try {
      const stored = JSON.parse(raw) as StoredTokens;
      if (!stored.access_token || !stored.refresh_token || !stored.expires_at) {
        this.logout();
        return;
      }
      this.accessToken.set(stored.access_token);
      this.refreshToken = stored.refresh_token;
      this.expiresAt = stored.expires_at;
      this.isAuthenticated.set(true);
    } catch {
      this.logout();
    }
  }

  private isExpired(skewMs = 0): boolean {
    return !this.expiresAt || Date.now() + skewMs >= this.expiresAt;
  }

  private clearPkceSession(): void {
    sessionStorage.removeItem(PKCE_VERIFIER_KEY);
    sessionStorage.removeItem(PKCE_STATE_KEY);
  }

  private stripAuthParamsFromUrl(): void {
    const url = new URL(window.location.href);
    url.searchParams.delete('code');
    url.searchParams.delete('state');
    url.searchParams.delete('error');
    window.history.replaceState({}, document.title, url.pathname + url.hash);
  }
}
