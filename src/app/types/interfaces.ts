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
  contextUri: string;
  trackOrder: number;
  previewUrl: string;
  isPlaying: boolean;
  trackNumber: number;
  externalIds: object;
  externalUrls: object;
  availableMarkets: string[];
}

export interface IWebPlaybackState  {
  volume: number;
  paused: boolean;
  position: number;
  duration: number;
  repeat_mode: number;
  shuffle: boolean;
  context: {
    uri: string | null;
  };
  track_window: {
    current_track: IWebPlaybackTrack,
    previous_tracks: IWebPlaybackTrack[],
    next_tracks: IWebPlaybackTrack[]
  };
}

export interface IWebPlaybackTrack {
  uri: string;
  id: string;
  type: string;
  media_type: string;
  name: string;
  is_playable: boolean;
  album: {
    uri: string;
    name: string;
    images: [
      { url: string }
    ]
  };
  artists: [
    { uri: string, name: string }
  ];
}
