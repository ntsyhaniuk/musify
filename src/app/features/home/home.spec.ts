import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { Home } from './home';
import { Auth } from '@app/core/auth/auth';
import { SpotifyApi } from '@app/data-access/spotify/spotify-api';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        {
          provide: Auth,
          useValue: { isAuthenticated: () => false },
        },
        {
          provide: SpotifyApi,
          useValue: {
            getHomeSections: () => of([]),
            searchPaginated: () => of({}),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
