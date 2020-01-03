import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { Subscription, zip } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import get from 'lodash.get';

import { MusicApiService } from '../../services/music-api.service';
import { BackgroundService } from '../../services/background.service';

import { AudioService } from '../../services/audio.service';
import { Track } from '../track-list/track';
import { ITrack } from '../../types/interfaces';
import { mapApiResponse } from '../../utils/utils';

@Component({
  selector: 'app-album',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit, OnDestroy {
  tracks: ITrack[] = [];
  entityId: string;
  biography: string;
  entityName: string;
  detailsSubscription$: Subscription;

  constructor(
    private route: ActivatedRoute,
    private musicApi: MusicApiService,
    private audioService: AudioService,
    private background: BackgroundService
  ) { }

  ngOnInit() {
    const { params: {entity, id}, fragment }: Params = this.route.snapshot;

    const endpointConfig = {
      artists: `${entity}/${id}/top-tracks`
    };

    const requests = [this.musicApi.getEntityData(`${entity}/${id}`)];

    if (endpointConfig[entity]) {
      requests.push(
        this.musicApi.getEntityData(endpointConfig[entity]),
        this.musicApi.getArtistBio(fragment)
        );
    }

    this.detailsSubscription$ = zip(...requests)
      .pipe(
        map(mapApiResponse)
      )
      .subscribe(this.applyEntityData.bind(this));
  }

  applyEntityData(data) {
    const {images, name, id, tracks, artist} = data;

    this.background.updateBackgroundUrl(images[0]);
    const tracksList = get(tracks, 'items', tracks);

    this.entityId = id;
    this.entityName = name;
    this.biography = get(artist, 'bio.content', '').replace(/<a.*/, '');
    this.tracks = tracksList.map((track, index) => new Track({...get(track, 'track', track), trackOrder: index}));
  }

  ngOnDestroy(): void {
    this.detailsSubscription$.unsubscribe();
  }

}
