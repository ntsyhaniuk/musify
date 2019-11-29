import { Component, Input, EventEmitter, OnInit } from '@angular/core';
import { SpotifyService } from 'H:/MusicPlayer/music-player/src/services/spotify.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  albums = [];
  tracks = [];

  // constructor( private SpotifyService: SpotifyService) { }
  constructor() { }

  // currentAlbumTracks(id) {
  //   this.SpotifyService.getAlbumTracks(id).subscribe((response: any) => {
  //     const {items} = response;
  //     this.tracks = items;
  //   });
  // }

  ngOnInit() {
    // this.SpotifyService.getAlbums().subscribe((response: any) => {
      // const {albums} = response;
      // const {items} = albums;
      // this.SpotifyService = items[0];
      // this.albums = items;
      // this.currentAlbumTracks(this.SpotifyService.id);
    //   console.log(response)
    // });
  }
}
