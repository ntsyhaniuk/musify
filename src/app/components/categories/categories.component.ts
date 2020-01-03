import { Component, OnDestroy, OnInit } from '@angular/core';

import { zip, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import get from 'lodash.get';

import { MusicApiService } from '../../services/music-api.service';
import { BackgroundService } from '../../services/background.service';

import { mapApiResponse } from '../../utils/utils';

const MAX_CATEGORY_LIMIT = 15;

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit, OnDestroy {
  initialDataList: any[] = [];
  spotifyDataLists: any[] = [];
  subscriptions$: Subscription[] = [];

  constructor(private musicApi: MusicApiService, private background: BackgroundService) {}

  ngOnInit(): void {
    this.getSpotifyDataLists();
    this.getSearchResult();
  }

  getSpotifyDataLists() {
    this.subscriptions$.push(zip(
      this.musicApi.getArtists(MAX_CATEGORY_LIMIT),
      this.musicApi.getCategories(MAX_CATEGORY_LIMIT),
      this.musicApi.getAlbums(MAX_CATEGORY_LIMIT),
    )
      .pipe(
        map(mapApiResponse),
        map(this.prepareSpotifyData)
      )
      .subscribe(this.applyDataChanges.bind(this)));
  }

  prepareSpotifyData(spotifyData) {
    return Object.entries(spotifyData)
      .reduce((acc, [title, {items, total}]: any[]) => [...acc, {title, items, total}], []);
  }

  applyDataChanges(preparedData) {
    if (!this.initialDataList.length) {
      this.initialDataList = preparedData;
    }
    this.spotifyDataLists = preparedData;
    this.updateBackground(preparedData);
  }

  updateBackground(parsedSpotifyData) {
    const images = get(parsedSpotifyData, '[0].items[0].images[0]', null);
    this.background.updateBackgroundUrl(images);
  }

  getSearchResult() {
    this.subscriptions$.push(
      this.musicApi.dataList$
        .pipe(map(this.prepareSpotifyData))
        .subscribe(this.applyDataChanges.bind(this)),
      this.musicApi.emptySearchStr$
        .subscribe(isEmpty => isEmpty ? this.applyDataChanges(this.initialDataList) : null)
    );
  }

  ngOnDestroy() {
    this.subscriptions$.forEach(subscription => subscription.unsubscribe());
  }
}
