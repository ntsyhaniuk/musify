/** Shared Spotify domain models — expand in Phase 2 (spotify-data). */

export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

export interface SpotifyArtistRef {
  id: string;
  name: string;
  uri?: string;
}

export interface SpotifyTrackSummary {
  id: string;
  name: string;
  uri: string;
  durationMs: number;
  artists: SpotifyArtistRef[];
  image?: string;
}
