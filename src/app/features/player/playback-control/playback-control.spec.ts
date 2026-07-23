import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

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
            formatTime: (ms: number) => '0:00',
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
});
