export interface Ihash {
  access_token: string;
}

export interface ITrack {
  album: object;
  artists: object;
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: object;
  external_urls: object;
  href: string;
  id: string;
  is_local: boolean;
  name: string;
  popularity: number;
  preview_url: string;
  track_number: number;
  type: string;
  uri: string;
}

export interface StreamState {
  playing: boolean;
  readableCurrentTime: string;
  readableDuration: string;
  duration: number | undefined;
  currentTime: number | undefined;
  canplay: boolean;
  error: boolean;
}