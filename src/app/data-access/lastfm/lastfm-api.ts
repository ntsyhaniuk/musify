import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { APP_ENVIRONMENT } from '../../core/tokens/environment.token';

/**
 * Last.fm bio client — Phase 2/lastfm-proxy via Netlify function when needed.
 */
@Injectable({
  providedIn: 'root',
})
export class LastfmApi {
  private readonly http = inject(HttpClient);
  private readonly env = inject(APP_ENVIRONMENT);

  protected get baseUrl(): string {
    return this.env.BASE_LASTFM_URL;
  }

  protected get client(): HttpClient {
    return this.http;
  }

  // TODO(Phase 2): artist.getInfo / album.getInfo via /api/lastfm proxy
}
