import { Component, ChangeDetectionStrategy, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SpotifyListItem } from '../../models/spotify.models';

const FALLBACK_COVER = 'assets/no-cover.jpg';

/**
 * Grid of album/artist/playlist tiles.
 */
@Component({
  selector: 'app-items-list',
  imports: [RouterLink],
  templateUrl: './items-list.html',
  styleUrl: './items-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsList {
  readonly title = input('');
  readonly items = input<SpotifyListItem[]>([]);
  readonly total = input(0);
  /** When set and total exceeds preview length, shows See All → /library/:sectionKey. */
  readonly sectionKey = input<string | undefined>(undefined);

  protected readonly isEmpty = computed(() => this.items().length === 0);

  protected readonly showSeeAll = computed(
    () => !!this.sectionKey() && this.total() > this.items().length,
  );

  protected coverUrl(item: SpotifyListItem): string {
    return item.images?.[0]?.url || FALLBACK_COVER;
  }

  protected detailLink(item: SpotifyListItem): string[] {
    return ['/details', item.type, item.id];
  }
}
