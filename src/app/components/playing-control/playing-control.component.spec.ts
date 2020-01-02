import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayingControlComponent } from './playing-control.component';

describe('PlayingControlComponent', () => {
  let component: PlayingControlComponent;
  let fixture: ComponentFixture<PlayingControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayingControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayingControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
