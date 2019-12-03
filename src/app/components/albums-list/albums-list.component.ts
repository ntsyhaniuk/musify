import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SpotifyService } from '../../../services/spotify.service';

@Component({
  selector: 'app-albums-list',
  templateUrl: './albums-list.component.html',
  styleUrls: ['./albums-list.component.scss']
})
export class AlbumsListComponent implements OnInit, OnDestroy {
  albums: any[] = [];
  subscription$: Subscription;

  constructor(private spotifyService: SpotifyService) {
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
        },
        (error: any) => console.log(error));
  }

  updateList() {
    this.subscription$ = this.spotifyService.dataList$
      .subscribe(({items}: any) => {
        this.albums = items;
      });
  }

  ngOnDestroy() {
    this.subscription$.unsubscribe();
  }
}
