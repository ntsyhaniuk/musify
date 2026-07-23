import {
  Component,
  ChangeDetectionStrategy,
  computed,
  effect,
  inject,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { map, of } from 'rxjs';

import { Background } from '../../core/background/background';
import { SpotifyApi, SpotifyFullList } from '../../data-access/spotify/spotify-api';
import { ItemsList } from '../../shared/components/items-list/items-list';
import { SpotifyListItem } from '../../shared/models/spotify.models';
import { LIBRARY_SECTION_TITLES } from './library-section';

const EMPTY_LIST: SpotifyFullList = { items: [] as SpotifyListItem[], total: 0 };

@Component({
  selector: 'app-library',
  imports: [ItemsList],
  templateUrl: './library.html',
  styleUrl: './library.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Library {
  private readonly route = inject(ActivatedRoute);
  private readonly spotify = inject(SpotifyApi);
  private readonly background = inject(Background);

  private readonly section = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('section') ?? '')),
    { initialValue: '' },
  );

  protected readonly title = computed(() => LIBRARY_SECTION_TITLES[this.section()] ?? '');

  protected readonly list = rxResource({
    params: () => this.section(),
    stream: ({ params }) => {
      switch (params) {
        case 'artists':
          return this.spotify.getAllFollowedArtists();
        case 'playlists':
          return this.spotify.getAllMyPlaylists();
        case 'saved-albums':
          return this.spotify.getAllSavedAlbums();
        case 'fresh-albums':
          return this.spotify.getAllFreshAlbums();
        default:
          return of(EMPTY_LIST);
      }
    },
    defaultValue: EMPTY_LIST,
  });

  constructor() {
    effect(() => {
      const firstImage = this.list.value()?.items?.[0]?.images?.[0]?.url ?? null;
      if (firstImage) {
        this.background.setBackground(firstImage);
      }
    });
  }
}
