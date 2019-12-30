import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { SpotifyApiService } from '../../services/spotify.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  private searchString$ = new Subject<string>();

  constructor(private spotifyService: SpotifyApiService) {
    this.searchString$.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe((searchStr: string) => this.spotifyService.searchMusic(searchStr));
  }
}
