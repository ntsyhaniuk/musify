import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { MusicApiService } from '../../services/music-api.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  searchString$ = new Subject<string>();

  constructor(private musicApi: MusicApiService) {}

  ngOnInit(): void {
    this.searchString$.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe((searchStr: string) => this.musicApi.searchMusic(searchStr));
  }
}
