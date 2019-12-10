import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { SpotifyApiService } from '../../services/spotify.service';
import { state, style, transition, animate, trigger } from '@angular/animations';
import { ITrack } from '../../types/interfaces';

// icons
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
  public isPlaylistClosed = true;
  public currentTime$ = new Subject();
  public currentTrack: ITrack;

  constructor(
    private route: ActivatedRoute,
    private spotifyService: SpotifyApiService
  ) { }

  ngOnInit() {
    const albumId = this.route.snapshot.paramMap.get('id');
    this.spotifyService.getAlbum(albumId)
      .subscribe(({ name, tracks }: any) => {
        const { items } = tracks;
        this.tracks = items;
        this.albumName = name;
      },
        (error: any) => console.log(error)
      );
  }

  displayMillisecInMinSec(ms: number) {
    const d = new Date(1000 * Math.round(ms / 1000));
    return `${d.getUTCMinutes()}:${d.getUTCSeconds()}`;
  }

  listenTrack(idx: number, trackId: string) {
    const image = <HTMLImageElement>document.getElementById(`${idx}`);
    image.src.includes("play") ?
      this.playTrack(trackId, image) : this.pauseTrack(trackId, image);
  }

  playTrack(id: string, imageElement: HTMLImageElement) {
    const audio = <HTMLAudioElement>document.getElementById(id);
    for (const track of this.tracks) {
      const prevTrack = <HTMLAudioElement>document.getElementById(track.id);
      if (!prevTrack.paused || prevTrack.ended) {
        const prevTrackImage = <HTMLImageElement>document.getElementById(`${track.track_number}`);
        this.pauseTrack(track.id, prevTrackImage);
      }
    }

    imageElement.src = this.pauseIcon;
    audio.play();
  }

  pauseTrack(id: string, imageElement: HTMLImageElement) {
    const audio = <HTMLAudioElement>document.getElementById(id);
    audio.pause();
    imageElement.src = this.playIcon;
  }

  togglePlaylist() {
    this.isPlaylistClosed = !this.isPlaylistClosed;
  }

  initProgressBar(): any {
    const audio = <HTMLAudioElement>document.getElementById(this.currentTrack.id);
    this.currentTime$.next(audio.currentTime / audio.duration * 100);
  }

  playNextTrack(trackNumber: number) {
    this.currentTrack = this.tracks[trackNumber];
    const image = <HTMLImageElement>document.getElementById(`${trackNumber + 1}`);
    this.playTrack(this.tracks[trackNumber].id, image);
  }
}
