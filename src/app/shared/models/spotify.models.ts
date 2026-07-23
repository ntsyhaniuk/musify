/** Shared Spotify domain models (post–Feb 2026 Web API). */

export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

export interface SpotifyExternalUrls {
  spotify?: string;
}

export interface SpotifyArtistRef {
  id: string;
  name: string;
  uri?: string;
  href?: string;
  type?: 'artist';
  external_urls?: SpotifyExternalUrls;
}

export interface SpotifyAlbumRef {
  id: string;
  name: string;
  uri: string;
  href?: string;
  type?: 'album';
  album_type?: string;
  images: SpotifyImage[];
  artists?: SpotifyArtistRef[];
  release_date?: string;
  /** Removed in Dev Mode — treat as optional. */
  popularity?: number;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  href?: string;
  type?: 'track';
  duration_ms: number;
  explicit?: boolean;
  track_number?: number;
  disc_number?: number;
  artists: SpotifyArtistRef[];
  album?: SpotifyAlbumRef;
  preview_url?: string | null;
  is_local?: boolean;
  /** Removed in Dev Mode — treat as optional. */
  popularity?: number;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  uri: string;
  href?: string;
  type: 'artist';
  images: SpotifyImage[];
  genres?: string[];
  external_urls?: SpotifyExternalUrls;
  /** Removed in Dev Mode — treat as optional. */
  popularity?: number;
  /** Removed in Dev Mode — treat as optional. */
  followers?: { href: string | null; total: number };
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  uri: string;
  href?: string;
  type: 'album';
  album_type?: string;
  images: SpotifyImage[];
  artists: SpotifyArtistRef[];
  release_date?: string;
  release_date_precision?: 'year' | 'month' | 'day';
  total_tracks?: number;
  /** Nested tracks on album detail (still `tracks`, not renamed). */
  tracks?: SpotifyPaging<SpotifyTrack>;
  /** Removed in Dev Mode — treat as optional. */
  popularity?: number;
}

/** Playlist paging container after `tracks` → `items` rename. */
export interface SpotifyPlaylistItems {
  href?: string;
  total: number;
  limit?: number;
  offset?: number;
  next?: string | null;
  previous?: string | null;
  items?: SpotifyPlaylistItem[];
}

export interface SpotifyPlaylistItem {
  added_at?: string;
  added_by?: { id?: string };
  is_local?: boolean;
  /** Renamed from `track`. */
  item?: SpotifyTrack | null;
  /** Legacy fallback if an older payload still uses `track`. */
  track?: SpotifyTrack | null;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  uri: string;
  href?: string;
  type: 'playlist';
  description?: string | null;
  images: SpotifyImage[];
  owner?: {
    id?: string;
    display_name?: string | null;
  };
  public?: boolean | null;
  collaborative?: boolean;
  /**
   * Renamed from `tracks`. Absent for playlists the user does not own/collaborate on.
   */
  items?: SpotifyPlaylistItems;
  /** Legacy fallback. */
  tracks?: SpotifyPlaylistItems;
}

export interface SpotifyUserProfile {
  id: string;
  display_name: string | null;
  uri?: string;
  href?: string;
  type?: 'user';
  images?: SpotifyImage[];
  external_urls?: SpotifyExternalUrls;
  /** Removed in Dev Mode — treat as optional. */
  email?: string;
  country?: string;
  product?: string;
  followers?: { href: string | null; total: number };
}

export interface SpotifyPaging<T> {
  href?: string;
  items: T[];
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
}

export interface SpotifyFollowedArtistsResponse {
  artists: SpotifyPaging<SpotifyArtist>;
}

export interface SpotifySavedAlbum {
  added_at: string;
  album: SpotifyAlbum;
}

export interface SpotifyPlayHistoryItem {
  played_at: string;
  track: SpotifyTrack;
  context?: { uri?: string; type?: string; href?: string } | null;
}

export interface SpotifySearchResponse {
  artists?: SpotifyPaging<SpotifyArtist>;
  albums?: SpotifyPaging<SpotifyAlbum>;
  playlists?: SpotifyPaging<SpotifyPlaylist>;
  tracks?: SpotifyPaging<SpotifyTrack>;
}

export type SpotifyEntityType = 'artist' | 'album' | 'playlist';

export type SpotifyEntity = SpotifyArtist | SpotifyAlbum | SpotifyPlaylist;

/** Normalized list row used by home/search UI. */
export interface SpotifyListItem {
  id: string;
  name: string;
  type: SpotifyEntityType | 'track';
  uri: string;
  images: SpotifyImage[];
}

export interface SpotifyHomeSection {
  title: string;
  key: string;
  items: SpotifyListItem[];
  total: number;
}

/** UI-friendly track row (camelCase) derived from API tracks. */
export interface SpotifyTrackSummary {
  id: string;
  name: string;
  uri: string;
  durationMs: number;
  artists: SpotifyArtistRef[];
  image?: string;
  contextUri?: string;
  trackOrder?: number;
}

/** Unwrap playlist item after `track` → `item` rename. */
export function playlistItemTrack(
  entry: SpotifyPlaylistItem | null | undefined,
): SpotifyTrack | null {
  if (!entry) {
    return null;
  }
  return entry.item ?? entry.track ?? null;
}

/** Prefer `items` paging; fall back to legacy `tracks`. */
export function playlistItemsPaging(
  playlist: SpotifyPlaylist,
): SpotifyPlaylistItems | undefined {
  return playlist.items ?? playlist.tracks;
}

export function toListItemFromArtist(artist: SpotifyArtist): SpotifyListItem {
  return {
    id: artist.id,
    name: artist.name,
    type: 'artist',
    uri: artist.uri,
    images: artist.images ?? [],
  };
}

export function toListItemFromAlbum(
  album: Pick<SpotifyAlbum, 'id' | 'name' | 'uri' | 'images'> & { type?: 'album' },
): SpotifyListItem {
  return {
    id: album.id,
    name: album.name,
    type: 'album',
    uri: album.uri,
    images: album.images ?? [],
  };
}

export function toListItemFromPlaylist(playlist: SpotifyPlaylist): SpotifyListItem {
  return {
    id: playlist.id,
    name: playlist.name,
    type: 'playlist',
    uri: playlist.uri,
    images: playlist.images ?? [],
  };
}

export function toTrackSummary(
  track: SpotifyTrack,
  extras: { contextUri?: string; trackOrder?: number; image?: string } = {},
): SpotifyTrackSummary {
  return {
    id: track.id,
    name: track.name,
    uri: track.uri,
    durationMs: track.duration_ms,
    artists: track.artists ?? [],
    image: extras.image ?? track.album?.images?.[0]?.url,
    contextUri: extras.contextUri,
    trackOrder: extras.trackOrder,
  };
}
