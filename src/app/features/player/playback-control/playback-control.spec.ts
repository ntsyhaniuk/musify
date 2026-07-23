import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaybackControl } from './playback-control';

describe('PlaybackControl', () => {
  let component: PlaybackControl;
  let fixture: ComponentFixture<PlaybackControl>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaybackControl],
    }).compileComponents();

    fixture = TestBed.createComponent(PlaybackControl);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
