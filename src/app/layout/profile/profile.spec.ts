import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { Profile } from './profile';
import { Auth } from '@app/core/auth/auth';
import { SpotifyApi } from '@app/data-access/spotify/spotify-api';

describe('Profile', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [
        provideHttpClient(),
        { provide: Auth, useValue: { isAuthenticated: () => false } },
        { provide: SpotifyApi, useValue: { getCurrentUser: () => of(undefined) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
