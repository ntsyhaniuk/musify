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
  entitiesList: any[] = [];
  title: string;

  constructor(private route: ActivatedRoute, private spotify: SpotifyApiService, private background: BackgroundService) { }

  ngOnInit() {
    const { entity, id } = this.route.snapshot.params;
    const {
      getAlbums,
      getArtists,
      getCategories,
      getCategoryPlaylists
    } = this.spotify;

    this.title = entity;


    const requestConfig = {
      categories: id ? getCategoryPlaylists : getCategories,
      artists: getArtists,
      albums: getAlbums
    };

    requestConfig[entity].call(this.spotify, id || null)
      .subscribe(({[entity]: {items}}) => {
        this.entitiesList = items;
        this.updateBackground();
      });
  }

  updateBackground() {
    const image = get(this.entitiesList, '[0].images[0]');
    const icon = get(this.entitiesList, '[0].icons[0]');
    this.background.updateBackgroundUrl(image || icon);
  }
}
