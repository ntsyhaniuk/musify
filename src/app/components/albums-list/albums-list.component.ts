import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SpotifyService } from '../../../services/spotify.service';

@Component({
  selector: 'app-albums-list',
  templateUrl: './albums-list.component.html',
  styleUrls: ['./albums-list.component.scss']
})
export class AlbumsListComponent implements OnInit {

  constructor(private _spotifyService: SpotifyService) { }

  albums: [] = [];

  ngOnInit() {
    this._spotifyService.getAlbums()
      .subscribe((response: any) => {
        const {albums} = response;
        const {items} = albums;
        this.albums = items;
      })
  }
}
