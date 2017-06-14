import { Component, OnInit } from '@angular/core';
import { PoloniexApiService } from '../poloniex-api.service';
import { Observable } from 'rxjs/Rx';
import * as _ from "lodash";
import { Http } from '@angular/http';
import {Ng2Highcharts, Ng2Highmaps, Ng2Highstocks} from 'ng2-highcharts';

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
    id: 'BTS',
    name: 'BitShares',
    img: 'bitshares'
  }
];

@Component({
  selector: 'app-radar-chart-currency',
  templateUrl: './radar-chart-currency.component.html',
  styleUrls: ['./radar-chart-currency.component.css']
})
export class RadarChartCurrencyComponent implements OnInit {
  
  constructor(private _poloniexService:PoloniexApiService, private http: Http) {
  }

  ngOnInit() {
    console.log('lodash version:', _.VERSION);
    
    COINS.forEach((coin:{id: string, name:string, img:string}) => {
      this.items_select.push({
        id: coin.id,
        text: `<img src='assets/images/currencies/${coin.img}.png' /> ${coin.name}`
      });
    });
    
    this.value_select = this.items_select[0];
    
    this.refreshChartData();
    this.setupRefresher();
  }
  
  // ng2-highcharts
  chartStock = {};
  
  // Select
  public items_select:Array<any> = [];
  private value_select:any = {};
 
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
 
  private get chartDepthV():number {
    return this._chartDepth;
  }
 
  private set chartDepthV(value:number) {
    this._chartDepth = value;
    this.refreshChartData();
  }
  
  private get chartThrottleV():number {
    return this._chartThrottle;
  }
 
  private set chartThrottleV(value:number) {
    this._chartThrottle = value;
    this.setupRefresher();
  }
  
  private get chartGroupingV():string {
    return this._chartGrouping ? '1' : '0';
  }
 
  private set chartGroupingV(value:string) {
    this._chartGrouping = value === '1';
    this.refreshChartData();
  }
  
  private get chartGroupingDecimalsV():number {
    return this._chartGroupingDecimals;
  }
 
  private set chartGroupingDecimalsV(value:number) {
    this._chartGroupingDecimals = value;
    this.refreshChartData();
  }
  
  // --

  private refreshChartData():void {
    
    this._poloniexService.getMarketCyrrency(this.value_select.id, this._chartDepth).then((data) => {
        var result : any;
        
        if(this._chartGrouping) {
          result = this.prepareDepthDataGrouped(data, this._chartGroupingDecimals);
        } else {
          result = this.prepareDepthDataLinear(data);
        }
        
        // chart 2
        this.chartStock = {
          chart: {
            type: 'line'
          },
          title: {
            text: 'AAPL Stock Price'
          },
          xAxis: {
            categories: result.chart_labels,
            allowDecimals: true
          },
          yAxis: {
            title: {
              text: 'Fruit eaten'
            }
          },
          series: result.chart_data
        };
    });
  }
  
  private prepareDepthDataLinear(data:any) : any {
      let chart_data_asks: Array<number> = [];
      let chart_data_bids: Array<number> = [];
      let chart_data_asks_depth: Array<number> = [];
      let chart_data_bids_depth: Array<number> = [];
      let chart_labels: Array<string> = [];
      
      
      for(let i = 0, total:number = 0; i < data.bids.length; i++) {
          total = +total + +data.bids[i][1];
          chart_data_asks.unshift(0);
          chart_data_asks_depth.unshift(0);
          chart_data_bids.unshift(data.bids[i][1]);
          chart_data_bids_depth.unshift(total);
          chart_labels.unshift(data.bids[i][0]+' BTC');
      }
      
      for(let i = 0, total:number = 0; i < data.asks.length; i++) {
          total = +total + +data.asks[i][1];
          chart_data_asks.push(data.asks[i][1]);
          chart_data_asks_depth.push(total);
          chart_data_bids.push(0);
          chart_data_bids_depth.push(0);
          chart_labels.push(data.asks[i][0]+' BTC');
      }
        
      return {
          chart_labels: chart_labels,
          chart_data: [
                {data: chart_data_asks, label: 'Asks'},
                {data: chart_data_bids, label: 'Bids'},
                {data: chart_data_asks_depth, label: 'Asks Depth'},
                {data: chart_data_bids_depth, label: 'Bids Depth'}
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
