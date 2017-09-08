import { TestBed, inject } from '@angular/core/testing';

import { LoaderWaitService } from './loader-wait.service';

describe('LoaderWaitService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoaderWaitService]
    });
  });

  it('should be created', inject([LoaderWaitService], (service: LoaderWaitService) => {
    expect(service).toBeTruthy();
  }));
});
