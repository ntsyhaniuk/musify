import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { HttpService } from './http.service';

@Injectable()
export class SpotifyApiService {
  public dataList$ = new Subject<any>();

  constructor(private $http: HttpService) { }

  getAlbums() {
    const params = {
      endpoint: 'browse/new-releases',
      queryParams: {
        limit: 25,
        country: 'US'
      }
    };
    return this.$http.request(params);
  }

  getAlbum(id: string) {
    const params = {
      endpoint: `albums/${id}`,
      queryParams: {
        limit: 25,
        country: 'US'
      }
    };
    return this.$http.request(params);
  }

  searchMusic(str: string) {
    const params = {
      endpoint: 'search',
      queryParams: {
        q: str,
        type: 'album',
        limit: 25
      }
    };
    this.$http.request(params).subscribe(({albums}: any) => {
      this.dataList$.next(albums);
    });
  }
}
