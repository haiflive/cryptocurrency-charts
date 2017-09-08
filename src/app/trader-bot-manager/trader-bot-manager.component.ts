import { Component, OnInit } from '@angular/core';
import { Ng2Highcharts, Ng2Highstocks } from 'ng2-highcharts';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';

import { TraderBotService } from '../services/trader-bot.service';
import { TraderBot, PredictionConfig } from '../services/types/trader.types';
import { LoaderWaitService } from '../services/loader-wait.service';
import { PoloniexApiService } from '../services/poloniex-api.service';
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
    private _poloniexApiService: PoloniexApiService,
    private modalService: BsModalService,
    private loaderWait: LoaderWaitService
  ) {}
  
  bsModalRef: BsModalRef;
  currency_pair_select:any = [];
  // ng2-highcharts
  chartStock;
  orderBookDepth;
  _chartGrouping = false;
  
  public data = {
    bots: []
  };
  
  balances:any[];
  trade_history:any[];
  bot_config:PredictionConfig;
  
  traderBotList : TraderBot[];
  selectedBot : TraderBot;
  selectedBotIndex : number;
  // private _botName:string;
  // private _botStockId:string;
  // private _botCurrencyPair:string;
  // private _botApiKey:string;
  
  private change1h:number = 0;
  private change24h:number = 0;
  private change7d:number = 0;
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
    this.selectedBot = {
      name: '',
      api_key: '',
      stock_id: '',
      currency_pair: ''
    };

    this.selectedBotIndex = -1;

    this.date_start = Math.round((Date.now() / 1000) - (8 * 24 * 60 * 60));
    this.date_end = Math.round(Date.now() / 1000);
    this.date_period = 1800;
    
    this.refreshBotList();
    this.loadCurrencyPairList();
    this.loaderWait.hide();
  }
  
  selectBot(index: number): void {
    this.selectedBotIndex = index;
    
    let bot: TraderBot = this.traderBotList[this.selectedBotIndex];
    
    if(!bot)
      return void 0;
    
    this.selectedBot = bot;
    
    this.loadBotData(this.selectedBot.uid);
  }
  
  createBot():void {
    var me = this;
    
    this.bsModalRef = this.modalService.show(CreateTraderModalComponent);
    this.bsModalRef.content.title = 'Create Trader Bot';
    this.bsModalRef.content.botName = 'New bot';
    this.bsModalRef.content.botApiKey = 'QWXA2ZA8-UJH5ITDI-7JK8V192-R690VFDC';
    this.bsModalRef.content.botApiSecret = 'cbfd802e81509866707ca91d1e9dd68a947e16d2956c30f503f06080061037f2fe09a636fd4050e6f8e8904e34b7af5421d7f3663da36365905421485b412e99';
    
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
      return p.id == 'XMR_ZEC';
    });
    
    this.bsModalRef.content.value_currency_pair_select = [value]; // first
    
    this.bsModalRef.content.create = function() {      
      var data: TraderBot = {
        name: me.bsModalRef.content.botName,
        api_key: me.bsModalRef.content.botApiKey,
        api_secret: me.bsModalRef.content.botApiSecret,
        stock_id: me.bsModalRef.content.value_stock_select[0].id,
        currency_pair: me.bsModalRef.content.value_currency_pair_select[0].id
      };
      
      me._traderBotService.addTrader(data).then(reponse => {
        me.bsModalRef.hide();
        me.refreshBotList(true);
      });
    };
  }
  
  removeBot(uid: string):void {
    this._traderBotService.deleteTrader(uid).then(reponse => {
      console.log(reponse);
      this.refreshBotList();
    });
  }
  
  // --
  public get botName():string {
    return this.selectedBot.name;
  }
 
  public set botName(value:string) {
    if(this.selectedBot.name == value)
      return;
    
    this.selectedBot.name = value;
  }
  
  public get botApiKey():string {
    return this.selectedBot.api_key;
  }
 
  public set botApiKey(value:string) {
    if(this.selectedBot.api_key == value)
      return;
    
    this.selectedBot.api_key = value;
  }
  
  updateBotSettings():void {
    this._traderBotService.updateTrader(this.selectedBot);
  };
  
  protected refreshBotList(selectJustCreated: boolean = false) {
    this._traderBotService.getAllTraders().then(data => {
      this.traderBotList = data;
      
      let selectIndex = 0;
      if(selectJustCreated)
        selectIndex = this.traderBotList.length - 1;

      this.selectBot(selectIndex);
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
    
    let params = {
      date_start: this.date_start,
      date_end: this.date_end,
      date_period: this.date_period
    };
    
    this._traderBotService.getTrader(uid, params)
    .then((response: any) => {
        let bot = response;
        let data = bot.charts;
        let dataDepth = bot.depth;
        let balances = [];
        _.each(bot.balances, (val, key) => {
          balances.push({name: key, value: val});
        });
        
        me.balances = balances;
        me.trade_history = bot.trade_history;
        me.bot_config = bot.config;
        
        let trade_list = _.map(me.trade_history, (p:any) => {
          return {
            x: new Date(p.date).getTime(),
            title: p.type,
            text: `total: ${p.total}, (rate: ${p.rate}, amount: ${p.amount}`
          };
        });
        
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
              data[i][9], // predict3
            ]);
            
            predict3.push([
              data[i][0], // the date
              data[i][10], // predict4
            ]);
            
            predict4.push([
              data[i][0], // the date
              data[i][11], // predict5
            ]);
        }
        
        let period_1h = Math.round(Date.now() - (60*60 * 1000));
        let period_24h = Math.round(Date.now() - (24*60*60 * 1000));
        let period_7d = Math.round(Date.now() - (7*24*60*60 * 1000));
        
        // calculate change:
        this.change1h = this.calculateChange(average, period_1h);
        this.change24h = this.calculateChange(average, period_24h);
        this.change7d = this.calculateChange(average, period_7d);
        
        /**
         *  @chartStock
         *  @orderBookDepth
         *  @API - http://api.highcharts.com/highcharts/
         */
        this.chartStock = {
            rangeSelector: {
                buttons: [{
                    type: 'hour',
                    count: 12,
                    text: '12h'
                }, {
                  type: 'day',
                  count: 1,
                  text: '24h'
                }, {
                  type: 'day',
                  count: 7,
                  text: '7d'
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
                // text: 'chart Title'
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
                data: trade_list,
                onSeries: 'dataseries',
                shape: 'circlepin',
                width: 16
            }]
        };
        
        
        let result : any;
        let chartGroupingDecimals = 6;
        
        if(this._chartGrouping) {
          result = this.prepareDepthDataGrouped(dataDepth, chartGroupingDecimals);
        } else {
          result = this.prepareDepthDataLinear(dataDepth);
        }
        
        this.orderBookDepth = {
          chart: {
            type: 'line'
          },
          title: {
            text: ''
          },
          xAxis: {
            categories: result.chart_labels,
            allowDecimals: true
          },
          yAxis: {
            title: {
              text: 'Coins'
            }
          },
          tooltip: {
            shared: true
          },
          plotOptions: {
              line: {
                  animation: false
              }
          },
          series: result.chart_data
        };
    },
    (err: any) => {
      console.error('Somethin went wrong', err);
    });
  }

  private loadCurrencyPairList():void {  
    this.loaderWait.show();
    
    this._poloniexApiService.getReturnTicker()
    .then((response: any) => {
      this.loaderWait.hide();
      let data:any = response;
      
      this.currency_pair_select = _.map(data, (value:any, key:string) => {
        return {
          id: key, // value.id,
          text: key
        };
      });
    });
  }
  
  private prepareDepthDataLinear(data:any) : any {
      let chart_data_volume_btc: Array<number> = [];
      let chart_data_total_btc: Array<number> = [];
      let chart_data_volume: Array<number> = [];
      let chart_data_asks_depth: Array<number> = [];
      let chart_data_bids_depth: Array<number> = [];
      let chart_labels: Array<string> = [];
      let source_coin = this.selectedBot.currency_pair.slice(0,3);
      
      
      for(let i = 0, total_coins:number = 0, btc_total:number = 0; i < data.bids.length; i++) {
          total_coins = +total_coins + +data.bids[i][1];
          let btc = +data.bids[i][1] * +data.bids[i][0];
          btc_total = +btc_total + +btc;
          
          chart_data_volume_btc.unshift( btc );
          chart_data_total_btc.unshift( btc_total );
          chart_data_volume.unshift(data.bids[i][1]);
          chart_data_asks_depth.unshift(0);
          chart_data_bids_depth.unshift(total_coins);
          chart_labels.unshift(data.bids[i][0]+' ' + source_coin);
      }
      
      for(let i = 0, total_coins:number = 0, btc_total:number = 0; i < data.asks.length; i++) {
          total_coins = +total_coins + +data.asks[i][1];
          let btc = +data.asks[i][1] * +data.asks[i][0];
          btc_total = +btc_total + +btc;
          
          chart_data_volume_btc.push( btc );
          chart_data_total_btc.push( btc_total );
          chart_data_volume.push(data.asks[i][1]);
          chart_data_asks_depth.push(total_coins);
          chart_data_bids_depth.push(0);
          chart_labels.push(data.asks[i][0]+' ' + source_coin);
      }
        
      return {
          chart_labels: chart_labels,
          chart_data: [
                {data: chart_data_volume_btc, name: source_coin, type: 'column'},
                {data: chart_data_volume, name: 'Coins', type: 'column'},
                {data: chart_data_asks_depth, name: 'Asks Coins', type: 'area'},
                {data: chart_data_bids_depth, name: 'Bids Coins', type: 'area'},
                {data: chart_data_total_btc, name: source_coin + ' Depth', type: 'area', visible: false}
            ]
      }
  }
  
  private prepareDepthDataGrouped(data:any, deciamls:number) : any {
    data.asks = this.groupChartPoints(data.asks, deciamls);
    data.bids = this.groupChartPoints(data.bids, deciamls);
    
    return this.prepareDepthDataLinear(data);
  }
  
  private groupChartPoints(points:Array<number>, round_dec:number) : Array<number> {
    if(round_dec > 17)
      round_dec = 17;
    
    let result: Array<number> = [];
    let chart_pint_first = points[0]; // first point
    chart_pint_first[0] = (+chart_pint_first[0]).toFixed(round_dec);// round price
    result.push(chart_pint_first);
    
    for(let i = 1; i< points.length; i++) {
      let chart_pint = points[i];
      chart_pint[0] = (+chart_pint[0]).toFixed(round_dec);// round price
      
      let last_point_index = result.length - 1;
      
      if( (+result[last_point_index][0]).toFixed(round_dec) == (+chart_pint[0]).toFixed(round_dec) ) {
        result[last_point_index][1] = +result[last_point_index][1] + +chart_pint[1]; // sum count
      } else {
        result.push(chart_pint); // new point
      }
    }
    
    return result;
  }
  
  /**
   *  @charts Array [time, value]
   *  @start_point [timestamp]
   *  @return number
   */
  private calculateChange(charts:any[], start_point:number) : number
  {
    let current = _.last(charts);
    let destionation = _.findLast(charts, (p) => {
      return  p[0] < start_point;
    });
    
    let result:number = 100 - (+destionation[1] / +current[1] * 100);
    
    return +result.toFixed(2);
  }
}
