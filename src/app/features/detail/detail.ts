import {
  Component,
  ChangeDetectionStrategy,
  computed,
  inject,
  signal,
  effect,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { map, of, switchMap } from 'rxjs';

import { SpotifyApi } from '../../data-access/spotify/spotify-api';
import { Background } from '../../core/background/background';
import { Player } from '../player/player';
import { TrackRow } from '../../shared/components/track-row/track-row';
import {
  SpotifyAlbum,
  SpotifyArtist,
  SpotifyEntityType,
  SpotifyListItem,
  playlistItemsPaging,
  toListItemFromAlbum,
  toListItemFromArtist,
} from '../../shared/models/spotify.models';

type DetailTab = 'tracks' | 'recommendations';

@Component({
  selector: 'app-detail',
  imports: [TrackRow, RouterLink],
  templateUrl: './detail.html',
  styleUrl: './detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Detail {
  private readonly route = inject(ActivatedRoute);
  private readonly spotify = inject(SpotifyApi);
  private readonly background = inject(Background);
  private readonly player = inject(Player);

  protected readonly activeTab = signal<DetailTab>('tracks');
  /** Filled by lastfm-proxy todo. */
  protected readonly biography = signal('');

  private readonly params = toSignal(
    this.route.paramMap.pipe(
      map((p) => ({
        type: (p.get('type') ?? 'album') as SpotifyEntityType,
        id: p.get('id') ?? '',
      })),
    ),
    { initialValue: { type: 'album' as SpotifyEntityType, id: '' } },
  );

  protected readonly entity = rxResource({
    params: () => this.params(),
    stream: ({ params }) => {
      if (!params.id) {
        return of(undefined);
      }
      return this.spotify.getEntity(params.type, params.id);
    },
  });

  protected readonly tracks = rxResource({
    params: () => {
      const entity = this.entity.value();
      const params = this.params();
      return entity ? { type: params.type, id: params.id, uri: entity.uri } : null;
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
                    const track = entry.item ?? entry.track;
                    if (!track) {
                      return null;
                    }
                    return {
                      id: track.id,
                      name: track.name,
                      uri: track.uri,
                      durationMs: track.duration_ms,
                      artists: track.artists ?? [],
                      contextUri: playlist.uri,
                      trackOrder: index,
                      image: track.album?.images?.[0]?.url,
                    };
                  })
                  .filter((t): t is NonNullable<typeof t> => !!t),
              ),
            );
          }),
        );
      }
      return this.spotify.getEntityTracks(params.type, params.id, params.uri);
    },
    defaultValue: [],
  });

  protected readonly recommendations = rxResource({
    params: () => {
      const entity = this.entity.value();
      const type = this.params().type;
      return entity ? { entity, type } : null;
    },
    stream: ({ params }) => {
      if (!params) {
        return of([] as SpotifyListItem[]);
      }
      if (params.type === 'artist') {
        return this.spotify
          .getArtistAlbums(params.entity.id, 10)
          .pipe(map((page) => page.items.map(toListItemFromAlbum)));
      }
      if (params.type === 'album') {
        const album = params.entity as SpotifyAlbum;
        return of(
          (album.artists ?? []).map((a) =>
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
    const value = this.entity.value() as SpotifyArtist | SpotifyAlbum | undefined;
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

  protected readonly recommendationsTitle = computed(() => {
    const type = this.params().type;
    if (type === 'artist') {
      return 'Albums';
    }
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

  protected setTab(tab: DetailTab): void {
    this.activeTab.set(tab);
  }

  protected coverUrl(item: SpotifyListItem): string {
    return item.images?.[0]?.url || 'assets/no-cover.jpg';
  }
}
