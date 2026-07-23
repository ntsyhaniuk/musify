import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { App } from './app';
import { Auth } from '@app/core/auth/auth';
import { Player } from '@app/features/player/player';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        {
          provide: Auth,
          useValue: {
            init: vi.fn().mockResolvedValue(undefined),
            isAuthenticated: vi.fn().mockReturnValue(false),
            authorize: vi.fn(),
          },
        },
        {
          provide: Player,
          useValue: {
            init: vi.fn().mockResolvedValue(undefined),
            isVisible: () => false,
            isPlaying: () => false,
            currentTrack: () => null,
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the Musify brand', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Musify');
  });
});
