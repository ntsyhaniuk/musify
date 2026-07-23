import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';

import { PlaybackControl } from './playback-control';
import { Player } from '../player';

describe('PlaybackControl', () => {
  let component: PlaybackControl;
  let fixture: ComponentFixture<PlaybackControl>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaybackControl],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        {
          provide: Player,
          useValue: {
            isVisible: () => false,
            isPlaying: () => false,
            shuffle: () => false,
            hasNext: () => false,
            hasPrevious: () => false,
            repeatMode: () => 0,
            position: () => 0,
            duration: () => 0,
            volume: () => 50,
            currentTrack: () => null,
            formatTime: () => '0:00',
            toggleShuffle: vi.fn(),
            previousTrack: vi.fn(),
            togglePlay: vi.fn(),
            nextTrack: vi.fn(),
            cycleRepeatMode: vi.fn(),
            seek: vi.fn(),
            setVolume: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PlaybackControl);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('navigates to album when albumId is present', () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const player = TestBed.inject(Player) as unknown as {
      currentTrack: () => { albumId: string } | null;
    };
    player.currentTrack = () => ({ albumId: 'album123' });

    (component as unknown as { goToAlbum: () => void }).goToAlbum();
    expect(navigate).toHaveBeenCalledWith(['/details', 'album', 'album123']);
  });
});
