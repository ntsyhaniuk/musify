import { Component, ChangeDetectionStrategy, inject, effect } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { map, of } from 'rxjs';

import { SpotifyApi } from '../../data-access/spotify/spotify-api';
import { Background } from '../../core/background/background';
import { Auth } from '../../core/auth/auth';
import { ItemsList } from '../../shared/components/items-list/items-list';
import {
  SpotifyHomeSection,
  SpotifySearchResponse,
  toListItemFromAlbum,
  toListItemFromArtist,
  toListItemFromPlaylist,
} from '../../shared/models/spotify.models';
import { SearchState } from '../search/search-state';

@Component({
  selector: 'app-home',
  imports: [ItemsList],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly spotify = inject(SpotifyApi);
  private readonly searchState = inject(SearchState);
  private readonly background = inject(Background);
  private readonly auth = inject(Auth);

  protected readonly isAuthenticated = this.auth.isAuthenticated;

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
  return [
    {
      key: 'artists',
      title: 'Artists',
      items: (res.artists?.items ?? []).map(toListItemFromArtist),
      total: res.artists?.total ?? 0,
    },
    {
      key: 'albums',
      title: 'Albums',
      items: (res.albums?.items ?? []).map(toListItemFromAlbum),
      total: res.albums?.total ?? 0,
    },
    {
      key: 'playlists',
      title: 'Playlists',
      items: (res.playlists?.items ?? []).map(toListItemFromPlaylist),
      total: res.playlists?.total ?? 0,
    },
  ];
}
