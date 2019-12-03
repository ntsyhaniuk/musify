import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HttpService } from './http.service';

@Injectable()
export class SpotifyApiService {
  public dataList$ = new Subject<any>();

  constructor(private $http: HttpService, private http: HttpClient) { }

  getAlbums() {
    const params = {
      httpMethod: 'GET',
      endpoint: 'browse/new-releases',
      queryParams: {
        limit: 25,
        country: 'US'
      }
    };
    return this.$http.request(params);
  }

  searchMusic(str: string) {
    const params = {
      httpMethod: 'GET',
      endpoint: 'search',
      queryParams: {
        q: str,
        type: 'album',
        offset: 0,
        limit: 25,
        market: 'US'
      }
    };
    this.$http.request(params).subscribe(({albums}: any) => {
      this.dataList$.next(albums);
    });
  }
}
