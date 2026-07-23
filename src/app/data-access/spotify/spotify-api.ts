import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';

import { APP_ENVIRONMENT } from '../../core/tokens/environment.token';
import {
  SpotifyAlbum,
  SpotifyArtist,
  SpotifyEntity,
  SpotifyEntityType,
  SpotifyFollowedArtistsResponse,
  SpotifyHomeSection,
  SpotifyPaging,
  SpotifyPlayHistoryItem,
  SpotifyPlaylist,
  SpotifySavedAlbum,
  SpotifySearchResponse,
  SpotifyTrack,
  SpotifyUserProfile,
  playlistItemTrack,
  playlistItemsPaging,
  toListItemFromAlbum,
  toListItemFromArtist,
  toListItemFromPlaylist,
  toTrackSummary,
  SpotifyTrackSummary,
} from '../../shared/models/spotify.models';

const SEARCH_LIMIT = 10;
const HOME_LIMIT = 15;

export interface SearchParams {
  q: string;
  offset?: number;
  limit?: number;
  types?: Array<'album' | 'artist' | 'playlist' | 'track'>;
}

export interface PlayBody {
  context_uri?: string;
  uris?: string[];
  offset?: { position?: number; uri?: string };
  position_ms?: number;
}

/**
 * Typed Spotify Web API client (post–Feb 2026 endpoints).
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

  getCurrentUser(): Observable<SpotifyUserProfile> {
    return this.http.get<SpotifyUserProfile>(`${this.baseUrl}/me`);
  }

  /** Home hub sections replacing browse categories / new-releases. */
  getHomeSections(limit = HOME_LIMIT): Observable<SpotifyHomeSection[]> {
    return forkJoin({
      artists: this.getFollowedArtists(limit),
      playlists: this.getMyPlaylists(limit),
      recentlyPlayed: this.getRecentlyPlayed(limit),
      savedAlbums: this.getSavedAlbums(limit),
      freshAlbums: this.getFreshAlbums(Math.min(limit, SEARCH_LIMIT)),
    }).pipe(
      map(({ artists, playlists, recentlyPlayed, savedAlbums, freshAlbums }) => {
        const recentItems = recentlyPlayed.items
          .map((h) => h.track?.album)
          .filter((album): album is NonNullable<typeof album> => !!album)
          .filter((album, index, arr) => arr.findIndex((a) => a.id === album.id) === index)
          .slice(0, limit)
          .map(toListItemFromAlbum);

        return [
          {
            key: 'artists',
            title: 'Followed artists',
            items: artists.artists.items.map(toListItemFromArtist),
            total: artists.artists.total,
          },
          {
            key: 'playlists',
            title: 'Your playlists',
            items: playlists.items.map(toListItemFromPlaylist),
            total: playlists.total,
          },
          {
            key: 'recently-played',
            title: 'Recently played',
            items: recentItems,
            total: recentItems.length,
          },
          {
            key: 'saved-albums',
            title: 'Saved albums',
            items: savedAlbums.items.map((s) => toListItemFromAlbum(s.album)),
            total: savedAlbums.total,
          },
          {
            key: 'fresh-albums',
            title: 'Fresh albums',
            items: (freshAlbums.albums?.items ?? []).map(toListItemFromAlbum),
            total: freshAlbums.albums?.total ?? 0,
          },
        ];
      }),
      catchError(() => of([])),
    );
  }

  getFollowedArtists(limit = HOME_LIMIT): Observable<SpotifyFollowedArtistsResponse> {
    const params = new HttpParams().set('type', 'artist').set('limit', String(limit));
    return this.http.get<SpotifyFollowedArtistsResponse>(`${this.baseUrl}/me/following`, {
      params,
    });
  }

  getMyPlaylists(limit = HOME_LIMIT, offset = 0): Observable<SpotifyPaging<SpotifyPlaylist>> {
    const params = new HttpParams().set('limit', String(limit)).set('offset', String(offset));
    return this.http.get<SpotifyPaging<SpotifyPlaylist>>(`${this.baseUrl}/me/playlists`, {
      params,
    });
  }

  getRecentlyPlayed(limit = HOME_LIMIT): Observable<SpotifyPagingLike<SpotifyPlayHistoryItem>> {
    const params = new HttpParams().set('limit', String(limit));
    return this.http.get<SpotifyPagingLike<SpotifyPlayHistoryItem>>(
      `${this.baseUrl}/me/player/recently-played`,
      { params },
    );
  }

  getSavedAlbums(limit = HOME_LIMIT, offset = 0): Observable<SpotifyPaging<SpotifySavedAlbum>> {
    const params = new HttpParams().set('limit', String(limit)).set('offset', String(offset));
    return this.http.get<SpotifyPaging<SpotifySavedAlbum>>(`${this.baseUrl}/me/albums`, {
      params,
    });
  }

  /** Replaces browse/new-releases via search tag. */
  getFreshAlbums(limit = SEARCH_LIMIT, offset = 0): Observable<SpotifySearchResponse> {
    return this.search({
      q: 'tag:new',
      types: ['album'],
      limit,
      offset,
    });
  }

  search(params: SearchParams): Observable<SpotifySearchResponse> {
    const limit = Math.min(params.limit ?? SEARCH_LIMIT, SEARCH_LIMIT);
    const types = (params.types ?? ['album', 'playlist', 'artist']).join(',');
    const httpParams = new HttpParams()
      .set('q', params.q)
      .set('type', types)
      .set('limit', String(limit))
      .set('offset', String(params.offset ?? 0));

    return this.http.get<SpotifySearchResponse>(`${this.baseUrl}/search`, {
      params: httpParams,
    });
  }

  /**
   * Paginate search beyond the max limit of 10 by issuing parallel offset pages.
   */
  searchPaginated(
    q: string,
    pages = 2,
    types: SearchParams['types'] = ['album', 'playlist', 'artist'],
  ): Observable<SpotifySearchResponse> {
    const requests = Array.from({ length: pages }, (_, page) =>
      this.search({ q, types, limit: SEARCH_LIMIT, offset: page * SEARCH_LIMIT }),
    );

    return forkJoin(requests).pipe(
      map((responses) => mergeSearchPages(responses)),
    );
  }

  getEntity(type: SpotifyEntityType, id: string): Observable<SpotifyEntity> {
    return this.http.get<SpotifyEntity>(`${this.baseUrl}/${type}s/${id}`);
  }

  getArtist(id: string): Observable<SpotifyArtist> {
    return this.http.get<SpotifyArtist>(`${this.baseUrl}/artists/${id}`);
  }

  getAlbum(id: string): Observable<SpotifyAlbum> {
    return this.http.get<SpotifyAlbum>(`${this.baseUrl}/albums/${id}`);
  }

  getPlaylist(id: string): Observable<SpotifyPlaylist> {
    return this.http.get<SpotifyPlaylist>(`${this.baseUrl}/playlists/${id}`);
  }

  /** Artist albums (replaces removed top-tracks). */
  getArtistAlbums(
    id: string,
    limit = SEARCH_LIMIT,
    offset = 0,
  ): Observable<SpotifyPaging<SpotifyAlbum>> {
    const params = new HttpParams()
      .set('include_groups', 'album,single')
      .set('limit', String(limit))
      .set('offset', String(offset));
    return this.http.get<SpotifyPaging<SpotifyAlbum>>(`${this.baseUrl}/artists/${id}/albums`, {
      params,
    });
  }

  /**
   * Playlist items — only for owned/collaborative playlists.
   * Returns empty paging on 403 / missing access.
   */
  getPlaylistItems(
    id: string,
    limit = 50,
    offset = 0,
  ): Observable<SpotifyPagingLike<PlaylistItemsEntry>> {
    const params = new HttpParams().set('limit', String(limit)).set('offset', String(offset));
    return this.http
      .get<SpotifyPagingLike<PlaylistItemsEntry>>(`${this.baseUrl}/playlists/${id}/items`, {
        params,
      })
      .pipe(
        catchError((err: unknown) => {
          if (err instanceof HttpErrorResponse && (err.status === 403 || err.status === 404)) {
            return of({ items: [], total: 0, limit: limit, offset, next: null, previous: null });
          }
          throw err;
        }),
      );
  }

  /** Tracks for detail views, handling playlist `items` rename and missing fields. */
  getEntityTracks(
    type: SpotifyEntityType,
    id: string,
    contextUri?: string,
  ): Observable<SpotifyTrackSummary[]> {
    if (type === 'album') {
      return this.getAlbum(id).pipe(
        map((album) =>
          (album.tracks?.items ?? []).map((track, index) =>
            toTrackSummary(track, {
              contextUri: contextUri ?? album.uri,
              trackOrder: index,
              image: album.images?.[0]?.url,
            }),
          ),
        ),
      );
    }

    if (type === 'playlist') {
      return this.getPlaylist(id).pipe(
        map((playlist) => {
          const paging = playlistItemsPaging(playlist);
          const entries = paging?.items;
          if (!entries?.length) {
            return [] as SpotifyTrackSummary[];
          }
          return entries
            .map((entry, index) => {
              const track = playlistItemTrack(entry);
              return track
                ? toTrackSummary(track, {
                    contextUri: contextUri ?? playlist.uri,
                    trackOrder: index,
                  })
                : null;
            })
            .filter((t): t is SpotifyTrackSummary => !!t);
        }),
      );
    }

    // Artist: use albums as related content; no top-tracks in Dev Mode.
    return this.getArtistAlbums(id, SEARCH_LIMIT).pipe(
      map((page) =>
        page.items.map((album, index) =>
          toTrackSummary(
            {
              id: album.id,
              name: album.name,
              uri: album.uri,
              duration_ms: 0,
              artists: album.artists ?? [],
              album,
            },
            { contextUri: album.uri, trackOrder: index, image: album.images?.[0]?.url },
          ),
        ),
      ),
    );
  }

  /** URI-based library contains (replaces type-specific contains endpoints). */
  libraryContains(uris: string[]): Observable<boolean[]> {
    if (!uris.length) {
      return of([]);
    }
    const params = new HttpParams().set('uris', uris.join(','));
    return this.http.get<boolean[]>(`${this.baseUrl}/me/library/contains`, { params });
  }

  saveToLibrary(uris: string[]): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/me/library`, { uris });
  }

  removeFromLibrary(uris: string[]): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/me/library`, { body: { uris } });
  }

  transferPlayback(deviceId: string, play = false): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/me/player`, {
      device_ids: [deviceId],
      play,
    });
  }

  play(deviceId: string, body: PlayBody = {}): Observable<void> {
    const params = new HttpParams().set('device_id', deviceId);
    return this.http.put<void>(`${this.baseUrl}/me/player/play`, body, { params });
  }

  pause(deviceId: string): Observable<void> {
    const params = new HttpParams().set('device_id', deviceId);
    return this.http.put<void>(`${this.baseUrl}/me/player/pause`, {}, { params });
  }

  next(deviceId: string): Observable<void> {
    const params = new HttpParams().set('device_id', deviceId);
    return this.http.post<void>(`${this.baseUrl}/me/player/next`, {}, { params });
  }

  previous(deviceId: string): Observable<void> {
    const params = new HttpParams().set('device_id', deviceId);
    return this.http.post<void>(`${this.baseUrl}/me/player/previous`, {}, { params });
  }

  setVolume(deviceId: string, volumePercent: number): Observable<void> {
    const params = new HttpParams()
      .set('device_id', deviceId)
      .set('volume_percent', String(Math.round(volumePercent)));
    return this.http.put<void>(`${this.baseUrl}/me/player/volume`, {}, { params });
  }

  seek(deviceId: string, positionMs: number): Observable<void> {
    const params = new HttpParams()
      .set('device_id', deviceId)
      .set('position_ms', String(Math.round(positionMs)));
    return this.http.put<void>(`${this.baseUrl}/me/player/seek`, {}, { params });
  }

  setShuffle(deviceId: string, state: boolean): Observable<void> {
    const params = new HttpParams()
      .set('device_id', deviceId)
      .set('state', String(state));
    return this.http.put<void>(`${this.baseUrl}/me/player/shuffle`, {}, { params });
  }

  setRepeat(deviceId: string, state: 'track' | 'context' | 'off'): Observable<void> {
    const params = new HttpParams().set('device_id', deviceId).set('state', state);
    return this.http.put<void>(`${this.baseUrl}/me/player/repeat`, {}, { params });
  }
}

/** Recently-played and playlist-items share paging-ish shapes. */
interface SpotifyPagingLike<T> {
  href?: string;
  items: T[];
  limit?: number;
  next?: string | null;
  offset?: number;
  previous?: string | null;
  total?: number;
  cursors?: { after?: string; before?: string };
}

interface PlaylistItemsEntry {
  item?: SpotifyTrack | null;
  track?: SpotifyTrack | null;
  added_at?: string;
}

function mergeSearchPages(pages: SpotifySearchResponse[]): SpotifySearchResponse {
  const merge = <T>(
    key: keyof SpotifySearchResponse,
  ): SpotifyPaging<T> | undefined => {
    const chunks = pages
      .map((p) => p[key] as SpotifyPaging<T> | undefined)
      .filter((p): p is SpotifyPaging<T> => !!p);
    if (!chunks.length) {
      return undefined;
    }
    const items = chunks.flatMap((c) => c.items);
    const first = chunks[0];
    const last = chunks[chunks.length - 1];
    return {
      ...first,
      items,
      limit: items.length,
      offset: first.offset,
      next: last.next,
      total: first.total,
    };
  };

  return {
    artists: merge('artists'),
    albums: merge('albums'),
    playlists: merge('playlists'),
    tracks: merge('tracks'),
  };
}
