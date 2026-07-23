import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { Background } from '@app/core/background/background';
import { SpotifyApi } from '@app/data-access/spotify/spotify-api';
import { Library } from './library';
import { librarySectionGuard } from './library-section';

describe('Library', () => {
  const spotifyMock = {
    getAllFollowedArtists: vi.fn(() =>
      of({
        items: [
          {
            id: 'a1',
            name: 'Artist',
            type: 'artist' as const,
            uri: 'spotify:artist:a1',
            images: [{ url: 'https://img/a1.jpg' }],
          },
        ],
        total: 1,
      }),
    ),
    getAllMyPlaylists: vi.fn(() => of({ items: [], total: 0 })),
    getAllSavedAlbums: vi.fn(() => of({ items: [], total: 0 })),
    getAllFreshAlbums: vi.fn(() => of({ items: [], total: 0 })),
  };

  beforeEach(async () => {
    spotifyMock.getAllFollowedArtists.mockClear();
    spotifyMock.getAllMyPlaylists.mockClear();
    spotifyMock.getAllSavedAlbums.mockClear();
    spotifyMock.getAllFreshAlbums.mockClear();

    await TestBed.configureTestingModule({
      imports: [Library],
      providers: [
        provideHttpClient(),
        provideRouter([
          {
            path: 'library/:section',
            canActivate: [librarySectionGuard],
            component: Library,
          },
          { path: '', component: Library },
        ]),
        { provide: SpotifyApi, useValue: spotifyMock },
        {
          provide: Background,
          useValue: { setBackground: vi.fn() },
        },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Library);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('loads followed artists for artists section', async () => {
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/library/artists', Library);

    expect(spotifyMock.getAllFollowedArtists).toHaveBeenCalled();
    expect(component['title']()).toBe('Followed artists');
  });

  it('redirects unknown sections home', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/library/unknown');

    expect(TestBed.inject(Router).url).toBe('/');
  });
});
