import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { HttpService } from './http.service';
import { createQueryString, parseHash } from '../utils/utils';
import { environment } from '../../environments/environment';
import { Ihash } from '../types/interfaces';

const { STORAGE_KEY, CLIENT_ID, AUTH_URL, REDIRECT_URI } = environment;

@Injectable()
export class AuthService {

  constructor(private router: Router, private http: HttpService) {}

  authorize(): void {
    if (this.isAuthorized()) return;

    const hashUrl = window.location.hash.replace('#', '');
    const {access_token}: Ihash = parseHash(hashUrl);

    if (access_token) {
      this.setSessionKey(access_token);
      this.router.navigate(['']);
    } else {
      this.redirectToSpotify();
    }
  }

  redirectToSpotify(): void {
    const queryParams = {
      response_type: 'token',
      scope: 'user-follow-read',
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI
    };
    const paramsStr = createQueryString(queryParams);

    const link = document.createElement('a');
    link.setAttribute('href', `${AUTH_URL}?${paramsStr}`);
    link.click();
  }

  getUserData() {
    const params = {
      endpoint: 'me'
    };
    return this.http.request(params);
  }

  isAuthorized(): boolean {
    return !!this.getSessionKey();
  }

  setSessionKey(authToken: string): void {
    localStorage.setItem(STORAGE_KEY, authToken);
  }

  getSessionKey(): string {
    return localStorage.getItem(STORAGE_KEY);
  }

  clearSessionKey(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
