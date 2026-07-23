import { TestBed } from '@angular/core/testing';

import { LastfmApi } from './lastfm-api';

describe('LastfmApi', () => {
  let service: LastfmApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LastfmApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
