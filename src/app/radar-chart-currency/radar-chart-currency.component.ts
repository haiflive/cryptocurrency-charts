import { Component, OnInit } from '@angular/core';
import { PoloniexApiService } from '../services/poloniex-api.service';
import { BittrexApiService } from '../services/bittrex-api.service';
import { Observable } from 'rxjs/Rx';
import * as _ from "lodash";
import {Ng2Highcharts, Ng2Highmaps, Ng2Highstocks} from 'ng2-highcharts';
import { LoaderWaitService } from '../services/loader-wait.service';

const COINS = [
  {
    id: 'ETH',
    name: 'Ethereum',
    img: 'ethereum'
  }, {
    id: 'XRP',
    name: 'Ripple',
    img: 'ripple'
  }, {
    id: 'XEM',
    name: 'NEM',
    img: 'nem'
  }, {
    id: 'XMR',
    name: 'Monero',
    img: 'monero'
  }, {
    id: 'BCN',
    name: 'Bytecoin',
    img: 'bytecoin-bcn'
  }, {
    id: 'DGB',
    name: 'DigiByte',
    img: 'digibyte'
  }, {
    id: 'ZEC',
    name: 'Zcash',
    img: 'zcash'
  }, {
    id: 'LSK',
    name: 'Lisk',
    img: 'lisk'
  }, {
    id: 'SC',
    name: 'Siacoin',
    img: 'siacoin'
  }, {
    id: 'LBC',
    name: 'LBRY Credits',
    img: 'library-credit'
  }, {
    id: 'USDT',
    name: 'Tether',
    img: 'tether'
  }, {
    id: 'MUSIC',
    name: 'Musicoin',
    img: 'musicoin'
  }
];

@Component({
  selector: 'app-radar-chart-currency',
  templateUrl: './radar-chart-currency.component.html',
  styleUrls: ['./radar-chart-currency.component.css']
})
export class RadarChartCurrencyComponent implements OnInit {
  
  constructor(
    private _poloniexService:PoloniexApiService,
    private _bittrexApiService:BittrexApiService,
    private loaderWait: LoaderWaitService
  ) {}

  ngOnInit() {
    
    COINS.forEach((coin:{id: string, name:string, img:string}) => {
      this.items_select.push({
        id: coin.id,
        text: `<img src='assets/images/currencies/${coin.img}.png' /> ${coin.name} [${coin.id}]`
      });
    });
    
    this.stock_exchange_list.forEach((stock:{id:string, name:string, url:string}) => {
      this.stock_exchange_select.push({
        id: stock.id,
        text: `${stock.name} [${stock.url}]`
      });
    });
    
    this.value_select = this.items_select[0];
    this.value_stock_select = this.stock_exchange_select[0];
    
    this.refreshChartData();
    this.setupRefresher();
    
    this.loaderWait.hide();
  }
  
  // ng2-highcharts
  chartStock = {};
  
  
  private stock_exchange_list:Array<any> = [{
      id: 'poloniex',
      name: `poloniex.com`,
      url: 'poloniex.com',
      provider: this._poloniexService
    }, {
      id: 'bittrex',
      name: `bittrex.com`,
      url: 'bittrex.com',
      provider: this._bittrexApiService
  }];
  
  // Select Currency Source
  public stock_exchange_select:Array<any> = [];
  public value_stock_select:any = {};
  
  public refreshStock(value:any):void {
    this.value_stock_select = value;
    this.refreshChartData();
  }
  
  // Select coin
  public items_select:Array<any> = [];
  public value_select:any = {};
 
  public selected(value:any):void {
    console.log('Selected value is: ', value);
  }
 
  public removed(value:any):void {
    console.log('Removed value is: ', value);
  }
 
  public typed(value:any):void {
    console.log('New search input: ', value);
  }
 
  public refreshValue(value:any):void {
    this.value_select = value;
    this.refreshChartData();
  }
  // --
  
  private _chartDepth:number = 50;
  private _chartThrottle:number = -1; // default disabled
  public _chartGrouping:boolean = true;
  private _chartGroupingDecimals:number = 9; // default 9 decimals
 
  public get chartDepthV():number {
    return this._chartDepth;
  }
 
  public set chartDepthV(value:number) {
    if(this._chartDepth == value)
      return;
    
    this._chartDepth = value;
    this.refreshChartData();
  }
  
  public get chartThrottleV():number {
    return this._chartThrottle;
  }
 
  public set chartThrottleV(value:number) {
    this._chartThrottle = value;
    this.setupRefresher();
  }
  
  public get chartGroupingV():string {
    return this._chartGrouping ? '1' : '0';
  }
 
  public set chartGroupingV(value:string) {
    this._chartGrouping = value === '1';
    this.refreshChartData();
  }
  
  public get chartGroupingDecimalsV():number {
    return this._chartGroupingDecimals;
  }
 
  public set chartGroupingDecimalsV(value:number) {
    this._chartGroupingDecimals = value;
    this.refreshChartData();
  }
  
  // --

  private refreshChartData():void {
    /**
     * observable from subject
     * audit or auditTime(1000)
     */
    let cyrrency_code:string = this.value_select.id;
    let cyrrency_initial_code:string = 'BTC';
    if(this.value_select.id == 'USDT') {
      cyrrency_code = 'BTC';
      cyrrency_initial_code = this.value_select.id;
    }
    
    var stock = _.find(this.stock_exchange_list, (p) => p.id == this.value_stock_select.id);
    
    stock.provider.getMarketCyrrency(cyrrency_code, this._chartDepth, cyrrency_initial_code).then((data) => {
        var result : any;
        
        if(this._chartGrouping) {
          result = this.prepareDepthDataGrouped(data, this._chartGroupingDecimals);
        } else {
          result = this.prepareDepthDataLinear(data);
        }
        
        /**
         *  @chartStock
         *  @API - http://api.highcharts.com/highcharts/
         */
        this.chartStock = {
          chart: {
            type: 'line'
          },
          title: {
            text: 'MARKET DEPTH'
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
    });
  }
  
  private prepareDepthDataLinear(data:any) : any {
      let chart_data_volume_btc: Array<number> = [];
      let chart_data_total_btc: Array<number> = [];
      let chart_data_volume: Array<number> = [];
      let chart_data_asks_depth: Array<number> = [];
      let chart_data_bids_depth: Array<number> = [];
      let chart_labels: Array<string> = [];
      
      
      for(let i = 0, total_coins:number = 0, btc_total:number = 0; i < data.bids.length; i++) {
          total_coins = +total_coins + +data.bids[i][1];
          let btc = +data.bids[i][1] * +data.bids[i][0];
          btc_total = +btc_total + +btc;
          
          chart_data_volume_btc.unshift( btc );
          chart_data_total_btc.unshift( btc_total );
          chart_data_volume.unshift(data.bids[i][1]);
          chart_data_asks_depth.unshift(0);
          chart_data_bids_depth.unshift(total_coins);
          chart_labels.unshift(data.bids[i][0]+' BTC');
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
          chart_labels.push(data.asks[i][0]+' BTC');
      }
        
      return {
          chart_labels: chart_labels,
          chart_data: [
                {data: chart_data_volume_btc, name: 'BTC', type: 'spline'},
                {data: chart_data_volume, name: 'Coins', type: 'column'},
                {data: chart_data_asks_depth, name: 'Asks Coins', type: 'area'},
                {data: chart_data_bids_depth, name: 'Bids Coins', type: 'area'},
                {data: chart_data_total_btc, name: 'BTC Depth', type: 'area'}
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
   *  refresh chart Throttle
   * need use auditTime
   * need use switch
   * need use throttle
   */
  private observableThrottle;
  private observableThrottleSubscribe;
  
  private setupRefresher() : void {
    if(!this._chartThrottle || this._chartThrottle < 0)
      return;
    
    if(!this.observableThrottle) { // first call
      this.observableThrottle = Observable.timer(500)
            .switchMap((ev) => Observable.interval(+this._chartThrottle * 1000));
            // .catch(this.handleError)
    } else {
      this.observableThrottle.switchMap((ev) => Observable.interval(+this._chartThrottle * 1000));
    }
    
    if(this.observableThrottleSubscribe) {
      this.observableThrottleSubscribe.unsubscribe();
    }
    
    this.observableThrottleSubscribe = this.observableThrottle.subscribe(() => {
          this.refreshChartData();
      })
    
    return;
  }
  
}
