import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrencyMonitorComponent } from './currency-monitor.component';

describe('CurrencyMonitorComponent', () => {
  let component: CurrencyMonitorComponent;
  let fixture: ComponentFixture<CurrencyMonitorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CurrencyMonitorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrencyMonitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
