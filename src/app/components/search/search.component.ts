import { Component, OnInit } from '@angular/core';
import { SpotifyService } from '../../../services/spotify.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  searchInput: string;

  constructor(private _spotifyService: SpotifyService) { }

  ngOnInit() { }

  searchMusic(): void {
    if (!this.searchInput) return;
    this._spotifyService.searchMusic(this.searchInput).subscribe()
  }

}
