import { Component, OnInit } from '@angular/core';
import { SpotifyApiService } from '../../services/spotify.service';
import { BackgroundService } from '../../services/background.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  albums: any[] = [];
  categories: any[] = [];

  constructor(private spotifyService: SpotifyApiService, private background: BackgroundService) {}

  ngOnInit() {
    this.getAlbums();
    this.getCategories();
  }

  getCategories() {
    this.spotifyService.getCategories()
      .subscribe(({categories}) => {
        const { items } = categories;
        this.categories = items;
        this.background.updateBackgroundUrl(items[0].icons);
      });
  }

  getAlbums() {
    this.spotifyService.getAlbums()
      .subscribe(({albums}: any) => {
          const { items } = albums;
          this.albums = items;
          this.background.updateBackgroundUrl(items[0].images);
        },
        (error: any) => console.log(error));
  }

}
