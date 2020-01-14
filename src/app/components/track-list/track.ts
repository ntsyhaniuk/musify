import { toCamelCase } from '../../utils/utils';

export class Track {
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
  contextUri: string;
  trackNumber: number;
  externalIds: object;
  externalUrls: object;
  availableMarkets: string[];

  constructor(track) {
    const modifiedTrack = Object.entries(track).reduce((acc, [key, value]) => {
      acc[toCamelCase(key)] = value;
      return acc;
    }, {});
    Object.assign(this, modifiedTrack);
  }
}
