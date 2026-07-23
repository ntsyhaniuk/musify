import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { Detail } from './detail';
import { SpotifyApi } from '@app/data-access/spotify/spotify-api';
import { LastfmApi } from '@app/data-access/lastfm/lastfm-api';
import { Player } from '@app/features/player/player';

describe('Detail', () => {
  let component: Detail;
  let fixture: ComponentFixture<Detail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Detail],
      providers: [
        provideHttpClient(),
        provideRouter([{ path: 'details/:type/:id', component: Detail }]),
        {
          provide: SpotifyApi,
          useValue: {
            getEntity: () => of(undefined),
            getEntityTracks: () => of([]),
            getPlaylist: () => of(undefined),
            getPlaylistItems: () => of({ items: [] }),
            getArtistAlbums: () => of({ items: [] }),
          },
        },
        {
          provide: LastfmApi,
          useValue: {
            getArtistBio: () => of(''),
            getAlbumBio: () => of(''),
          },
        },
        {
          provide: Player,
          useValue: {
            contextUri: () => null,
            isPlaying: () => false,
            currentTrack: () => null,
            togglePlay: vi.fn(),
            playTrack: vi.fn(),
            formatTime: () => '0:00',
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Detail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
