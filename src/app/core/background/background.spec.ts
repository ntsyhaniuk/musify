import { TestBed } from '@angular/core/testing';

import { Background } from './background';

describe('Background', () => {
  let service: Background;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Background);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('sets and clears background url', () => {
    service.setBackground('https://example.com/cover.jpg');
    expect(service.backgroundUrl()).toBe('https://example.com/cover.jpg');
    service.setBackground(null);
    expect(service.backgroundUrl()).toBeNull();
  });
});
