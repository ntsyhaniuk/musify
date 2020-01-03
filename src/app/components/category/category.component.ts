import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import get from 'lodash.get';

import { MusicApiService } from '../../services/music-api.service';
import { BackgroundService } from '../../services/background.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {
  entitiesList: any[] = [];
  title: string;

  constructor(private route: ActivatedRoute, private musicApi: MusicApiService, private background: BackgroundService) { }

  ngOnInit() {
    const { entity = 'playlists', id } = this.route.snapshot.params;
    const {
      getAlbums,
      getArtists,
      getCategories,
      getCategoryPlaylists
    } = this.musicApi;

    this.title = entity;


    const requestConfig = {
      categories: getCategories,
      playlists: getCategoryPlaylists,
      artists: getArtists,
      albums: getAlbums
    };

    requestConfig[entity].call(this.musicApi, id || null)
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
