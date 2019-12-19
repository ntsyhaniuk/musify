export interface Ihash {
  access_token: string;
}

export interface ITrack {
  id: string;
  uri: string;
  href: string;
  name: string;
  type: string;
  album: object;
  artists: object;
  isLocal: boolean;
  explicit: boolean;
  discNumber: number;
  durationMs: number;
  popularity: number;
  trackOrder: number;
  previewUrl: string;
  isPlaying: boolean;
  trackNumber: number;
  externalIds: object;
  externalUrls: object;
  availableMarkets: string[];
}

export interface IStreamState {
  playing: boolean;
  readableCurrentTime: string;
  readableDuration: string;
  duration: number | undefined;
  currentTime: number | undefined;
  currentId: string | undefined;
  canplay: boolean;
  error: boolean;
}
