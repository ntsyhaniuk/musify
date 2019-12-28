import { Component, OnDestroy, OnInit } from '@angular/core';

import { forkJoin, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import get from 'lodash.get';

import { SpotifyApiService } from '../../services/spotify.service';
import { BackgroundService } from '../../services/background.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit, OnDestroy {
  spotifyDataLists: any[] = [];
  searchSubscription$: Subscription;
  dataSubscription$: Subscription;

  constructor(private spotifyService: SpotifyApiService, private background: BackgroundService) {}

  ngOnInit(): void {
    this.getSpotifyDataLists();
    this.getSearchResult();
  }

  getSpotifyDataLists() {
    this.dataSubscription$ = forkJoin(
      this.spotifyService.getFollowedArtists(),
      this.spotifyService.getCategories(),
      this.spotifyService.getAlbums(),
    )
      .pipe(
        map(this.mapSpotifyResponse),
        map(this.prepareSpotifyData)
      )
      .subscribe(this.applyDataChanges.bind(this));
  }

  mapSpotifyResponse(response) {
    return response.reduce((acc, dataElement) => {
      return ({...acc, ...dataElement});
    }, {});
  }

  prepareSpotifyData(spotifyData) {
    return Object.entries(spotifyData)
      .reduce((acc, [title, {items}]: any[]) => {
        acc.push({title, items});
        return acc;
      }, []);
  }

  applyDataChanges(preparedData) {
    this.spotifyDataLists = preparedData;
    this.updateBackground(preparedData);
  }

  updateBackground(parsedSpotifyData) {
    const images = get(parsedSpotifyData, '[0].items[0].images[0]', null);
    this.background.updateBackgroundUrl(images);
  }

  getSearchResult() {
    this.searchSubscription$ = this.spotifyService.dataList$
      .pipe(map(this.prepareSpotifyData))
      .subscribe(this.applyDataChanges.bind(this));
  }

  ngOnDestroy() {
    this.searchSubscription$.unsubscribe();
    this.dataSubscription$.unsubscribe();
  }
}
