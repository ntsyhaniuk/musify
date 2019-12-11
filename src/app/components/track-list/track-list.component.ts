import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { SpotifyApiService } from '../../services/spotify.service';
import { AudioService } from '../../services/audio.service';
import { state, style, transition, animate, trigger } from "@angular/animations";
import { ITrack, StreamState } from '../../types/interfaces';

//icons
import '../../../assets/close.png';
import '../../../assets/menu_open.png';
import '../../../assets/play.png';
import '../../../assets/pause.png';
declare function require(path: string);

@Component({
  selector: 'app-track-list',
  templateUrl: './track-list.component.html',
  styleUrls: ['./track-list.component.scss'],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        transform: 'translate3d(0, 0, 0)'
      })),
      state('out', style({
        transform: 'translate3d(100%, 0, 0)'
      })),
      transition('in => out', animate('400ms ease-in-out')),
      transition('out => in', animate('400ms ease-in-out'))
    ]),
  ]
})
export class TrackListComponent implements OnInit {
  public closeIcon = require('../../../assets/close.png');
  public menuOpen = require('../../../assets/menu_open.png');
  public playIcon = require('../../../assets/play.png');
  public pauseIcon = require('../../../assets/pause.png');
  public tracks: ITrack[] = [];
  public albumName: string;
  public isPlaylistClosed: boolean = true;
  public currentTime$ = new Subject();
  public currentTrack: any;
  public state: StreamState;

  constructor(
    private route: ActivatedRoute,
    private spotifyService: SpotifyApiService,
    private audioService: AudioService
  ) {
    this.audioService.getState().subscribe(state => {
      this.state = state;
    })
  }

  ngOnInit() {
    const albumId = this.route.snapshot.paramMap.get('id');
    this.spotifyService.getAlbum(albumId)
      .subscribe(({ name, tracks }: any) => {
        const { items } = tracks;
        this.albumName = name;
        this.tracks = items;
        this.tracks.map(track => {
          track['isPlaying'] = false;
          if(this.audioService.getAudioID() === track.id) {
            track['isPlaying'] = true;
          }
        })
      },
        (error: any) => console.log(error)
      );
  }

  playStream(track: string, id: string) {
    this.audioService.playStream(track, id).subscribe();
  }

  listenTrack(track: ITrack, index: number) {
    this.changeIcons();
    track.isPlaying = true;
    this.currentTrack = { index, track };
    this.playStream(track.preview_url, track.id);
  }

  pause() {
    this.audioService.pause();
  }

  play() {
    this.audioService.play();
  }

  stop() {
    this.audioService.stop();
  }

  onSliderTimeChanged(change) {
    this.audioService.rewindTo(change.value);
  }

  togglePlaylist() {
    this.isPlaylistClosed = !this.isPlaylistClosed;
  }

  displayMillisecInMinSec(ms: number) {
    const d = new Date(1000 * Math.round(ms / 1000));
    return `${d.getUTCMinutes()}:${d.getUTCSeconds()}`;
  }

  changeIcons() {
    this.tracks.map(track => {
      if(track.isPlaying) {
        track.isPlaying = false;
      }
    })
  }
}
