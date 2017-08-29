import { TestBed, inject } from '@angular/core/testing';

import { TraderBotService } from './trader-bot.service';

describe('TraderBotService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TraderBotService]
    });
  });

  it('should be created', inject([TraderBotService], (service: TraderBotService) => {
    expect(service).toBeTruthy();
  }));
});
