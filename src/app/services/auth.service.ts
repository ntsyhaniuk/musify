import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

const { STORAGE_KEY, CLIENT_ID, CLIENT_SECRET, AUTH_URL, token } = environment;

@Injectable()
export class AuthService {

  constructor(private http: HttpClient) {
  }

  encodeClientData(id, secret) {
    return btoa(`${id}:${secret}`);
  }

  authorize() {
    const body = {
      grant_type: 'client_credentials'
    };
    this.http.post(AUTH_URL, body, {headers: this.headers}).subscribe(data => {
      console.log(data);
    });
  }

  get headers() {
    return new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Access-Control-Allow-Origin': '*',
      Authorization: `Basic ${this.encodeClientData(CLIENT_ID, CLIENT_SECRET)}`
    });
  }

  setSessionKey(authToken) {
    localStorage.setItem(STORAGE_KEY, authToken);
  }

  getSessionKey() {
    return token;
    // storing access token in local storage isn't implemented yet
    // return localStorage.getItem(STORAGE_KEY);
  }
}
