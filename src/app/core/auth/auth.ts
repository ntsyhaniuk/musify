import { Injectable, inject, signal } from '@angular/core';

import { APP_ENVIRONMENT } from '../tokens/environment.token';

/**
 * Spotify Authorization Code + PKCE — Phase 2 implementation.
 * Placeholder: exposes auth state signals for the shell.
 */
@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly env = inject(APP_ENVIRONMENT);

  readonly isAuthenticated = signal(false);
  readonly accessToken = signal<string | null>(null);

  /** Phase 2: start PKCE authorize redirect when CLIENT_ID is configured. */
  authorize(): void {
    if (!this.env.CLIENT_ID) {
      console.warn('[Auth] CLIENT_ID is empty — set it via environment before login.');
      return;
    }
    // TODO(Phase 2): PKCE authorize flow
  }

  /** Phase 2: handle OAuth callback code exchange. */
  handleCallback(_code: string): void {
    // TODO(Phase 2)
  }

  logout(): void {
    this.accessToken.set(null);
    this.isAuthenticated.set(false);
  }
}
