import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';
import { map } from 'rxjs/operators';

@Injectable()
export class SpotifyService {
  public dataList$ = new Subject<any>();

  constructor(private http: HttpClient) { }

  get headers() {
    return new HttpHeaders({ 'Content-Type': 'application/json', Authorization: `Bearer ${environment.token}` });
  }

  getAlbums() {
    return this.http.get('https://api.spotify.com/v1/browse/new-releases?limit=24&country=GB', {
      headers: this.headers
    });
  }

  getAlbumTracks(id: string) {
    return this.http.get(`https://api.spotify.com/v1/albums/${id}/tracks`, {
      headers: this.headers
    });
  }

  searchMusic(str: string) {
    if (!str) {
      return this.getAlbums().subscribe(({albums}: any) => {
        this.dataList$.next(albums);
      });
    }
    const searchUrl = `https://api.spotify.com/v1/search?q=${str}&type=album&offset=0&limit=25&market=US`;
    this.http.get(searchUrl, {
      headers: this.headers
    }).subscribe(({albums}: any) => {
      this.dataList$.next(albums);
    });
  }
}
