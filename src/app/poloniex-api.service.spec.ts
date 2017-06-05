import { TestBed, inject } from '@angular/core/testing';

import { PoloniexApiService } from './poloniex-api.service';

describe('PoloniexApiService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PoloniexApiService]
    });
  });

  it('should be created', inject([PoloniexApiService], (service: PoloniexApiService) => {
    expect(service).toBeTruthy();
  }));
});
