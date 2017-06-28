import { TestBed, inject } from '@angular/core/testing';

import { BittrexApiService } from './bittrex-api.service';

describe('BittrexApiService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BittrexApiService]
    });
  });

  it('should be created', inject([BittrexApiService], (service: BittrexApiService) => {
    expect(service).toBeTruthy();
  }));
});
