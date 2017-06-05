import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RadarChartCurrencyComponent } from './radar-chart-currency.component';

describe('RadarChartCurrencyComponent', () => {
  let component: RadarChartCurrencyComponent;
  let fixture: ComponentFixture<RadarChartCurrencyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RadarChartCurrencyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RadarChartCurrencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
