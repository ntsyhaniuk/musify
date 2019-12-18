import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SpotifyApiService } from '../../services/spotify.service';
import { BackgroundService } from '../../services/background.service';
import { AudioService } from '../../services/audio.service';
import { ITrack } from '../../types/interfaces';
import { Track } from '../track-list/track';

@Component({
  selector: 'app-album',
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.scss']
})
export class AlbumComponent implements OnInit {
  tracks: ITrack[] = [];
  albumName: string;
  albumId: string;

  constructor(
    private route: ActivatedRoute,
    private spotify: SpotifyApiService,
    private audioService: AudioService,
    private background: BackgroundService
  ) { }

  ngOnInit() {
    const albumId = this.route.snapshot.paramMap.get('id');
    this.spotify.getAlbum(albumId)
      .subscribe(({ name, tracks, images, id }: any) => {
          this.background.updateBackgroundUrl(images);
          this.albumName = name;
          this.albumId = id;
          this.tracks = tracks.items.map((track, index) => new Track({...track, trackOrder: index}));
        },
        (error: any) => console.log(error)
      );
  }

}
