import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
  private coverImage: string;

  constructor(
    private route: ActivatedRoute,
    private spotifyService: SpotifyApiService
  ) { }

  ngOnInit() {
    this.albumId = this.route.snapshot.paramMap.get('id');
    this.spotifyService.getAlbum(this.albumId)
      .subscribe(({ images, tracks }: any) => {
        const { items } = tracks;
        this.tracks = items;
        this.coverImage = images[0].url;
      },
        (error: any) => console.log(error)
      );
  }

  getCoverUrl() {
    return 'url(' + this.coverImage + ')';
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
