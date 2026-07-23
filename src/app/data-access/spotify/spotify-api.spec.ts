import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { APP_ENVIRONMENT } from '../../core/tokens/environment.token';
import {
  playlistItemTrack,
  playlistItemsPaging,
  SpotifyPlaylist,
} from '../../shared/models/spotify.models';
import { SpotifyApi } from './spotify-api';

describe('SpotifyApi', () => {
  const env = {
    production: false,
    CLIENT_ID: '',
    REDIRECT_URI: 'http://127.0.0.1:4300/',
    LASTFM_API_KEY: '',
    STORAGE_KEY: 'auth_token',
    BASE_SPOTIFY_URL: 'https://api.spotify.com/v1',
    BASE_LASTFM_URL: 'https://ws.audioscrobbler.com/2.0',
    AUTH_URL: 'https://accounts.spotify.com/authorize',
    TOKEN_URL: 'https://accounts.spotify.com/api/token',
  };

  let api: SpotifyApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_ENVIRONMENT, useValue: env },
      ],
    });
    api = TestBed.inject(SpotifyApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('should be created', () => {
    expect(api).toBeTruthy();
  });

  it('loads home sections from library-centric endpoints', async () => {
    const pending = firstValueFrom(api.getHomeSections(5));

    http.expectOne((r) => r.url.includes('/me/following')).flush({
      artists: {
        items: [{ id: 'a1', name: 'Artist', uri: 'spotify:artist:a1', type: 'artist', images: [] }],
        total: 1,
        limit: 5,
        offset: 0,
        next: null,
        previous: null,
      },
    });
    http.expectOne((r) => r.url.includes('/me/playlists')).flush({
      items: [{ id: 'p1', name: 'List', uri: 'spotify:playlist:p1', type: 'playlist', images: [] }],
      total: 1,
      limit: 5,
      offset: 0,
      next: null,
      previous: null,
    });
    http.expectOne((r) => r.url.includes('/me/player/recently-played')).flush({
      items: [
        {
          played_at: '2026-01-01',
          track: {
            id: 't1',
            name: 'Song',
            uri: 'spotify:track:t1',
            duration_ms: 1000,
            artists: [],
            album: {
              id: 'al1',
              name: 'Album',
              uri: 'spotify:album:al1',
              images: [],
            },
          },
        },
      ],
    });
    http.expectOne((r) => r.url.includes('/me/albums')).flush({
      items: [
        {
          added_at: '2026-01-01',
          album: { id: 'sa1', name: 'Saved', uri: 'spotify:album:sa1', type: 'album', images: [], artists: [] },
        },
      ],
      total: 1,
      limit: 5,
      offset: 0,
      next: null,
      previous: null,
    });
    http.expectOne((r) => r.url.includes('/search')).flush({
      albums: {
        items: [
          { id: 'f1', name: 'Fresh', uri: 'spotify:album:f1', type: 'album', images: [], artists: [] },
        ],
        total: 1,
        limit: 5,
        offset: 0,
        next: null,
        previous: null,
      },
    });

    const sections = await pending;
    expect(sections.map((s) => s.key)).toEqual([
      'artists',
      'playlists',
      'recently-played',
      'saved-albums',
      'fresh-albums',
    ]);
    expect(sections[0].items[0].name).toBe('Artist');
  });

  it('aggregates followed artists across cursor pages', async () => {
    const pending = firstValueFrom(api.getAllFollowedArtists());

    const first = http.expectOne(
      (r) => r.url.includes('/me/following') && !r.params.get('after'),
    );
    expect(first.request.params.get('limit')).toBe('50');
    first.flush({
      artists: {
        items: [
          { id: 'a1', name: 'One', uri: 'spotify:artist:a1', type: 'artist', images: [] },
        ],
        total: 2,
        limit: 50,
        offset: 0,
        next: 'https://api.spotify.com/v1/me/following?after=c1',
        previous: null,
        cursors: { after: 'c1' },
      },
    });

    const second = http.expectOne(
      (r) => r.url.includes('/me/following') && r.params.get('after') === 'c1',
    );
    second.flush({
      artists: {
        items: [
          { id: 'a2', name: 'Two', uri: 'spotify:artist:a2', type: 'artist', images: [] },
        ],
        total: 2,
        limit: 50,
        offset: 0,
        next: null,
        previous: null,
        cursors: {},
      },
    });

    const result = await pending;
    expect(result.total).toBe(2);
    expect(result.items.map((i) => i.id)).toEqual(['a1', 'a2']);
  });

  it('aggregates playlists across offset pages', async () => {
    const pending = firstValueFrom(api.getAllMyPlaylists());

    const first = http.expectOne(
      (r) => r.url.includes('/me/playlists') && r.params.get('offset') === '0',
    );
    expect(first.request.params.get('limit')).toBe('50');
    first.flush({
      items: [{ id: 'p1', name: 'A', uri: 'spotify:playlist:p1', type: 'playlist', images: [] }],
      total: 2,
      limit: 50,
      offset: 0,
      next: 'next',
      previous: null,
    });

    const second = http.expectOne(
      (r) => r.url.includes('/me/playlists') && r.params.get('offset') === '50',
    );
    second.flush({
      items: [{ id: 'p2', name: 'B', uri: 'spotify:playlist:p2', type: 'playlist', images: [] }],
      total: 2,
      limit: 50,
      offset: 50,
      next: null,
      previous: null,
    });

    const result = await pending;
    expect(result.total).toBe(2);
    expect(result.items.map((i) => i.id)).toEqual(['p1', 'p2']);
  });

  it('aggregates saved albums across offset pages', async () => {
    const pending = firstValueFrom(api.getAllSavedAlbums());

    http
      .expectOne((r) => r.url.includes('/me/albums') && r.params.get('offset') === '0')
      .flush({
        items: [
          {
            added_at: '2026-01-01',
            album: {
              id: 'sa1',
              name: 'Saved 1',
              uri: 'spotify:album:sa1',
              type: 'album',
              images: [],
              artists: [],
            },
          },
        ],
        total: 2,
        limit: 50,
        offset: 0,
        next: 'next',
        previous: null,
      });

    http
      .expectOne((r) => r.url.includes('/me/albums') && r.params.get('offset') === '50')
      .flush({
        items: [
          {
            added_at: '2026-01-02',
            album: {
              id: 'sa2',
              name: 'Saved 2',
              uri: 'spotify:album:sa2',
              type: 'album',
              images: [],
              artists: [],
            },
          },
        ],
        total: 2,
        limit: 50,
        offset: 50,
        next: null,
        previous: null,
      });

    const result = await pending;
    expect(result.items.map((i) => i.id)).toEqual(['sa1', 'sa2']);
    expect(result.total).toBe(2);
  });

  it('aggregates fresh albums across search pages and filters nulls', async () => {
    const pending = firstValueFrom(api.getAllFreshAlbums());

    const first = http.expectOne(
      (r) =>
        r.url.includes('/search') &&
        r.params.get('q') === 'tag:new' &&
        r.params.get('offset') === '0',
    );
    expect(first.request.params.get('limit')).toBe('10');
    first.flush({
      albums: {
        items: [
          { id: 'f1', name: 'Fresh 1', uri: 'spotify:album:f1', type: 'album', images: [], artists: [] },
          null,
        ],
        total: 11,
        limit: 10,
        offset: 0,
        next: 'next',
        previous: null,
      },
    });

    http
      .expectOne(
        (r) =>
          r.url.includes('/search') &&
          r.params.get('q') === 'tag:new' &&
          r.params.get('offset') === '10',
      )
      .flush({
        albums: {
          items: [
            {
              id: 'f2',
              name: 'Fresh 2',
              uri: 'spotify:album:f2',
              type: 'album',
              images: [],
              artists: [],
            },
          ],
          total: 11,
          limit: 10,
          offset: 10,
          next: null,
          previous: null,
        },
      });

    const result = await pending;
    expect(result.items.map((i) => i.id)).toEqual(['f1', 'f2']);
    expect(result.total).toBe(11);
  });

  it('caps search limit at 10 and sends market from_token', async () => {
    const pending = firstValueFrom(api.search({ q: 'radiohead', limit: 50 }));
    const req = http.expectOne((r) => r.url.includes('/search'));
    expect(req.request.params.get('limit')).toBe('10');
    expect(req.request.params.get('q')).toBe('radiohead');
    expect(req.request.params.get('market')).toBe('from_token');
    req.flush({});
    await pending;
  });

  it('paginates search across offsets', async () => {
    const pending = firstValueFrom(api.searchPaginated('test', 2));

    const first = http.expectOne((r) => r.url.includes('/search') && r.params.get('offset') === '0');
    first.flush({
      albums: {
        items: [{ id: '1', name: 'A', uri: 'spotify:album:1', type: 'album', images: [], artists: [] }],
        total: 20,
        limit: 10,
        offset: 0,
        next: 'next',
        previous: null,
      },
    });
    const second = http.expectOne((r) => r.url.includes('/search') && r.params.get('offset') === '10');
    second.flush({
      albums: {
        items: [{ id: '2', name: 'B', uri: 'spotify:album:2', type: 'album', images: [], artists: [] }],
        total: 20,
        limit: 10,
        offset: 10,
        next: null,
        previous: null,
      },
    });

    const result = await pending;
    expect(result.albums?.items.map((a) => a.id)).toEqual(['1', '2']);
  });

  it('filters null search items when merging pages', async () => {
    const pending = firstValueFrom(api.searchPaginated('soad', 1));

    const req = http.expectOne((r) => r.url.includes('/search'));
    expect(req.request.params.get('market')).toBe('from_token');
    req.flush({
      artists: {
        items: [
          { id: 'a1', name: 'System Of A Down', uri: 'spotify:artist:a1', type: 'artist', images: [] },
          null,
        ],
        total: 2,
        limit: 10,
        offset: 0,
        next: null,
        previous: null,
      },
      playlists: {
        items: [null, { id: 'p1', name: 'SOAD Mix', uri: 'spotify:playlist:p1', type: 'playlist', images: [] }],
        total: 2,
        limit: 10,
        offset: 0,
        next: null,
        previous: null,
      },
    });

    const result = await pending;
    expect(result.artists?.items.map((a) => a.id)).toEqual(['a1']);
    expect(result.playlists?.items.map((p) => p.id)).toEqual(['p1']);
  });

  it('keeps first page when a later search page fails', async () => {
    const pending = firstValueFrom(api.searchPaginated('test', 2));

    const first = http.expectOne((r) => r.url.includes('/search') && r.params.get('offset') === '0');
    first.flush({
      artists: {
        items: [{ id: 'a1', name: 'A', uri: 'spotify:artist:a1', type: 'artist', images: [] }],
        total: 11,
        limit: 10,
        offset: 0,
        next: 'next',
        previous: null,
      },
    });
    const second = http.expectOne((r) => r.url.includes('/search') && r.params.get('offset') === '10');
    second.flush({ error: 'fail' }, { status: 500, statusText: 'Server Error' });

    const result = await pending;
    expect(result.artists?.items.map((a) => a.id)).toEqual(['a1']);
  });

  it('returns empty playlist items on 403', async () => {
    const pending = firstValueFrom(api.getPlaylistItems('xyz'));
    const req = http.expectOne((r) => r.url.endsWith('/playlists/xyz/items'));
    req.flush({ error: 'forbidden' }, { status: 403, statusText: 'Forbidden' });
    const page = await pending;
    expect(page.items).toEqual([]);
  });

  it('checks library contains with URIs', async () => {
    const uris = ['spotify:album:1', 'spotify:artist:2'];
    const pending = firstValueFrom(api.libraryContains(uris));
    const req = http.expectOne((r) => r.url.includes('/me/library/contains'));
    expect(req.request.params.get('uris')).toBe(uris.join(','));
    req.flush([true, false]);
    expect(await pending).toEqual([true, false]);
  });

  it('saves and removes library URIs', async () => {
    const savePending = firstValueFrom(api.saveToLibrary(['spotify:album:1']));
    const saveReq = http.expectOne((r) => r.url.endsWith('/me/library') && r.method === 'PUT');
    expect(saveReq.request.body).toEqual({ uris: ['spotify:album:1'] });
    saveReq.flush(null);
    await savePending;

    const removePending = firstValueFrom(api.removeFromLibrary(['spotify:album:1']));
    const removeReq = http.expectOne(
      (r) => r.url.endsWith('/me/library') && r.method === 'DELETE',
    );
    expect(removeReq.request.body).toEqual({ uris: ['spotify:album:1'] });
    removeReq.flush(null);
    await removePending;
  });

  it('reads playlist tracks via items.item rename helpers', () => {
    const playlist: SpotifyPlaylist = {
      id: 'p',
      name: 'Mine',
      uri: 'spotify:playlist:p',
      type: 'playlist',
      images: [],
      items: {
        total: 1,
        items: [
          {
            item: {
              id: 't',
              name: 'Track',
              uri: 'spotify:track:t',
              duration_ms: 1200,
              artists: [],
            },
          },
        ],
      },
    };

    expect(playlistItemsPaging(playlist)?.total).toBe(1);
    expect(playlistItemTrack(playlist.items!.items![0])?.name).toBe('Track');
  });

  it('tolerates missing popularity / followers on entities', async () => {
    const pending = firstValueFrom(api.getArtist('a1'));
    http.expectOne(`${env.BASE_SPOTIFY_URL}/artists/a1`).flush({
      id: 'a1',
      name: 'No Pop',
      uri: 'spotify:artist:a1',
      type: 'artist',
      images: [],
      // popularity / followers intentionally omitted
    });
    const artist = await pending;
    expect(artist.popularity).toBeUndefined();
    expect(artist.followers).toBeUndefined();
  });
});
