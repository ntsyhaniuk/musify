import { TestBed } from '@angular/core/testing';

import { Spinner } from './spinner';

describe('Spinner', () => {
  let service: Spinner;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Spinner);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('toggles loading signal', () => {
    expect(service.isLoading()).toBe(false);
    service.show();
    expect(service.isLoading()).toBe(true);
    service.hide();
    expect(service.isLoading()).toBe(false);
  });
});
