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

  getCategories() {
    const params = {
      endpoint: 'browse/categories/',
      queryParams: {
        limit: 40
      }
    };
    return this.$http.request(params);
  }

  getCategoryPlaylists(id: string) {
    const params = {
      endpoint: `browse/categories/${id}/playlists`,
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

  getPlaylist(id: string) {
    const params = {
      endpoint: `playlists/${id}`,
      queryParams: {
        limit: 100,
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
        type: 'album,playlist,artist',
        limit: 50
      }
    };
    this.$http.request(params).subscribe((data: any) => {
      this.dataList$.next(data);
    });
  }
}
