import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PredictionTriggerComponent } from './prediction.trigger.component';

describe('PredictionTriggerComponent', () => {
  let component: PredictionTriggerComponent;
  let fixture: ComponentFixture<PredictionTriggerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PredictionTriggerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PredictionTriggerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
