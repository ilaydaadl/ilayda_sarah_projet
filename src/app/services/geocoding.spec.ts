import { TestBed } from '@angular/core/testing';

import { GeocodingService } from './geocoding';

describe('Geocoding', () => {
  let service: GeocodingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeocodingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
