import { Component, computed, inject, signal, effect } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { map, of, switchMap } from 'rxjs';

import { SpotifyApi } from '@app/data-access/spotify/spotify-api';
import { LastfmApi } from '@app/data-access/lastfm/lastfm-api';
import { Background } from '@app/core/background/background';
import { Player } from '@app/features/player/player';
import { TrackRow } from '@app/shared/components/track-row/track-row';
import {
  SpotifyAlbum,
  SpotifyEntityType,
  SpotifyListItem,
  SpotifyTrackSummary,
  isSpotifyAlbum,
  playlistItemTrack,
  playlistItemsPaging,
  toListItemFromArtist,
  toTrackSummary,
} from '@app/shared/models/spotify.models';

type DetailTab = 'primary' | 'recommendations';

@Component({
  selector: 'app-detail',
  imports: [TrackRow, RouterLink],
  templateUrl: './detail.html',
  styleUrl: './detail.scss',
})
export class Detail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly spotify = inject(SpotifyApi);
  private readonly lastfm = inject(LastfmApi);
  private readonly background = inject(Background);
  private readonly player = inject(Player);

  protected readonly activeTab = signal<DetailTab>('primary');

  private readonly params = toSignal(
    this.route.paramMap.pipe(
      map((p) => ({
        type: (p.get('type') ?? 'album') as SpotifyEntityType,
        id: p.get('id') ?? '',
      })),
    ),
    { initialValue: { type: 'album' as SpotifyEntityType, id: '' } },
  );

  protected readonly isArtist = computed(() => this.params().type === 'artist');

  protected readonly entity = rxResource({
    params: () => this.params(),
    stream: ({ params }) => {
      if (!params.id) {
        return of(undefined);
      }
      return this.spotify.getEntity(params.type, params.id);
    },
  });

  protected readonly biography = rxResource({
    params: () => {
      const entity = this.entity.value();
      const type = this.params().type;
      if (!entity || (type !== 'artist' && type !== 'album')) {
        return null;
      }
      if (type === 'artist') {
        return { kind: 'artist' as const, artist: entity.name };
      }
      if (!isSpotifyAlbum(entity)) {
        return null;
      }
      return {
        kind: 'album' as const,
        artist: entity.artists?.[0]?.name ?? '',
        album: entity.name,
      };
    },
    stream: ({ params }) => {
      if (!params) {
        return of('');
      }
      if (params.kind === 'artist') {
        return this.lastfm.getArtistBio(params.artist);
      }
      if (!params.artist) {
        return of('');
      }
      return this.lastfm.getAlbumBio(params.artist, params.album);
    },
    defaultValue: '',
  });

  protected readonly tracks = rxResource({
    params: () => {
      const entity = this.entity.value();
      const params = this.params();
      if (!entity || params.type === 'artist') {
        return null;
      }
      return { type: params.type, id: params.id, uri: entity.uri };
    },
    stream: ({ params }) => {
      if (!params) {
        return of([]);
      }
      if (params.type === 'playlist') {
        // Prefer dedicated items endpoint when embedded items are absent.
        return this.spotify.getPlaylist(params.id).pipe(
          switchMap((playlist) => {
            const embedded = playlistItemsPaging(playlist)?.items;
            if (embedded?.length) {
              return this.spotify.getEntityTracks('playlist', params.id, playlist.uri);
            }
            return this.spotify.getPlaylistItems(params.id).pipe(
              map((page) =>
                page.items
                  .map((entry, index) => {
                    const track = playlistItemTrack(entry);
                    return track
                      ? toTrackSummary(track, { contextUri: playlist.uri, trackOrder: index })
                      : null;
                  })
                  .filter((t): t is SpotifyTrackSummary => !!t),
              ),
            );
          }),
        );
      }
      return this.spotify.getEntityTracks(params.type, params.id, params.uri);
    },
    defaultValue: [],
  });

  protected readonly albums = rxResource({
    params: () => {
      const entity = this.entity.value();
      const params = this.params();
      return entity && params.type === 'artist' ? { id: params.id } : null;
    },
    stream: ({ params }) => {
      if (!params) {
        return of([] as SpotifyAlbum[]);
      }
      return this.spotify.getArtistAlbums(params.id).pipe(map((page) => page.items));
    },
    defaultValue: [] as SpotifyAlbum[],
  });

  protected readonly recommendations = rxResource({
    params: () => {
      const entity = this.entity.value();
      const type = this.params().type;
      // Artist albums already have a dedicated list — skip duplicate recommendations.
      if (!entity || type === 'artist') {
        return null;
      }
      return { entity, type };
    },
    stream: ({ params }) => {
      if (!params) {
        return of([] as SpotifyListItem[]);
      }
      if (params.type === 'album' && isSpotifyAlbum(params.entity)) {
        return of(
          (params.entity.artists ?? []).map((a) =>
            toListItemFromArtist({
              id: a.id,
              name: a.name,
              uri: a.uri ?? `spotify:artist:${a.id}`,
              type: 'artist',
              images: [],
            }),
          ),
        );
      }
      return of([] as SpotifyListItem[]);
    },
    defaultValue: [] as SpotifyListItem[],
  });

  protected readonly entityName = computed(() => this.entity.value()?.name ?? '');
  protected readonly contextUri = computed(() => this.entity.value()?.uri ?? '');
  protected readonly popularity = computed(() => {
    const value = this.entity.value();
    return value && 'popularity' in value ? value.popularity : undefined;
  });

  protected readonly mainImage = computed(() => {
    const images = this.entity.value()?.images ?? [];
    return images[1]?.url ?? images[0]?.url ?? 'assets/no-cover.jpg';
  });

  protected readonly playLabel = computed(() => {
    const uri = this.contextUri();
    const playingHere = this.player.contextUri() === uri && this.player.isPlaying();
    return playingHere ? 'pause' : 'play';
  });

  protected readonly primaryTabLabel = computed(() => (this.isArtist() ? 'Albums' : 'Tracks'));

  protected readonly showRecommendationsTab = computed(() => !this.isArtist());

  protected readonly recommendationsTitle = computed(() => {
    const type = this.params().type;
    if (type === 'album') {
      return 'Artists';
    }
    return 'Related';
  });

  constructor() {
    effect(() => {
      const images = this.entity.value()?.images;
      const url = images?.[0]?.url ?? null;
      this.background.setBackground(url);
    });

    effect(() => {
      // Reset to primary when navigating between entity types.
      this.params();
      this.activeTab.set('primary');
    });
  }

  protected playPause(): void {
    const uri = this.contextUri();
    if (!uri) {
      return;
    }
    if (this.player.contextUri() === uri) {
      this.player.togglePlay();
    } else {
      this.player.playTrack({ context_uri: uri });
    }
  }

  protected isTrackCurrent(track: SpotifyTrackSummary): boolean {
    const current = this.player.currentTrack();
    if (!current) {
      return false;
    }
    return current.uri === track.uri || current.linkedFromUri === track.uri;
  }

  protected isTrackPlaying(track: SpotifyTrackSummary): boolean {
    return this.isTrackCurrent(track) && this.player.isPlaying();
  }

  protected onTrackPlayPause(track: SpotifyTrackSummary): void {
    if (this.isTrackCurrent(track)) {
      this.player.togglePlay();
      return;
    }
    if (track.contextUri) {
      const offset =
        track.trackOrder !== undefined ? { position: track.trackOrder } : { uri: track.uri };
      this.player.playTrack({ context_uri: track.contextUri, offset });
      return;
    }
    this.player.playTrack({ uris: [track.uri] });
  }

  protected onTrackArtistNavigate(id: string): void {
    void this.router.navigate(['/details', 'artist', id]);
  }

  protected isAlbumCurrent(album: SpotifyAlbum): boolean {
    return !!album.uri && this.player.contextUri() === album.uri;
  }

  protected isAlbumPlaying(album: SpotifyAlbum): boolean {
    return this.isAlbumCurrent(album) && this.player.isPlaying();
  }

  protected playAlbum(event: Event, album: SpotifyAlbum): void {
    event.preventDefault();
    event.stopPropagation();
    if (!album.uri) {
      return;
    }
    if (this.player.contextUri() === album.uri) {
      this.player.togglePlay();
    } else {
      this.player.playTrack({ context_uri: album.uri });
    }
  }

  protected setTab(tab: DetailTab): void {
    this.activeTab.set(tab);
  }

  protected coverUrl(item: SpotifyListItem | SpotifyAlbum): string {
    return item.images?.[0]?.url || 'assets/no-cover.jpg';
  }

  protected formatReleaseDate(album: SpotifyAlbum): string {
    const date = album.release_date;
    if (!date) {
      return '';
    }
    const precision =
      album.release_date_precision ??
      (date.length === 4 ? 'year' : date.length === 7 ? 'month' : 'day');
    if (precision === 'year') {
      return date;
    }
    if (precision === 'month') {
      const [year, month] = date.split('-').map(Number);
      if (!year || !month) {
        return date;
      }
      return new Date(year, month - 1).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
      });
    }
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      return date;
    }
    return parsed.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
