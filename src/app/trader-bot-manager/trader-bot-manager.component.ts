import { Component, OnInit } from '@angular/core';
import { Ng2Highcharts, Ng2Highstocks } from 'ng2-highcharts';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';

import { TraderBotService } from '../services/trader-bot.service';
import { TraderBot, PredictionConfig, TriggerIndexItem, TraderBotConst } from '../services/types/trader.types';
import { LoaderWaitService } from '../services/loader-wait.service';
import { PoloniexApiService } from '../services/poloniex-api.service';
import { CreateTraderModalComponent } from './create-trader.modal.component';
import { TraderBotHelper } from './trader.bot.helper';

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
  // ng2-highcharts
  chartStock;
  orderBookDepth;
  _chartGrouping = false;
  
  public data = {
    bots: []
  };
  
  balances:any[];
  trade_history:any[];
  open_orders:any[];
  
  traderBotList : TraderBot[];
  selectedBot : TraderBot;
  selectedBotIndex : number;
  prediction_average: number;
  index_list: TriggerIndexItem[];
  
  private change1h:number = 0;
  private change24h:number = 0;
  private change7d:number = 0;
  private change_pretioction_time:number = 0;
  /**
   *  @date_start - chart timestamp start
   *  @date_end - chart timestamp end
   *  @period - 300, 900, 1800, 7200, 14400, and 86400
   */
  private date_start:number;
  private date_end:number;
  private date_period:number;
  
  /**
   * 
   */
  private _order_price: number;
  private _order_amount: number;
  private _order_total: number;
  
  ngOnInit() {
    this.selectedBot = TraderBotHelper.buildTrader();

    this.selectedBotIndex = -1;

    this.date_start = Math.round((Date.now() / 1000) - (8 * 24 * 60 * 60));
    this.date_end = Math.round(Date.now() / 1000);
    this.date_period = 1800;
    
    this.refreshBotList();
    this.loaderWait.hide();
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

  get orderPrice(): number {
    return this._order_price;
  }

  set orderPrice(value: number) {
    this._order_price = value;
    this._order_total = 0;

    if(this._order_price && this._order_amount)
      this._order_total = this._order_price * this._order_amount;
  }

  get orderAmount(): number {
    return this._order_amount;
  }

  set orderAmount(value: number) {
    this._order_amount = value;

    this._order_total = 0;

    if(this._order_price && this._order_amount)
      this._order_total = this._order_price * this._order_amount;
  }

  get orderTotal(): number {
    return this._order_total;
  }

  set orderTotal(value: number) {
    this._order_total = value;
    this._order_amount = 0;

    if(this._order_total && this._order_price)
      this._order_amount = this._order_total / this._order_price;
  }

  // _order_amount
  // _order_total
  
  // --
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

    this.bsModalRef.content.create = function() {
      var data: TraderBot = me.bsModalRef.content.trader;
      me.loaderWait.show();
      me._traderBotService.addTrader(data).then(reponse => {
        me.loaderWait.hide();
        me.bsModalRef.hide();
        me.refreshBotList(true);
      });
    };
  }
  
  removeBot(uid: string):void {
    this.loaderWait.show();
    this._traderBotService.deleteTrader(uid).then(reponse => {
      this.loaderWait.hide();
      this.refreshBotList();
    });
  }
  
  updateBotSettings():void {
    this.loaderWait.show();
    this._traderBotService.updateTrader(this.selectedBot).then(data => {
      this.loaderWait.hide();
    });
  };
  
  traderAddOrderBuy(): void {
    this.loaderWait.show();
    this._traderBotService.addOrder(this.selectedBot.uid, {
      type: 'buy',
      amount: this.orderAmount,
      price: this.orderPrice
    }).then(()=> {
      this.loaderWait.hide();
    });
  }

  traderAddOrderSell(): void {
    this.loaderWait.show();
    this._traderBotService.addOrder(this.selectedBot.uid, {
      type: 'sell',
      amount: this.orderAmount,
      price: this.orderPrice
    }).then(()=> {
      this.loaderWait.hide();
    });
  }

  traderCancelOrder(order_number: number): void {
    this.loaderWait.show();
    this._traderBotService.cancelOrder(this.selectedBot.uid, order_number).then(()=> {
      this.loaderWait.hide();
    });
  }

  getTrigetIndexName(uid: string): string {
    let trigger_index = _.find(TraderBotConst.TRIGGER_INDEXES, (p: any) => {
      return p.uid == uid;
    });

    if(trigger_index)
      return trigger_index.name;
    
    return '-';
  }

  protected refreshBotList(selectJustCreated: boolean = false) {
    this.loaderWait.show();
    this._traderBotService.getAllTraders().then(data => {
      this.loaderWait.hide();
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
    let params = {
      date_start: this.date_start,
      date_end: this.date_end,
      date_period: this.date_period
    };
    var me = this;
    
    this.loaderWait.show();
    this._traderBotService.getTrader(uid, params)
    .then((response: any) => {
      this.loaderWait.hide();
      let source_coin = this.selectedBot.currency_pair.slice(0,3);
      let bot = response;
      let data = bot.charts;
      let dataDepth = bot.depth;
      let balances = [];
      _.each(bot.balances, (val, key) => {
        balances.push({name: key, value: val});
      });
      
      this.balances = balances;
      this.trade_history = bot.trade_history;
      this.open_orders = bot.open_orders;
      this.change1h = +bot.change1h;
      this.change24h = bot.change24h;
      this.change7d = bot.change7d;
      this.change_pretioction_time = bot.change_pretioction_time;
      this.prediction_average = bot.prediction_average;
      this.index_list = bot.index_list;
      
      let trade_list = _.map(this.trade_history, (p:any) => {
        return {
          x: new Date(p.date).getTime(),
          title: p.type,
          text: `total: ${p.total}, (rate: ${p.rate}, amount: ${p.amount}`
        };
      });
      
      let order_list = _.map(this.open_orders, (p:any) => {
        return {
          x: new Date(p.date).getTime(),
          title: p.type + '!',
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
              this.setRangeChartData(e.min, e.max);
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
            name: source_coin,
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
        }, {
            type: 'flags',
            data: order_list,
            onSeries: 'dataseries',
            shape: 'circlepin',
            width: 20
        }]
      };
      
      
      let result : any;
      let chartGroupingDecimals = 6;
      
      if(this._chartGrouping) {
        result = this.prepareDepthDataGrouped(dataDepth, chartGroupingDecimals);
      } else {
        result = this.prepareDepthDataLinear(dataDepth);
      }

      let series_depth: any[] = result.chart_data;
      
      // add prediction markers
      let x_asks = _.findIndex(result.chart_labels, (p: number) => {
        return +p >= +bot.pretioction_depth_min_asks[0];
      });

      let x_bids = _.findIndex(result.chart_labels, (p: number) => {
        return +p >= +bot.pretioction_depth_min_bids[0];
      });

      let x_deviation_up = _.findIndex(result.chart_labels, (p: number) => {
        return +p >= +bot.prediction_deviation_up;
      });

      let x_deviation_down = _.findIndex(result.chart_labels, (p: number) => {
        return +p >= +bot.prediction_deviation_down;
      });

      let x_average = _.findIndex(result.chart_labels, (p: number) => {
        return +p >= +bot.prediction_average;
      });

      let x_buy = _.findIndex(result.chart_labels, (p: number) => {
        return +p >= +bot.prediction_buy;
      });

      let x_sell = _.findIndex(result.chart_labels, (p: number) => {
        return +p >= +bot.prediction_sell;
      });

      let depth_prediction_markers = [{
        x: x_buy,
        title: 'buy',
        text: `Prediction buy, amount: ${bot.prediction_buy}`
      }, {
        x: x_sell,
        title: 'sell',
        text: `Prediction sell, amount: ${bot.prediction_sell}`
      }];

      let depth_extremums = [{
        x: x_asks,
        title: '>',
        text: `Prediction min asks, amount: ${bot.pretioction_depth_min_asks[0]}`
      }, {
        x: x_bids,
        title: '<',
        text: `Prediction min bids, amount: ${bot.pretioction_depth_min_bids[0]}`
      }, {
        x: x_average,
        title: '|',
        text: `Prediction chart average, amount: ${bot.prediction_average}`
      }, {
        x: x_deviation_up,
        title: '>|',
        text: `Prediction chart up, amount: ${bot.prediction_deviation_up}`
      }, {
        x: x_deviation_down,
        title: '|<',
        text: `Prediction chart down, amount: ${bot.prediction_deviation_down}`
      }];
      
      series_depth.push({
          name: 'Extremums',
          type: 'flags',
          data: depth_extremums,
          onSeries: 'dataseries',
          shape: 'circlepin',
          width: 14
      });

      series_depth.push({
          name: 'Predictions',
          type: 'flags',
          data: depth_prediction_markers,
          onSeries: 'dataseries',
          shape: 'circlepin',
          width: 16
      });

      this.orderBookDepth = {
        chart: {
          type: 'line',
          zoomType: 'x',
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
          shared: true,
          headerFormat: '{point.key} [' + source_coin + "]<br>",
        },
        plotOptions: {
          line: {
              animation: false
          },
          series: {
            cursor: 'pointer',
            point: {
              events: {
                click: function () {
                  me.orderPrice = this.category;
                }
              }
            }
          }
        },
        series: series_depth
      };
    },
    (err: any) => {
      console.error('Somethin went wrong', err);
    });
  }

  private prepareDepthDataLinear(data:any) : any {
      let chart_data_volume_btc: Array<number> = [];
      let chart_data_total_btc: Array<number> = [];
      let chart_data_volume: Array<number> = [];
      let chart_data_asks_depth: Array<number> = [];
      let chart_data_bids_depth: Array<number> = [];
      let chart_labels: Array<number> = [];
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
          chart_labels.unshift(+data.bids[i][0]);
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
          chart_labels.push(+data.asks[i][0]);
      }
        
      return {
          chart_labels: chart_labels,
          chart_data: [
                {data: chart_data_volume_btc, name: source_coin, type: 'column', visible: false},
                {data: chart_data_volume, name: 'Coins', type: 'column'},
                {data: chart_data_asks_depth, name: 'Asks', type: 'area'},
                {data: chart_data_bids_depth, name: 'Bids', type: 'area'},
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
}
