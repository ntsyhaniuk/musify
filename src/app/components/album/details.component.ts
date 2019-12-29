import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { zip } from 'rxjs';
import { map } from 'rxjs/operators';
import get from 'lodash.get';

import { SpotifyApiService } from '../../services/spotify.service';
import { BackgroundService } from '../../services/background.service';

import { AudioService } from '../../services/audio.service';
import { Track } from '../track-list/track';
import { ITrack } from '../../types/interfaces';
import { mapSpotifyResponse } from '../../utils/utils';

@Component({
  selector: 'app-album',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  tracks: ITrack[] = [];
  entityName: string;
  entityId: string;

  constructor(
    private route: ActivatedRoute,
    private spotify: SpotifyApiService,
    private audioService: AudioService,
    private background: BackgroundService
  ) { }

  ngOnInit() {
    const { entity, id: entityId }: Params = this.route.snapshot.params;

    const endpointConfig = {
      artists: `${entity}/${entityId}/top-tracks`
    };

    const requests = [this.spotify.getEntityData(`${entity}/${entityId}`)];

    if (endpointConfig[entity]) {
      requests.push(this.spotify.getEntityData(endpointConfig[entity]));
    }

    zip(...requests)
      .pipe(
        map(mapSpotifyResponse)
      )
      .subscribe(this.applyEntityData.bind(this));
  }

  applyEntityData({images, name, id, tracks}) {
    this.background.updateBackgroundUrl(images[0]);
    this.entityName = name;
    this.entityId = id;
    const tracksList = get(tracks, 'items', tracks);
    this.tracks = tracksList.map((track, index) => new Track({...get(track, 'track', track), trackOrder: index}));
  }

}
