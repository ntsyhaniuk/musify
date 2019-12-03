import { Component } from '@angular/core';
import {Subject} from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { SpotifyService } from '../../../services/spotify.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  private searchString$ = new Subject<string>();

  constructor(private spotifyService: SpotifyService) {
    this.searchString$.pipe(
      debounceTime(250),
      distinctUntilChanged()
    ).subscribe((searchStr: string) => this.spotifyService.searchMusic(searchStr));
  }
}
