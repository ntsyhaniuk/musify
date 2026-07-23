import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppSpinner } from './app-spinner';

describe('AppSpinner', () => {
  let component: AppSpinner;
  let fixture: ComponentFixture<AppSpinner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppSpinner],
    }).compileComponents();

    fixture = TestBed.createComponent(AppSpinner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
