import { Component, OnInit } from '@angular/core';
import { Ng2Highcharts, Ng2Highstocks } from 'ng2-highcharts';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';

import { TraderBotService } from '../services/trader-bot.service';
import { TraderBot, PredictionConfig, TriggerIndexItem, TraderBotConst,
         OrderItem, TraderBotStatistic } from '../services/types/trader.types';
import { LoaderWaitService } from '../services/loader-wait.service';
import { PoloniexApiService } from '../services/poloniex-api.service';
import { CreateTraderModalComponent } from './create-trader.modal.component';
import { TraderBotHelper } from './trader.bot.helper';
import { Observable, Subscription } from 'rxjs';
import { OpenOrder } from '../services/types/trader.types';
import { OrderSortArgs, OrderSortDirection } from './common/orders.sort.pipe';

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
  source_coin_code: string;
  trading_coin_code: string;
  trade_history:any[];
  open_orders:any[];
  open_orders_filter: OpenOrder;
  open_orders_sort: OrderSortArgs;
  orders_total_buy: number;
  orders_total_sell: number;
  
  traderBotList : TraderBot[];
  selectedBot : TraderBot;
  selectedBotIndex : number;
  prediction_average: number;
  index_list: TriggerIndexItem[];
  
  change1h:number = 0;
  change24h:number = 0;
  change7d:number = 0;
  change_pretioction_time:number = 0;
  statistic: TraderBotStatistic;
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
    this.open_orders_filter = {
      orderNumber: '',
      type: '',
      rate: 0,
      startingAmount: 0,
      amount: 0,
      total: 0,
      date: 0,
      margin:0,
    };

    this.open_orders_sort = {
      filed_name: '',
      direction: OrderSortDirection.ASC
    };

    this.orders_total_buy = 0;
    this.orders_total_sell = 0;

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
  protected _watch_trader_subscription: any;
  selectBot(index: number): void {
    this.selectedBotIndex = index;
    
    let bot: TraderBot = this.traderBotList[this.selectedBotIndex];
    
    if(!bot) {
      console.log('BUG, need clear bot data');
      return void 0;
    }
    
    this.selectedBot = bot;
    this.loadBotData(this.selectedBot._id, true);

    if(this._watch_trader_subscription) {
      this._watch_trader_subscription.unsubscribe();
      delete this._watch_trader_subscription;
    }

    this._watch_trader_subscription = this._traderBotService.watchTrader(this.selectedBot._id)
      .subscribe((data: any) => {
        this.loadBotData(this.selectedBot._id);
      });
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
  
  removeBot(_id: string):void {
    this.loaderWait.show();
    this._traderBotService.deleteTrader(_id).then(reponse => {
      this.loaderWait.hide();
      this.refreshBotList();
    });
  }
  
  updateBotSettings():void {
    this.loaderWait.show();
    this.selectedBot.bot_config.triggers;
    let action = this.selectedBot.bot_config.triggers[0].actions[0];
    
    this._traderBotService.updateTrader(this.selectedBot).then(
      (data) => {
        this.loaderWait.hide();
        // refresh bot charts:
        this.selectBot(this.selectedBotIndex);
      },
      (error) => {
        alert(JSON.stringify(error));
      }
    );
  };
  
  traderAddOrderBuy(): void {
    this.loaderWait.show();
    this._traderBotService.addOrder(this.selectedBot._id, {
      type: 'buy',
      amount: this.orderAmount,
      price: this.orderPrice
    }).then((res)=> {
      if(!res.success) {
        alert(res.message);
      }
      
      this.loaderWait.hide();
    });
  }

  traderAddOrderSell(): void {
    this.loaderWait.show();
    this._traderBotService.addOrder(this.selectedBot._id, {
      type: 'sell',
      amount: this.orderAmount,
      price: this.orderPrice
    }).then(()=> {
      this.loaderWait.hide();
    });
  }

  traderCancelOrder(order_number: number): void {
    this.loaderWait.show();
    this._traderBotService.cancelOrder(this.selectedBot._id, order_number).then(()=> {
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

  timestampToUtcDate(timestamp) {
    let date = new Date(timestamp*1000);
    return date.toUTCString();
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
  
  protected loadBotData(_id: string, show_loader: boolean = false):void {
    if(show_loader) this.loaderWait.show();
    this._traderBotService.getTrader(_id)
    .then((data) => {
        if(show_loader) this.loaderWait.hide();
        this.setupBotData(data);
      },
      (err: any) => console.error('Somethin went wrong', err)
    );
  }

  protected setupBotData(bot: any) {
      let data = bot.charts;
      let dataDepth = bot.depth;
      
      if(!_.isEmpty(bot.errors)) {
        alert(bot.errors);
      }

      this.balances = bot.balances;
      let coin_codes = bot.currency_pair.match(/[a-zA-Z]+/g);
      this.source_coin_code = coin_codes[0];
      this.trading_coin_code = coin_codes[1];

      this.trade_history = bot.trade_history;
      this.open_orders = bot.open_orders;
      this.change1h = +bot.change1h;
      this.change24h = bot.change24h;
      this.change7d = bot.change7d;
      this.change_pretioction_time = bot.change_pretioction_time;
      this.prediction_average = bot.prediction_average;
      this.index_list = bot.index_list;
      this.statistic = bot.statistic;
      
      let trade_list = _.map(this.trade_history, (p:any) => {
        return {
          x: p.date * 1000,
          title: p.type,
          text: `total: ${p.total}, (rate: ${p.rate}, amount: ${p.amount}`
        };
      });

      // calculate opent order total
      let order_groups = _.groupBy(this.open_orders, (p: OpenOrder) => p.type);
      let buy_orders = _.orderBy(order_groups.buy, (p: OpenOrder) => -p.rate); // "+"
      let sell_orders = _.orderBy(order_groups.sell, (p: OpenOrder) => +p.rate); // "-"

      this.orders_total_buy  = _.sumBy(buy_orders, (p: OpenOrder) => +p.total); // source
      this.orders_total_sell = _.sumBy(sell_orders, (p: OpenOrder) => +p.amount); // trading
      
      // --------------- configure charts ------------
      let order_list_charts = _.map(this.open_orders, (p:any) => {
        return {
          x: p.date * 1000,
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
            'minute',
            [1, 2, 5, 10, 15, 30]
          ], [
            'hour',
            [1, 2, 3, 4, 6, 8, 12]
          ], [
            'week',
            [1, 2, 3, 4, 5, 6, 7]
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
          buttons: [
            { type: 'hour', count: 12, text: '12h' },
            { type: 'day', count: 1, text: '24h' },
            { type: 'day', count: 7, text: '7d' },
            { type: 'month', count: 1, text: '1m' },
            { type: 'month', count: 3, text: '3m' },
            { type: 'year', count: 1, text: '1y' },
            { type: 'ytd', text: 'YTD' },
            { type: 'all', text: 'All'}
          ],
          selected: 2,
          inputEnabled: false
        },
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
        // xAxis: {
        //   events: {
        //     setExtremes: (e) => {
        //       this.setRangeChartData(e.min, e.max);
        //       // if(typeof(e.rangeSelectorButton)!== 'undefined') {
        //         // // alert('count: '+e.rangeSelectorButton.count + 'text: ' +e.rangeSelectorButton.text + ' type:' + e.rangeSelectorButton.type);
        //       // }
        //     }
        //   }
        // },
        tooltip: {
            split: true
        },
        series: [{
            type: 'candlestick',
            name: this.source_coin_code,
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
            width: 16,
            color: '#d4edda',
            fillColor: '#c3e6cb'
        }, {
            type: 'flags',
            data: order_list_charts,
            onSeries: 'dataseries',
            shape: 'circlepin',
            width: 20,
            color: '#dc3545'
        }]
      };
      
      // ----------- confugure depth ---------------
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
        return +p >= +bot.pretioction_depth_min_asks;
      });

      let x_bids = _.findIndex(result.chart_labels, (p: number) => {
        return +p >= +bot.pretioction_depth_min_bids;
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

      let depth_prediction_markers: any[] = [{
        x: x_buy,
        title: 'buy',
        text: `Prediction buy<br>Rate: ${bot.prediction_buy}`
      }, {
        x: x_sell,
        title: 'sell',
        text: `Prediction sell<br>Rate: ${bot.prediction_sell}`
      }];
      
      let depth_prediction_steps_markers: any[] = [];

      let step_buy: number = 0;
      _.each(bot.prediction_buy_orders, (order: any) => {
        step_buy++;
        let x_order = _.findIndex(result.chart_labels, (p: number) => {
          return +p >= +order.rate;
        });
        
        if(x_order == 0) {
          x_order = 0; //?
        }

        let item = {
          x: x_order,
          title: 'buy',
          text: `[${step_buy}] Prediction buy<br>Rate: ${order.rate}<br>Amount: ${order.amount}`,
          data: order
        };

        depth_prediction_steps_markers.push(item);
      });

      let step_sell: number = 0;
      _.each(bot.prediction_sell_orders, (order: any) => {
        step_sell++;
        let x_order = _.findIndex(result.chart_labels, (p: number) => {
          return +p >= +order.rate;
        });
        
        if(x_order == -1) {
          x_order = result.chart_labels.length - 1;
        }
        
        let item = {
          x: x_order,
          title: 'sell',
          text: `[${step_sell}] Prediction sell<br>Rate: ${order.rate}<br>Amount: ${order.amount}`,
          data: order
        };

        depth_prediction_steps_markers.push(item);
      });

      let depth_extremums = [{
        x: x_asks,
        title: '>',
        text: `Prediction min asks<br>Amount: ${bot.pretioction_depth_min_asks}`
      }, {
        x: x_bids,
        title: '<',
        text: `Prediction min bids<br>Amount: ${bot.pretioction_depth_min_bids}`
      }, {
        x: x_average,
        title: '|',
        text: `Prediction chart average<br>Amount: ${bot.prediction_average}`
      }, {
        x: x_deviation_up,
        title: '>|',
        text: `Prediction chart up<br>Amount: ${bot.prediction_deviation_up}`
      }, {
        x: x_deviation_down,
        title: '|<',
        text: `Prediction chart down<br>Amount: ${bot.prediction_deviation_down}`
      }];

      //-- current orders on depth chart
      let order_list_depth = _.map(this.open_orders, (p:any) => {
        let x_order = _.findIndex(result.chart_labels, (clbl: number) => {
          return +clbl >= +p.rate;
        });
        
        if(x_order == -1 && p.type == 'sell') {
          x_order = result.chart_labels.length - 1;
        }

        return {
          x: x_order,
          title: p.type + '!',
          text: `total: ${p.total}, (rate: ${p.rate}, amount: ${p.amount}`
        };
      });
      
      series_depth.push({
        name: 'Predictions',
        type: 'flags',
        data: depth_prediction_steps_markers,
        onSeries: 'dataseries',
        shape: 'circlepin',
        width: 16,
        color: '#ffeeba',
        fillColor: '#fff3cd'
      }, {
        name: 'Orders',
        type: 'flags',
        data: order_list_depth,
        onSeries: 'dataseries',
        shape: 'circlepin',
        width: 16,
        color: '#dc3545'
      }, {
        name: 'min',
        type: 'flags',
        data: depth_prediction_markers,
        onSeries: 'dataseries',
        shape: 'circlepin',
        width: 16,
        visible: false
      }, {
        name: 'Extremums',
        type: 'flags',
        data: depth_extremums,
        onSeries: 'dataseries',
        shape: 'circlepin',
        width: 14,
        color: '#b8daff'
    });

      let me = this;

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
          headerFormat: '{point.key} [' + this.source_coin_code + "]<br>",
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
                  if(!_.isEmpty(this.data)) {
                    me.orderPrice = this.data.rate;
                    me.orderAmount = this.data.amount;
                  } else {
                    me.orderPrice = this.category;
                  }
                }
              }
            }
          }
        },
        series: series_depth
      };
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
