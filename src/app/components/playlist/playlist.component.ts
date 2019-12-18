import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SpotifyApiService } from '../../services/spotify.service';
import { AudioService } from '../../services/audio.service';
import { BackgroundService } from '../../services/background.service';
import { ITrack } from '../../types/interfaces';
import { Track } from '../track-list/track';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent implements OnInit {
  tracks: ITrack[] = [];
  playlistName: string;
  playlistId: string;

  constructor(
    private route: ActivatedRoute,
    private spotify: SpotifyApiService,
    private audioService: AudioService,
    private background: BackgroundService
  ) { }

  ngOnInit() {
    const playlistId = this.route.snapshot.paramMap.get('id');
    this.spotify.getPlaylist(playlistId)
      .subscribe(({ name, tracks, images, id }: any) => {
          this.background.updateBackgroundUrl(images);
          this.playlistName = name;
          this.playlistId = id;
          this.tracks = tracks.items.map((track, index) => new Track({...track.track, trackOrder: index}));
        },
        (error: any) => console.log(error)
      );
  }
}
