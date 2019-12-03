import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  searchUrl: string;
  private subject$ = new Subject<any>();

  constructor(private _http: HttpClient) { }

  get headers() {
    return new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${environment.token}` });
  }

  getAlbums() {
    return this._http.get('https://api.spotify.com/v1/browse/new-releases?limit=24&country=GB', {
      headers: this.headers
    });
  }

  getAlbumTracks(id: string) {
    return this._http.get(`https://api.spotify.com/v1/albums/${id}/tracks`, {
      headers: this.headers
    });
  }

  searchMusic(str: string) {
    this.searchUrl = 'https://api.spotify.com/v1/search?q=' + str + '&type=artist&offset=0&limit=24&market=US';
    const artists = this._http.get(this.searchUrl, {
      headers: this.headers
    }).pipe(map(data => this.updateMusic(data)));
    return artists;
  }

  updateMusic(data: any) {
    this.subject$.next(data.artists);
  }

  getMusic(): Observable<any> {
    return this.subject$.asObservable();
  }
}