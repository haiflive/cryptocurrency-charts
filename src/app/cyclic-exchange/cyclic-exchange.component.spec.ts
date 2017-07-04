import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CyclicExchangeComponent } from './cyclic-exchange.component';

describe('CyclicExchangeComponent', () => {
  let component: CyclicExchangeComponent;
  let fixture: ComponentFixture<CyclicExchangeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CyclicExchangeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CyclicExchangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
