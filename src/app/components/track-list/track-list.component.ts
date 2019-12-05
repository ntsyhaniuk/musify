import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SpotifyApiService } from '../../services/spotify.service';

@Component({
  selector: 'app-track-list',
  templateUrl: './track-list.component.html',
  styleUrls: ['./track-list.component.scss']
})
export class TrackListComponent implements OnInit {
  private tracks: any[] = [];
  private albumId: string;
  private albumName: string;

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

  msToMinSec(ms: number) {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + ":" + (+seconds < 10 ? '0' : '') + seconds;
  }

  listenTrack(idx: number, trackId: number) {
    const image = <HTMLImageElement>document.getElementById(`${idx}`);
    if (image.src.includes("play")) {
      this.playTrack(trackId);
      image.src = "../../../assets/pause.png";
    } else {
      this.pauseTrack(trackId);
      image.src = "../../../assets/play.png";
    }
  }

  playTrack(id) {
    const audio = <HTMLAudioElement>document.getElementById(id);
    audio.play();
  }

  pauseTrack(id) {
    const audio = <HTMLAudioElement>document.getElementById(id);
    audio.pause();
  }
}
