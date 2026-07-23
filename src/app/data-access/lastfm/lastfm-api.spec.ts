import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { LastfmApi, scrubBio } from './lastfm-api';

describe('LastfmApi', () => {
  let api: LastfmApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(LastfmApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('should be created', () => {
    expect(api).toBeTruthy();
  });

  it('loads artist bio via proxy', async () => {
    const pending = firstValueFrom(api.getArtistBio('Radiohead'));
    const req = http.expectOne((r) => r.url === '/api/lastfm');
    expect(req.request.params.get('method')).toBe('artist.getInfo');
    expect(req.request.params.get('artist')).toBe('Radiohead');
    req.flush({
      artist: {
        bio: { content: 'A band.<a href="https://last.fm">Read more</a>' },
      },
    });
    expect(await pending).toBe('A band.');
  });

  it('loads album wiki via proxy', async () => {
    const pending = firstValueFrom(api.getAlbumBio('Radiohead', 'OK Computer'));
    const req = http.expectOne((r) => r.url === '/api/lastfm');
    expect(req.request.params.get('method')).toBe('album.getInfo');
    req.flush({
      album: { wiki: { summary: 'Classic album.' } },
    });
    expect(await pending).toBe('Classic album.');
  });

  it('returns empty string on error', async () => {
    const pending = firstValueFrom(api.getArtistBio('x'));
    http.expectOne((r) => r.url === '/api/lastfm').flush('err', {
      status: 500,
      statusText: 'Server Error',
    });
    expect(await pending).toBe('');
  });
});

describe('scrubBio', () => {
  it('strips trailing last.fm anchors and tags', () => {
    expect(scrubBio('Hello <a href="x">more</a>')).toBe('Hello');
    expect(scrubBio('<b>Bold</b> text')).toBe('Bold text');
  });
});
