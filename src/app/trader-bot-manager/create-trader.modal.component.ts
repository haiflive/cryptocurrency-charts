import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';
import { PoloniexApiService } from '../services/poloniex-api.service';
import { TraderBot, TraderBotConst } from '../services/types/trader.types';
import { TraderBotHelper } from './trader.bot.helper';
import { LoaderWaitService } from '../services/loader-wait.service';

import * as _ from "lodash";

@Component({
  selector: 'modal-content',
  templateUrl: './create-trader.modal.component.html'
})
export class CreateTraderModalComponent implements OnInit {
  public trader: TraderBot;

  // Select Currency Source
  public stock_exchange_select: any[];
  public value_stock_select: any[]; // array of values
  
  public currency_pair_select: any[];
  public value_currency_pair_select: any[]; // array of values
  
  constructor(
    public bsModalRef: BsModalRef,
    private _poloniexApiService: PoloniexApiService,
    private loaderWait: LoaderWaitService
  ) {}

  ngOnInit() {
    var me = this;

    this.trader = TraderBotHelper.buildTrader();

    var stock_exchange_select: any[] = [];
    TraderBotConst.STOCK_EXCHANGE_LIST.forEach((stock: {id: string, name: string, url: string}) => {
      stock_exchange_select.push({
        id: stock.id,
        text: `${stock.name} [${stock.url}]`
      });
    });

    this.stock_exchange_select = stock_exchange_select;
    let value = _.find(this.stock_exchange_select, (p) => {
        return p.id == me.trader.stock_id;
    });
    
    this.selectedStock(value); // first
    
    // --
    this.loaderWait.show();
    this._poloniexApiService.getReturnTicker()
    .then((response: any) => {
      this.loaderWait.hide();
      let data: any = response;
      
      me.currency_pair_select = _.map(data, (value: any, key: string) => {
        return {
          id: key, // value.id,
          text: key
        };
      });
      
      // let value = this.currency_pair_select[0];
      // default value XMR_ZEC:
      let value = _.find(me.currency_pair_select, (p:any) => {
        return p.id == me.trader.currency_pair;
      });
      
      me.selectCurrencyPair(value); // first
    });
  }
  
  public selectedStock(value:any):void {
    this.trader.stock_id = value.id;
    this.value_stock_select = [value];
  }
  
  public selectCurrencyPair(value:any):void {
    this.trader.currency_pair = value.id;
    this.value_currency_pair_select = [value];
  }
}