import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from 'rxjs';

import { environment } from '../../environments/environment';
import { createQueryString } from '../utils/utils';

const { BASE_SPOTIFY_URL, BASE_LASTFM_URL } = environment;

export enum HttpMethods {
  GET = 'GET',
  PUT = 'PUT',
  POST = 'POST',
  DELETE = 'DELETE'
}

@Injectable()
export class HttpService {
  constructor(private $http: HttpClient) { }

  request({ httpMethod = HttpMethods.GET, base = 'spotify', endpoint = '', body = {},  queryParams = {}}): Observable<any> {
    const params = createQueryString(queryParams);

    const BASE_URL = {
      spotify: BASE_SPOTIFY_URL,
      lastfm: BASE_LASTFM_URL
    };

    switch (httpMethod) {
      case HttpMethods.GET:
        return this.$http.get(`${BASE_URL[base]}/${endpoint}${params && `?${params}`}`);
      case HttpMethods.POST:
        return this.$http.post(`${BASE_SPOTIFY_URL}/${endpoint}${params && `?${params}`}`, body);
      case HttpMethods.PUT:
        return this.$http.put(`${BASE_SPOTIFY_URL}/${endpoint}${params && `?${params}`}`, body);
    }
  }
}
