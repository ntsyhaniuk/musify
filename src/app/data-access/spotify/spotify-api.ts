import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { APP_ENVIRONMENT } from '../../core/tokens/environment.token';

/**
 * Typed Spotify Web API client — Phase 2 implementation.
 */
@Injectable({
  providedIn: 'root',
})
export class SpotifyApi {
  private readonly http = inject(HttpClient);
  private readonly env = inject(APP_ENVIRONMENT);

  protected get baseUrl(): string {
    return this.env.BASE_SPOTIFY_URL;
  }

  // TODO(Phase 2): home sections, search, entity details, library URIs
  // Keep http injectable ready for resource()/HttpClient calls.
  protected get client(): HttpClient {
    return this.http;
  }
}
