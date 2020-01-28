import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import get from 'lodash.get';
import { map, mergeMap } from 'rxjs/operators';
import { of, Subscription, zip, combineLatest, BehaviorSubject } from 'rxjs';

import { AudioService } from '../../services/audio.service';
import { MusicApiService } from '../../services/music-api.service';
import { BackgroundService } from '../../services/background.service';

import { Track } from '../track-list/track';
import { mapApiResponse } from '../../utils/utils';

import { ITrack, IWebPlaybackState } from '../../types/interfaces';

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
  mainImage: string;
  biography: string;
  contextUri: string;
  entityName: string;
  popularity: number;
  recommendations: {};
  state: IWebPlaybackState;
  stateSubscribtion$: Subscription;
  detailsSubscription$: Subscription;
  buttonLabel = new BehaviorSubject('play');
  activeTab = new BehaviorSubject('tracks');

  constructor(
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute,
    private musicApi: MusicApiService,
    private audioService: AudioService,
    private background: BackgroundService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(({entity, id}) => {
      this.loadDetailsData(entity, id);
    });
  }

  loadDetailsData(entity, id) {
    const endpointConfig = {
      artists: [`${entity}/${id}/top-tracks`, `${entity}/${id}/related-artists`],
      playlists: ['browse/featured-playlists']
    };

    const requests = [this.musicApi.getEntityData(`${entity}/${id}`)];

    if (endpointConfig[entity] && endpointConfig[entity].length) {
      endpointConfig[entity].forEach(endpoint => {
        requests.push(this.musicApi.getEntityData(endpoint));
      });
    }

    this.detailsSubscription$ = zip(...requests)
      .pipe(
        mergeMap(this.additionalRequest.bind(this)),
        map(mapApiResponse)
      )
      .subscribe(this.applyEntityData.bind(this));

    this.stateSubscribtion$ = this.audioService.getState().subscribe(newState => {
      this.state = newState;
      this.updateLabel();
    });
  }

  additionalRequest(data) {
    const mergedData = mapApiResponse(data);
    const { type, name, artists } = mergedData;

    if (RespKeys[type]) {
      const isArtist = type === 'artist';
      const params = {
        method: `${type}.getInfo`,
        artist: isArtist ? name : get(artists, '[0].name'),
        album: !isArtist ? name : null
      };
      return combineLatest(this.musicApi.getLastfmInfo(params), of(mergedData));
    }

    return of(data);
  }

  applyEntityData(data) {
    const { images, name, tracks, type, popularity, uri, artists, playlists } = data;
    const key = {
      [RespKeys.artist]: 'bio.content',
      [RespKeys.album]: 'wiki.content'
    };

    this.background.updateBackgroundUrl(images[0]);
    const tracksList = get(tracks, 'items', tracks);

    this.contextUri = uri;
    this.entityName = name;
    this.popularity = popularity;
    this.recommendations = artists ? ({artists}) : playlists ? ({playlists}) : null;
    this.mainImage = images[1] ? images[1].url : images[0].url;
    this.biography = get(data[type], key[type], '').replace(/<a.*/, '');
    this.tracks = tracksList.map(
      (track, index) => new Track({...get(track, 'track', track), trackOrder: index, contextUri: uri})
    );
  }

  playPause() {
    const { context: { uri } } = this.state;
    if (uri === this.contextUri) {
      this.audioService.togglePlay();
    } else {
      this.audioService.playTrack({context_uri: this.contextUri});
    }
  }

  updateLabel() {
    const { paused, context: { uri } } = this.state;
    this.buttonLabel.next(this.contextUri === uri && !paused ? 'pause' : 'play');
    // @ts-ignore
    if (!this.cd.destroyed) {
      this.cd.detectChanges();
    }
  }

  ngOnDestroy(): void {
    this.stateSubscribtion$.unsubscribe();
    this.detailsSubscription$.unsubscribe();
  }

}
