import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SpotifyApiService } from '../../services/spotify.service';
import { BackgroundService } from '../../services/background.service';

@Component({
  selector: 'app-albums-list',
  templateUrl: './albums-list.component.html',
  styleUrls: ['./albums-list.component.scss']
})
export class AlbumsListComponent implements OnInit, OnDestroy {
  albums: any[] = [];
  subscription$: Subscription;

  constructor(private spotifyService: SpotifyApiService, private background: BackgroundService) {
  }

  ngOnInit() {
    this.getAlbums();
    this.updateList();
  }

  getAlbums() {
    this.spotifyService.getAlbums()
      .subscribe(
        ({albums}: any) => {
          const { items } = albums;
          this.albums = items;
          this.background.updateBackgroundUrl(items[0].images);
        },
        (error: any) => console.log(error));
  }

  updateList() {
    this.subscription$ = this.spotifyService.dataList$
      .subscribe(({items}: any) => {
        this.albums = items;
        if (items.length) {
          this.background.updateBackgroundUrl(items[0].images);
        }
      });
  }

  ngOnDestroy() {
    this.subscription$.unsubscribe();
  }

  getCoverImage(album: any) {
    return album && album.images.length ? album.images[1].url : '../assets/no-cover.jpg';
  }
}
