import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { createQueryString } from './http.service';
import { environment } from '../../environments/environment';

const { STORAGE_KEY, CLIENT_ID, CLIENT_SECRET, AUTH_URL, token } = environment;

@Injectable()
export class AuthService {

  constructor(private http: HttpClient, private router: Router) {
  }

  encodeClientData(id, secret) {
    return btoa(`${id}:${secret}`);
  }

  authorize() {
    console.log('authorize');
    if (this.isAuthorized()) {
      this.router.navigate(['/app']);
    } else {
      const queryParams = {
        client_id: CLIENT_ID,
        response_type: 'token',
        redirect_uri: 'http://localhost:4300/authorize/'
      };
      const paramsStr = createQueryString(queryParams);
      window.location.href = `${AUTH_URL}?${paramsStr}`;
    }
  }

  setSessionKey(authToken) {
    localStorage.setItem(STORAGE_KEY, authToken);
  }

  isAuthorized() {
    return !!this.getSessionKey();
  }

  getSessionKey() {
    // storing access token in local storage isn't implemented yet
    return localStorage.getItem(STORAGE_KEY);
  }
}
