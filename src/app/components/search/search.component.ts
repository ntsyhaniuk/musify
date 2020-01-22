import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';

import { MusicApiService } from '../../services/music-api.service';

import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  searchString$ = new Subject<string>();

  constructor(private musicApi: MusicApiService, private router: Router) {}

  ngOnInit(): void {
    this.searchString$.pipe(
      tap(this.checkRedirection.bind(this)),
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe((searchStr: string) => this.musicApi.searchMusic(searchStr));
  }

  checkRedirection(searchStr) {
    if (window.location.href !== environment.REDIRECT_URI && searchStr) {
      this.router.navigate(['/']);
    }
  }
}
