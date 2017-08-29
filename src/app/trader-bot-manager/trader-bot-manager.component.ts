import { Component, OnInit } from '@angular/core';
import { Ng2Highcharts, Ng2Highmaps, Ng2Highstocks } from 'ng2-highcharts';
import { Http, RequestOptions, URLSearchParams } from '@angular/http';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';

import { TraderBotService } from '../services/trader-bot.service';
import { CreateTraderModalComponent } from './create-trader.modal.component';

import * as _ from "lodash";

@Component({
  selector: 'app-trader-bot-manager',
  templateUrl: './trader-bot-manager.component.html',
  styleUrls: ['./trader-bot-manager.component.css']
})
export class TraderBotManagerComponent implements OnInit {

  constructor(
    private _traderBotService:TraderBotService,
    private http: Http,
    private modalService: BsModalService
  ) {}
  
  bsModalRef: BsModalRef;
  currency_pair_select:any = [];
  // ng2-highcharts
  chartStock = {};
  public data = {
    bots: []
  };
  
  private _botName:string;
  private _botApiKey:string;
  /**
   *  @date_start - chart timestamp start
   *  @date_end - chart timestamp end
   *  @period - 300, 900, 1800, 7200, 14400, and 86400
   */
  private date_start:number;
  private date_end:number;
  private date_period:number;
  
  private stock_exchange_list:Array<any> = [{
      id: 'poloniex',
      name: `poloniex.com`,
      url: 'poloniex.com',
      // provider: this._poloniexService
    }, {
      id: 'bittrex',
      name: `bittrex.com`,
      url: 'bittrex.com',
      // provider: this._bittrexApiService
  }];
  
  ngOnInit() { 
    this.date_start = Math.round((Date.now() / 1000) - (8 * 24 * 60 * 60));
    this.date_end = Math.round(Date.now() / 1000);
    this.date_period = 1800;
    
    this.refreshBotList();
    this.loadCurrencyPairList();
  }
  
  selectBot(botUid: string):void {
    var botLast = _.find(this.data.bots, (p) => p._isSelected);
    if(botLast)
      botLast._isSelected = false;
    
    var bot = _.find(this.data.bots, (p) => p.uid == botUid);
    if(bot)
      bot._isSelected = true;
    
    this._botName = bot.name;
    
    this.loadBotData(botUid);
  }
  
  createBot():void {
    var me = this;
    
    this.bsModalRef = this.modalService.show(CreateTraderModalComponent);
    this.bsModalRef.content.title = 'Create Trader Bot';
    this.bsModalRef.content.botName = 'New bot';
    this.bsModalRef.content.botApiKey = '';
    this.bsModalRef.content.botApiSecret = '';
    
    // create stock list
    var stock_exchange_select: any[] = [];
    this.stock_exchange_list.forEach((stock: {id: string, name: string, url: string}) => {
      stock_exchange_select.push({
        id: stock.id,
        text: `${stock.name} [${stock.url}]`
      });
    });
    
    this.bsModalRef.content.stock_exchange_select = stock_exchange_select;
    this.bsModalRef.content.value_stock_select = [this.bsModalRef.content.stock_exchange_select[0]]; // first
    
    // create currency pair list
    this.bsModalRef.content.currency_pair_select = this.currency_pair_select;
    // let value = this.bsModalRef.content.currency_pair_select[0];
    // default value BTC_ZEC:
    let value = _.find(this.bsModalRef.content.currency_pair_select, (p:any) => {
      return p.id == 'BTC_ZEC';
    });
    
    this.bsModalRef.content.value_currency_pair_select = [value]; // first
    
    this.bsModalRef.content.create = function() {      
      var data = {
        name: me.bsModalRef.content.botName,
        api_key: me.bsModalRef.content.botApiKey,
        api_secret: me.bsModalRef.content.botApiSecret,
        stock_id: me.bsModalRef.content.value_stock_select[0].id,
        currency_pair: me.bsModalRef.content.value_currency_pair_select[0].id
      };
      
      me._traderBotService.addTrader(data).then(reponse => {
        me.bsModalRef.hide();
        me.refreshBotList();
      });
    };
    
    /*
    
    */
  }
  
  removeBot(botID: number):void {
    this._traderBotService.deleteTrader(botID).then(reponse => {
      console.log(reponse);
      this.refreshBotList();
    });
  }
  
  // --
  public get botName():string {
    return this._botName;
  }
 
  public set botName(value:string) {
    if(this._botName == value)
      return;
    
    this._botName = value;
  }
  
  public get botApiKey():string {
    return this._botApiKey;
  }
 
  public set botApiKey(value:string) {
    if(this._botApiKey == value)
      return;
    
    this._botApiKey = value;
  }
  
  applyBotSettings():void {
    // this._traderBotService;
  };
  
  protected refreshBotList() {
    this._traderBotService.getAllTraders().then(data => {
      this.data.bots = data;
      if(this.data.bots[0]) this.selectBot(this.data.bots[0].uid);
    });
  }
  
  protected setRangeChartData(date_start: number, date_end: number):void {
    this.date_start = Math.round(date_start/1000);
    this.date_end = Math.round(date_end/1000);
    this.date_period = this.calculatePeriod(this.date_start, this.date_end);
    
    // .throttleTime(1000)
    // this.loadBotData();
  }
  
  /**
  *  @return period like: 300, 900, 1800, 7200, 14400, and 86400
  */
  protected calculatePeriod(date_start: number, date_end: number) {
    let totalSeconds = date_end - date_start;
    let visiblePoints = 800;
    let periodList = [300, 900, 1800, 7200, 14400, 86400]; // sorted
    
    let result = _.find(periodList, (period:any) => {
      if((totalSeconds / period) < visiblePoints)
        return period;
    });
    
    console.log('totalSeconds: ' + totalSeconds);
    console.log('Period: ' + result);
    
    if(!result)
      return _.last(periodList);
    
    return result;
  }
  
  protected loadBotData(uid: string):void {
    var me = this;
    
    let params: URLSearchParams = new URLSearchParams();
    params.set('date_start', this.date_start.toString());
    params.set('date_end', this.date_end.toString());
    params.set('date_period', this.date_period.toString());
    
    let requestOptions = new RequestOptions();
    requestOptions.search = params;
    
    this.http.get('traderbot/' + uid, requestOptions).subscribe((response: any) => {
        
        let bot = response.json();
        let data = bot.charts;
        
        // split the data set into ohlc and volume
        var ohlc = [],
            volume = [],
            average = [],
            predict1 = [],
            predict2 = [],
            predict3 = [],
            predict4 = [],
            dataLength = data.length,
            // set the allowed units for data grouping
            groupingUnits = [[
                'hour',
                [1]
            ], [
                'week',                         // unit name
                [1]                             // allowed multiples
            ], [
                'month',
                [1, 2, 3, 4, 6]
            ]],

            i = 0;

        for (i; i < dataLength; i += 1) {
            ohlc.push([
                data[i][0], // the date
                data[i][1], // open
                data[i][2], // high
                data[i][3], // low
                data[i][4] // close
            ]);

            volume.push([
                data[i][0], // the date
                data[i][5] // the volume
            ]);
            
            average.push([
                data[i][0], // the date
                data[i][7] // weighted average
            ]);
            
            predict1.push([
              data[i][0], // the date
              data[i][8], // predict1
            ]);
            
            predict2.push([
              data[i][0], // the date
              data[i][9], // predict2
            ]);
            
            predict3.push([
              data[i][0], // the date
              data[i][10], // predict3
            ]);
            
            predict4.push([
              data[i][0], // the date
              data[i][11], // predict4
            ]);
        }

        // create the chart
        this.chartStock = {
            rangeSelector: {
                buttons: [{
                    type: 'hour',
                    count: 12,
                    text: '12h'
                }, {
                  type: 'day',
                  count: 1,
                  text: '1d'
                }, {
                  type: 'day',
                  count: 7,
                  text: '7D'
                }, {
                  type: 'month',
                  count: 1,
                  text: '1m'
                }, {
                  type: 'month',
                  count: 3,
                  text: '3m'
                }, {
                  type: 'year',
                  count: 1,
                  text: '1y'
                }, {
                  type: 'ytd',
                  text: 'YTD'
                }, {
                  type: 'all',
                  text: 'All'
                }],
                selected: 2,
                inputEnabled: false
            },

            // title: {
                // text: 'AAPL Historical'
            // },
            yAxis: [{
                labels: {
                    align: 'right',
                    x: -3
                },
                title: {
                    text: 'OHLC'
                },
                height: '60%',
                lineWidth: 2
            }, {
                labels: {
                    align: 'right',
                    x: -3
                },
                title: {
                    text: 'Volume'
                },
                top: '65%',
                height: '35%',
                offset: 0,
                lineWidth: 2
            }],
            
            xAxis: {
              events: {
                setExtremes: (e) => {
                  me.setRangeChartData(e.min, e.max);
                  // if(typeof(e.rangeSelectorButton)!== 'undefined') {
                    // // alert('count: '+e.rangeSelectorButton.count + 'text: ' +e.rangeSelectorButton.text + ' type:' + e.rangeSelectorButton.type);
                  // }
                }
              }
            },

            tooltip: {
                split: true
            },

            series: [{
                type: 'candlestick',
                name: 'AAPL',
                data: ohlc,
                dataGrouping: {
                    units: groupingUnits
                }
            }, {
                name: 'Qeighted Average',
                data: average,
            }, {
                name: 'p_1',
                data: predict1,
            }, {
                name: 'p_2',
                data: predict2,
            }, {
                name: 'p_3',
                data: predict3,
            }, {
                name: 'p_4',
                data: predict4,
            }, {
                type: 'column',
                name: 'Volume',
                data: volume,
                yAxis: 1,
                dataGrouping: {
                    units: groupingUnits
                }
            }, {
                type: 'flags',
                data: [{
                    x: Date.now() - (2 * 14 * 60 * 60)*1000,
                    title: 'bye',
                    text: 'some text'
                }, {
                    x: Date.now() - (2 * 18 * 60 * 60)*1000,
                    title: 'sell',
                    text: 'some txt 2'
                }, {
                    x: Date.now() - (2 * 20 * 60 * 60)*1000,
                    title: 'bye',
                    text: 'some txt'
                }, {
                    x: Date.now() - (1 * 20 * 60 * 60)*1000,
                    title: 'sell',
                    text: 'some txt'
                }, {
                    x: Date.now() - (1 * 15 * 60 * 60)*1000,
                    title: 'bye',
                    text: 'some txt'
                }, {
                    x: Date.now() - (1 * 10 * 60 * 60)*1000,
                    title: 'sell',
                    text: 'some txt'
                }],
                onSeries: 'dataseries',
                shape: 'circlepin',
                width: 16
            }]
        };
    },
    (err: any) => {
      console.error('Somethin went wrong', err);
    });
  }

  private loadCurrencyPairList():void {  
    this.http.get('/api/poloniex/returnTicker').subscribe((response: any) => {
      let data:any = response.json();
      
      this.currency_pair_select = _.map(data, (value:any, key:string) => {
        return {
          id: key, // value.id,
          text: key
        };
      });
    });
  }
}
