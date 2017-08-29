import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TraderBotManagerComponent } from './trader-bot-manager.component';

describe('TraderBotManagerComponent', () => {
  let component: TraderBotManagerComponent;
  let fixture: ComponentFixture<TraderBotManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TraderBotManagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TraderBotManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
