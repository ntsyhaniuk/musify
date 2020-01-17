import { Injectable } from '@angular/core';

import { BehaviorSubject, Subject } from 'rxjs';

import { HttpService } from './http.service';
import { environment } from '../../environments/environment';

@Injectable()
export class MusicApiService {
  public dataList$ = new Subject<any>();
  public emptySearchStr$ = new BehaviorSubject<boolean>(false);

  constructor(private $http: HttpService) { }

  getArtists(limit) {
    const params = {
      endpoint: 'me/following',
      queryParams: {
        type: 'artist',
        limit: limit || 50
      }
    };
    return this.$http.request(params);
  }

  getAlbums(limit) {
    const params = {
      endpoint: 'browse/new-releases',
      queryParams: {
        limit: limit || 50,
        country: 'US'
      }
    };
    return this.$http.request(params);
  }

  getCategories(limit) {
    const params = {
      endpoint: 'browse/categories/',
      queryParams: {
        limit: limit || 50,
        country: 'US'
      }
    };
    return this.$http.request(params);
  }

  getCategoryPlaylists(id: string) {
    const params = {
      endpoint: `browse/categories/${id}/playlists`,
      queryParams: {
        limit: 50,
        country: 'US'
      }
    };
    return this.$http.request(params);
  }

  getEntityData(endpoint: string) {
    const params = {
      endpoint,
      queryParams: {
        limit: 50,
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

    if (str) {
      this.$http.request(params).subscribe((data: any) => {
        this.dataList$.next(data);
      });
    } else {
      this.emptySearchStr$.next(true);
    }
  }

  getLastfmInfo(passedParams) {
    const { LASTFM_API_KEY } = environment;
    const queryParams = {...passedParams, format: 'json', api_key: LASTFM_API_KEY };

    const params = {
      base: 'lastfm',
      queryParams
    };

    return this.$http.request(params);
  }
}
