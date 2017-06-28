import { TestBed, inject } from '@angular/core/testing';

import { CoinmarketcapApiService } from './coinmarketcap-api.service';

describe('CoinmarketcapApiService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CoinmarketcapApiService]
    });
  });

  it('should be created', inject([CoinmarketcapApiService], (service: CoinmarketcapApiService) => {
    expect(service).toBeTruthy();
  }));
});
