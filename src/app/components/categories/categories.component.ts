import { Component, OnDestroy, OnInit } from '@angular/core';

import { zip, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import get from 'lodash.get';

import { SpotifyApiService } from '../../services/spotify.service';
import { BackgroundService } from '../../services/background.service';

import { mapSpotifyResponse } from '../../utils/utils';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit, OnDestroy {
  initialDataList: any[] = [];
  spotifyDataLists: any[] = [];
  subscriptions$: Subscription[] = [];

  constructor(private spotifyService: SpotifyApiService, private background: BackgroundService) {}

  ngOnInit(): void {
    this.getSpotifyDataLists();
    this.getSearchResult();
  }

  getSpotifyDataLists() {
    this.subscriptions$.push(zip(
      this.spotifyService.getFollowedArtists(),
      this.spotifyService.getCategories(),
      this.spotifyService.getAlbums(),
    )
      .pipe(
        map(mapSpotifyResponse),
        map(this.prepareSpotifyData)
      )
      .subscribe(this.applyDataChanges.bind(this)));
  }

  prepareSpotifyData(spotifyData) {
    return Object.entries(spotifyData)
      .reduce((acc, [title, {items}]: any[]) => [...acc, {title, items}], []);
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
      this.spotifyService.dataList$
        .pipe(map(this.prepareSpotifyData))
        .subscribe(this.applyDataChanges.bind(this)),
      this.spotifyService.emptySearchStr$
        .subscribe(isEmpty => isEmpty ? this.applyDataChanges(this.initialDataList) : null)
    );
  }

  ngOnDestroy() {
    this.subscriptions$.forEach(subscription => subscription.unsubscribe());
  }
}
