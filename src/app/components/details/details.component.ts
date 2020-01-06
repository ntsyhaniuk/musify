import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { of, Subscription, zip, combineLatest } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import get from 'lodash.get';

import { AudioService } from '../../services/audio.service';
import { MusicApiService } from '../../services/music-api.service';
import { BackgroundService } from '../../services/background.service';

import { Track } from '../track-list/track';
import { mapApiResponse } from '../../utils/utils';
import { IStreamState, ITrack } from '../../types/interfaces';

const RespKeys = {
  artist: 'artist',
  album: 'album'
};

@Component({
  selector: 'app-album',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit, OnDestroy {
  tracks: ITrack[] = [];
  entityId: string;
  mainImage: string;
  biography: string;
  entityName: string;
  popularity: number;
  state: IStreamState;
  stateSubscribtion$: Subscription;
  detailsSubscription$: Subscription;

  constructor(
    private route: ActivatedRoute,
    private musicApi: MusicApiService,
    private audioService: AudioService,
    private background: BackgroundService
  ) { }

  ngOnInit() {
    const { entity, id }: Params = this.route.snapshot.params;

    const endpointConfig = {
      artists: `${entity}/${id}/top-tracks`
    };

    const requests = [this.musicApi.getEntityData(`${entity}/${id}`)];

    if (endpointConfig[entity]) {
      requests.push(
        this.musicApi.getEntityData(endpointConfig[entity])
        );
    }

    this.detailsSubscription$ = zip(...requests)
      .pipe(
        mergeMap(this.additionalRequest.bind(this)),
        map(mapApiResponse)
      )
      .subscribe(this.applyEntityData.bind(this));

    this.stateSubscribtion$ = this.audioService.getState().subscribe(newState => {
      this.state = newState;
    });
  }

  additionalRequest(data) {
    const mergedData = mapApiResponse(data);
    const { type, name, artists } = mergedData;

    if (RespKeys[type]) {
      const artistName = get(artists, '[0].name');
      const params = {
        method: `${type}.getInfo`,
        artist: artistName || name,
        album: artistName ? name : null
      };
      return combineLatest(this.musicApi.getLastfmInfo(params), of(mergedData));
    }

    return of(data);
  }

  applyEntityData(data) {
    const { images, name, id, tracks, type, popularity } = data;
    const key = {
      [RespKeys.artist]: 'bio.content',
      [RespKeys.album]: 'wiki.content'
    };

    this.background.updateBackgroundUrl(images[0]);
    const tracksList = get(tracks, 'items', tracks);

    this.entityId = id;
    this.entityName = name;
    this.popularity = popularity;
    this.mainImage = images[1] ? images[1].url : images[0].url;
    this.biography = get(data[type], key[type], '').replace(/<a.*/, '');
    this.tracks = tracksList.map((track, index) => new Track({...get(track, 'track', track), trackOrder: index}));

    this.audioService.setListData(this.entityId, this.tracks);
  }

  playPause() {
    const track = this.state.currentTrack || this.tracks[0];
    if (track.isPlaying) {
      this.audioService.pause(track);
    } else {
      this.audioService.play(track);
    }
  }

  ngOnDestroy(): void {
    this.detailsSubscription$.unsubscribe();
    this.stateSubscribtion$.unsubscribe();
  }

}
