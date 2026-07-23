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

  it('keeps loading until all nested show/hide pairs complete', () => {
    service.show();
    service.show();
    expect(service.isLoading()).toBe(true);
    service.hide();
    expect(service.isLoading()).toBe(true);
    service.hide();
    expect(service.isLoading()).toBe(false);
  });

  it('does not go negative when hide is called without show', () => {
    service.hide();
    expect(service.isLoading()).toBe(false);
    service.show();
    expect(service.isLoading()).toBe(true);
    service.hide();
    expect(service.isLoading()).toBe(false);
  });
});
