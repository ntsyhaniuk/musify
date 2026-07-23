import { Component, inject, effect, computed } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { map, of } from 'rxjs';

import { SpotifyApi } from '@app/data-access/spotify/spotify-api';
import { Background } from '@app/core/background/background';
import { Auth } from '@app/core/auth/auth';
import { ItemsList } from '@app/shared/components/items-list/items-list';
import {
  SpotifyHomeSection,
  SpotifySearchResponse,
  toListItemFromAlbum,
  toListItemFromArtist,
  toListItemFromPlaylist,
} from '@app/shared/models/spotify.models';
import { SearchState } from '@app/core/search/search-state';

@Component({
  selector: 'app-home',
  imports: [ItemsList],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly spotify = inject(SpotifyApi);
  private readonly searchState = inject(SearchState);
  private readonly background = inject(Background);
  private readonly auth = inject(Auth);

  protected readonly isAuthenticated = this.auth.isAuthenticated;
  protected readonly searchQuery = this.searchState.query;

  protected readonly sections = rxResource({
    params: () => ({
      query: this.searchState.query(),
      authed: this.auth.isAuthenticated(),
    }),
    stream: ({ params }) => {
      if (!params.authed) {
        return of([] as SpotifyHomeSection[]);
      }
      if (!params.query) {
        return this.spotify.getHomeSections();
      }
      return this.spotify.searchPaginated(params.query, 2).pipe(map(searchToSections));
    },
    defaultValue: [] as SpotifyHomeSection[],
  });

  protected readonly isSearching = computed(() => !!this.searchQuery().trim());

  protected readonly visibleSections = computed(() => {
    const lists = this.sections.value() ?? [];
    if (!this.isSearching()) {
      return lists;
    }
    return lists.filter((section) => section.items.length > 0);
  });

  protected readonly isSearchEmpty = computed(() => {
    if (!this.isSearching() || this.sections.isLoading() || this.sections.error()) {
      return false;
    }
    return this.visibleSections().length === 0;
  });

  constructor() {
    effect(() => {
      const lists = this.sections.value();
      const firstImage = lists?.[0]?.items?.[0]?.images?.[0]?.url ?? null;
      if (firstImage) {
        this.background.setBackground(firstImage);
      }
    });
  }
}

function searchToSections(res: SpotifySearchResponse): SpotifyHomeSection[] {
  const artists = (res.artists?.items ?? []).filter(
    (item): item is NonNullable<typeof item> => !!item?.id,
  );
  const albums = (res.albums?.items ?? []).filter(
    (item): item is NonNullable<typeof item> => !!item?.id,
  );
  const playlists = (res.playlists?.items ?? []).filter(
    (item): item is NonNullable<typeof item> => !!item?.id,
  );

  return [
    {
      key: 'artists',
      title: 'Artists',
      items: artists.map(toListItemFromArtist),
      total: res.artists?.total ?? artists.length,
    },
    {
      key: 'albums',
      title: 'Albums',
      items: albums.map(toListItemFromAlbum),
      total: res.albums?.total ?? albums.length,
    },
    {
      key: 'playlists',
      title: 'Playlists',
      items: playlists.map(toListItemFromPlaylist),
      total: res.playlists?.total ?? playlists.length,
    },
  ];
}
