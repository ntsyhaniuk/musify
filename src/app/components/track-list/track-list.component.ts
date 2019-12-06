import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { SpotifyApiService } from '../../services/spotify.service';
import { state, style, transition, animate, trigger } from "@angular/animations";
import { ITrack } from '../../types/interfaces'

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
  private albumId: string;
  public albumName: string;
  public playlistState: string = 'out';
  public currentTime$ = new Subject();
  public currentTrack: ITrack;

  constructor(
    private route: ActivatedRoute,
    private spotifyService: SpotifyApiService
  ) { }

  ngOnInit() {
    this.albumId = this.route.snapshot.paramMap.get('id');
    this.spotifyService.getAlbum(this.albumId)
      .subscribe(({ name, tracks }: any) => {
        const { items } = tracks;
        this.tracks = items;
        this.albumName = name;
      },
        (error: any) => console.log(error)
      );
  }

  displayMillisecInMinSec(ms: number) {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + ":" + (+seconds < 10 ? '0' : '') + seconds;
  }

  listenTrack(idx: number, trackId: string) {
    const image = <HTMLImageElement>document.getElementById(`${idx}`);
    if (image.src.includes("play")) {
      this.playTrack(trackId);
      image.src = this.pauseIcon;
    } else {
      this.pauseTrack(trackId, image);
    }
  }

  playTrack(id: string) {
    for (const track of this.tracks) {
      const prevTrack = <HTMLAudioElement>document.getElementById(track.id);
      if (!prevTrack.paused) {
        const image = <HTMLImageElement>document.getElementById(`${track.track_number}`);
        this.pauseTrack(track.id, image);
      }
    }

    const audio = <HTMLAudioElement>document.getElementById(id);
    audio.play();
  }

  pauseTrack(id: string, imageElement: any) {
    const audio = <HTMLAudioElement>document.getElementById(id);
    audio.pause();
    imageElement.src = this.playIcon;
  }

  toggleTracklist() {
    this.playlistState = this.playlistState === 'out' ? 'in' : 'out';
  }

  initProgressBar() {
    const audio = <HTMLAudioElement>document.getElementById(this.currentTrack.id);
    this.currentTime$.next(audio.currentTime / audio.duration * 100);
  }
}
