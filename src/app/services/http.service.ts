import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {Observable} from 'rxjs';

const BASE_URL = environment.BASE_URL;

export enum HttpMethods {
  POST = 'POST',
  PUT = 'PUT',
  GET = 'GET',
  DELETE = 'DELETE'
}

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  constructor(private $http: HttpClient) { }

  request(params): Observable<any> {
    const { httpMethod, endpoint, body } = params;
    const queryParams = this.createQueryString(params.queryParams);

    switch (httpMethod) {
      case HttpMethods.GET:
        return this.$http.get(`${BASE_URL}/${endpoint}?${queryParams}`);
      case HttpMethods.POST:
        return this.$http.post(`${BASE_URL}/${endpoint}`, body);
    }
  }

  createQueryString(params = {}) {
    if (!params) {
      return '';
    }
    const keys = Object.keys(params);
    if (!keys.length) {
      return '';
    }

    return keys.map(param => `${param}=${params[param]}`).join('&');
  }
}
