import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { EMPTY, Observable, catchError, expand, forkJoin, map, of, reduce } from 'rxjs';

import { APP_ENVIRONMENT } from '@app/core/tokens/environment.token';
import {
  SpotifyAlbum,
  SpotifyArtist,
  SpotifyEntity,
  SpotifyEntityType,
  SpotifyFollowedArtistsResponse,
  SpotifyHomeSection,
  SpotifyListItem,
  SpotifyPaging,
  SpotifyPlayHistoryItem,
  SpotifyPlaylist,
  SpotifyPlaylistItem,
  SpotifySavedAlbum,
  SpotifySearchResponse,
  SpotifyUserProfile,
  playlistItemTrack,
  playlistItemsPaging,
  toListItemFromAlbum,
  toListItemFromArtist,
  toListItemFromPlaylist,
  toTrackSummary,
  SpotifyTrackSummary,
} from '@app/shared/models/spotify.models';

const SEARCH_LIMIT = 10;
const HOME_LIMIT = 15;
const PAGE_LIMIT = 50;

/** Fully aggregated library list (all pages). */
export interface SpotifyFullList {
  items: SpotifyListItem[];
  total: number;
}

export interface SearchParams {
  q: string;
  offset?: number;
  limit?: number;
  types?: ('album' | 'artist' | 'playlist' | 'track')[];
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

  getFollowedArtists(
    limit = HOME_LIMIT,
    after?: string,
  ): Observable<SpotifyFollowedArtistsResponse> {
    let params = new HttpParams().set('type', 'artist').set('limit', String(limit));
    if (after) {
      params = params.set('after', after);
    }
    return this.http.get<SpotifyFollowedArtistsResponse>(`${this.baseUrl}/me/following`, {
      params,
    });
  }

  /** Cursor-paginated full followed-artists list. */
  getAllFollowedArtists(): Observable<SpotifyFullList> {
    return this.getFollowedArtists(PAGE_LIMIT).pipe(
      expand((res) => {
        const after = res.artists.cursors?.after;
        if (!res.artists.next || !after) {
          return EMPTY;
        }
        return this.getFollowedArtists(PAGE_LIMIT, after);
      }),
      reduce(
        (acc, res) => {
          acc.items.push(...res.artists.items.map(toListItemFromArtist));
          acc.total = res.artists.total;
          return acc;
        },
        { items: [] as SpotifyListItem[], total: 0 },
      ),
    );
  }

  getMyPlaylists(limit = HOME_LIMIT, offset = 0): Observable<SpotifyPaging<SpotifyPlaylist>> {
    const params = new HttpParams().set('limit', String(limit)).set('offset', String(offset));
    return this.http.get<SpotifyPaging<SpotifyPlaylist>>(`${this.baseUrl}/me/playlists`, {
      params,
    });
  }

  /** Offset-paginated full playlists list. */
  getAllMyPlaylists(): Observable<SpotifyFullList> {
    return this.getMyPlaylists(PAGE_LIMIT, 0).pipe(
      expand((page) => {
        if (!page.next || !page.items.length) {
          return EMPTY;
        }
        return this.getMyPlaylists(PAGE_LIMIT, page.offset + page.limit);
      }),
      reduce(
        (acc, page) => {
          acc.items.push(...page.items.map(toListItemFromPlaylist));
          acc.total = page.total;
          return acc;
        },
        { items: [] as SpotifyListItem[], total: 0 },
      ),
    );
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

  /** Offset-paginated full saved-albums list. */
  getAllSavedAlbums(): Observable<SpotifyFullList> {
    return this.getSavedAlbums(PAGE_LIMIT, 0).pipe(
      expand((page) => {
        if (!page.next || !page.items.length) {
          return EMPTY;
        }
        return this.getSavedAlbums(PAGE_LIMIT, page.offset + page.limit);
      }),
      reduce(
        (acc, page) => {
          acc.items.push(...page.items.map((s) => toListItemFromAlbum(s.album)));
          acc.total = page.total;
          return acc;
        },
        { items: [] as SpotifyListItem[], total: 0 },
      ),
    );
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

  /** Offset-paginated fresh albums (`tag:new`, max 10 per page). */
  getAllFreshAlbums(): Observable<SpotifyFullList> {
    return this.getFreshAlbums(SEARCH_LIMIT, 0).pipe(
      expand((res) => {
        const page = res.albums;
        if (!page?.next || !(page.items?.length)) {
          return EMPTY;
        }
        return this.getFreshAlbums(SEARCH_LIMIT, page.offset + page.limit);
      }),
      reduce(
        (acc, res) => {
          const albums = (res.albums?.items ?? []).filter(
            (item): item is NonNullable<typeof item> => item != null,
          );
          acc.items.push(...albums.map(toListItemFromAlbum));
          acc.total = res.albums?.total ?? acc.total;
          return acc;
        },
        { items: [] as SpotifyListItem[], total: 0 },
      ),
    );
  }

  search(params: SearchParams): Observable<SpotifySearchResponse> {
    const limit = Math.min(params.limit ?? SEARCH_LIMIT, SEARCH_LIMIT);
    const types = (params.types ?? ['album', 'playlist', 'artist']).join(',');
    const httpParams = new HttpParams()
      .set('q', params.q)
      .set('type', types)
      .set('limit', String(limit))
      .set('offset', String(params.offset ?? 0))
      .set('market', 'from_token');

    return this.http.get<SpotifySearchResponse>(`${this.baseUrl}/search`, {
      params: httpParams,
    });
  }

  /**
   * Paginate search beyond the max limit of 10 by issuing parallel offset pages.
   * Soft-fails individual pages so one bad offset does not wipe earlier results.
   */
  searchPaginated(
    q: string,
    pages = 2,
    types: SearchParams['types'] = ['album', 'playlist', 'artist'],
  ): Observable<SpotifySearchResponse> {
    const requests = Array.from({ length: pages }, (_, page) =>
      this.search({ q, types, limit: SEARCH_LIMIT, offset: page * SEARCH_LIMIT }).pipe(
        catchError(() => of(emptySearchResponse())),
      ),
    );

    return forkJoin(requests).pipe(map((responses) => mergeSearchPages(responses)));
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
  ): Observable<SpotifyPagingLike<SpotifyPlaylistItem>> {
    const params = new HttpParams().set('limit', String(limit)).set('offset', String(offset));
    return this.http
      .get<SpotifyPagingLike<SpotifyPlaylistItem>>(`${this.baseUrl}/playlists/${id}/items`, {
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

    // Artist top-tracks removed in Dev Mode — albums are shown via getArtistAlbums.
    return of([] as SpotifyTrackSummary[]);
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

/** Explicit empty result — avoids a blind `{} as SpotifySearchResponse` cast. */
function emptySearchResponse(): SpotifySearchResponse {
  return { artists: undefined, albums: undefined, playlists: undefined, tracks: undefined };
}

function mergeSearchPages(pages: SpotifySearchResponse[]): SpotifySearchResponse {
  const merge = <T>(
    key: keyof SpotifySearchResponse,
  ): SpotifyPaging<T> | undefined => {
    const chunks = pages
      .map((p) => p[key] as SpotifyPaging<T | null> | undefined)
      .filter((p): p is SpotifyPaging<T | null> => !!p);
    if (!chunks.length) {
      return undefined;
    }
    const items = chunks
      .flatMap((c) => c.items ?? [])
      .filter((item): item is T => item != null);
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
