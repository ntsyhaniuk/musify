import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';

export interface LastfmArtistInfoResponse {
  artist?: {
    name?: string;
    bio?: { content?: string; summary?: string };
  };
}

export interface LastfmAlbumInfoResponse {
  album?: {
    name?: string;
    wiki?: { content?: string; summary?: string };
  };
}

/**
 * Last.fm bio client — always goes through `/api/lastfm` (Netlify function)
 * so the API key never ships in the browser bundle.
 */
@Injectable({
  providedIn: 'root',
})
export class LastfmApi {
  private readonly http = inject(HttpClient);
  private readonly proxyUrl = '/api/lastfm';

  getArtistBio(artist: string): Observable<string> {
    const params = new HttpParams().set('method', 'artist.getInfo').set('artist', artist);
    return this.http.get<LastfmArtistInfoResponse>(this.proxyUrl, { params }).pipe(
      map((res) => scrubBio(res.artist?.bio?.content || res.artist?.bio?.summary || '')),
      catchError(() => of('')),
    );
  }

  getAlbumBio(artist: string, album: string): Observable<string> {
    const params = new HttpParams()
      .set('method', 'album.getInfo')
      .set('artist', artist)
      .set('album', album);
    return this.http.get<LastfmAlbumInfoResponse>(this.proxyUrl, { params }).pipe(
      map((res) => scrubBio(res.album?.wiki?.content || res.album?.wiki?.summary || '')),
      catchError(() => of('')),
    );
  }
}

/** Last.fm bios append a trailing `<a href=...>` attribution — strip it. */
export function scrubBio(raw: string): string {
  return raw.replace(/<a[\s\S]*/i, '').replace(/<[^>]+>/g, '').trim();
}
