import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { createQueryString, parseHash } from '../utils/utils';
import { environment } from '../../environments/environment';
import { Ihash } from '../types/interfaces';

const { STORAGE_KEY, CLIENT_ID, AUTH_URL, REDIRECT_URI } = environment;

@Injectable()
export class AuthService {

  constructor(private router: Router) {}

  authorize(): void {
    if (this.isAuthorized()) return;

    const hashUrl = window.location.hash.replace('#', '');
    const {access_token}: Ihash = parseHash(hashUrl);
    if (access_token) {
      this.setSessionKey(access_token);
      this.router.navigate(['']);
    } else {
      const queryParams = {
        response_type: 'token',
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI
      };
      const paramsStr = createQueryString(queryParams);
      window.location.href = `${AUTH_URL}?${paramsStr}`;
    }
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

  clearSessionKey() {
    localStorage.removeItem(STORAGE_KEY);
  }
}
