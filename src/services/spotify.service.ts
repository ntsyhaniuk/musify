import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable()
export class SpotifyService {
  public dataList$ = new Subject<any>();

  constructor(private http: HttpClient) { }

  get headers() {
    return new HttpHeaders({ 'Content-Type': 'application/json', Authorization: `Bearer ${environment.token}` });
  }

  getAlbums() {
    return this.http.get('https://api.spotify.com/v1/browse/new-releases?limit=25&country=GB', {
      headers: this.headers
    });
  }

  getAlbumTracks(id: string) {
    return this.http.get(`https://api.spotify.com/v1/albums/${id}/tracks`, {
      headers: this.headers
    });
  }

  searchMusic(str: string) {
    const searchUrl = `https://api.spotify.com/v1/search?q=${str}&type=album&offset=0&limit=25&market=US`;
    this.http.get(searchUrl, {
      headers: this.headers
    }).subscribe(({albums}: any) => {
      this.dataList$.next(albums);
    });
  }
}
