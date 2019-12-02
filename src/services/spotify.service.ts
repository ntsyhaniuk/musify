import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  searchUrl: string;
  private subject = new Subject<any>();

  constructor(private _http: HttpClient) { }

  get headers() {
    return new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${environment.token}` });
  }

  getAlbums() {
    return this._http.get('https://api.spotify.com/v1/browse/new-releases?limit=25&country=GB', {
      headers: this.headers
    });
  }

  getAlbumTracks(id: string) {
    return this._http.get(`https://api.spotify.com/v1/albums/${id}/tracks`, {
      headers: this.headers
    });
  }

  searchMusic(str: string) {
    this.searchUrl = 'https://api.spotify.com/v1/search?q=' + str + '&type=artist&offset=0&limit=25&market=US';
    const artists = this._http.get(this.searchUrl, {
      headers: this.headers
    })
    this.updateMusic(artists);
    return artists;
  }

  updateMusic(artists: any) {
    this.subject.next(artists);
  }

  getMusic(): Observable<any> {
    return this.subject.asObservable();
  }
}