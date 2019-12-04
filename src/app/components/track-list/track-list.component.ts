import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SpotifyService } from '../../services/spotify.service';

@Component({
  selector: 'app-track-list',
  templateUrl: './track-list.component.html',
  styleUrls: ['./track-list.component.scss']
})
export class TrackListComponent implements OnInit {
  tracks: any[] = [];
  private coverImage;
  private albumId: string;

  constructor(
    private route: ActivatedRoute,
    private spotifyService: SpotifyService
  ) { }

  ngOnInit() {
    this.albumId = this.route.snapshot.paramMap.get('id');
    this.spotifyService.getAlbumTracks(this.albumId)
      .subscribe(({ items }: any) => {
        this.tracks.push(...items);
      },
        (error: any) => console.log(error));
    this.getUrl();
  }

  getUrl() {
    this.spotifyService.getAlbum(this.albumId)
      .subscribe(({ images }: any) => {
        this.coverImage = images[0].url;
      },
        (error: any) => console.log(error))
  }

  @ViewChild('player', {static: false}) audioPlayerRef: ElementRef;

  playTrack(id) {
    this.audioPlayerRef.nativeElement.play();
    const audio = document.getElementById(id);
    console.log('clicked on', audio)
  }
}
