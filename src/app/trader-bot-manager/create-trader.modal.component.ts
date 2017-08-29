import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';

@Component({
  selector: 'modal-content',
  templateUrl: './create-trader.modal.component.html'
})
export class CreateTraderModalComponent {
  public title: string;
  
  public botName: string;
  public botApiKey: string;
  public botApiSecret: string;
  
  // Select Currency Source
  public stock_exchange_select: any[];
  public value_stock_select: any[]; // array of values
  
  public currency_pair_select: any[];
  public value_currency_pair_select: any[]; // array of values
  
  constructor(public bsModalRef: BsModalRef) {}
  
  
  public selectedStock(value:any):void {
    this.value_stock_select = [value];
  }
  
  public selectCurrencyPair(value:any):void {
    this.value_currency_pair_select = [value];
  }
}