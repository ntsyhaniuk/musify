import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import get from 'lodash.get';

import { SpotifyApiService } from '../../services/spotify.service';
import { BackgroundService } from '../../services/background.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {
  playlists: any[] = [];

  constructor(private route: ActivatedRoute, private spotify: SpotifyApiService, private background: BackgroundService) { }

  ngOnInit() {
    const categoryId = this.route.snapshot.paramMap.get('id');
    this.spotify.getCategoryPlaylists(categoryId)
      .subscribe(({playlists}) => {
        const { items } = playlists;
        this.playlists = items;

        this.updateBackground();
    });
  }

  updateBackground() {
    const image = get(this.playlists, '[0].images[0]');
    const icon = get(this.playlists, '[0].icons[0]');
    this.background.updateBackgroundUrl(image || icon);
  }
}
