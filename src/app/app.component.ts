import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
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
