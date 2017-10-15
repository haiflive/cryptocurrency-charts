import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';
import { PoloniexApiService } from '../services/poloniex-api.service';
import { BittrexApiService } from '../services/bittrex-api.service';
import { TraderBot, TraderBotConst } from '../services/types/trader.types';
import { TraderBotHelper } from './trader.bot.helper';
import { LoaderWaitService } from '../services/loader-wait.service';
import { Observable } from 'rxjs';

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
    private _bittrexApiService: BittrexApiService,
    private loaderWait: LoaderWaitService
  ) {}

  ngOnInit() {
    let me = this;
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
  }
  
  public selectedStock(value:any):void {
    this.trader.stock_id = value.id;
    this.value_stock_select = [value];
    
    this.setupCurrencyPairSelect(this.trader.stock_id);
  }
  
  public selectCurrencyPair(value:any):void {
    this.trader.currency_pair = value.id;
    this.value_currency_pair_select = [value];
  }

  protected async setupCurrencyPairSelect(stock_id) {
    this.loaderWait.show();
    switch(stock_id) {
      case 'poloniex':
          this.currency_pair_select = await this.loadPoloniexCurrencyPair();
        break;
      case 'bittrex':
          this.currency_pair_select = await this.loadBittrexCurrencyPair();
        break;
      default:
        console.log('Unknown stock');
    }
    
    let value = _.find(this.currency_pair_select, (p:any) => {
      return p.id == this.trader.currency_pair;
    });

    if(_.isEmpty(value))
      value = _.first(this.currency_pair_select);
    
    this.selectCurrencyPair(value);

    this.loaderWait.hide();
  }

  loadPoloniexCurrencyPair() {
    return Observable.fromPromise(this._poloniexApiService.getReturnTicker())
      .map((response: any) => {
        let data: any = response;
        
        return _.map(data, (value: any, key: string) => {
          return {
            id: key, // value.id,
            text: key
          };
        });
      })
      .toPromise();
  }

  protected async loadBittrexCurrencyPair() {
    return Observable.fromPromise(this._bittrexApiService.getmarketsummaries())
      .map((response: any) => {
        let data: any = response;

        return _.map(data, (p:any) => {
          return {
            id: p.MarketName,
            text: p.MarketName
          }
        });
      })
      .toPromise();
  }
}