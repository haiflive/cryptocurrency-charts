import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Ng2Highcharts, Ng2Highmaps, Ng2Highstocks } from 'ng2-highcharts';
import { Observable } from 'rxjs/Rx';
import * as _ from "lodash";
import { PoloniexApiService } from '../services/poloniex-api.service';

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
  }
];

/**
 *  @chartStock
 *  @API - http://api.highcharts.com/highcharts/
 */
const _ChartStock_prototype = {
  chart: {
    // renderTo: (options.chart && options.chart.renderTo) || this,
    backgroundColor: null,
    borderWidth: 0,
    type: 'area',
    margin: [2, 0, 2, 0],
    width: 120,
    height: 20,
    style: {
        overflow: 'visible'
    },

    // small optimalization, saves 1-2 ms each sparkline
    skipClone: true
  },
  title: {
    text: ''
  },
  credits: {
    enabled: false
  },
  xAxis: {
    labels: {
      enabled: false
    },
    title: {
      text: null
    },
    startOnTick: false,
    endOnTick: false,
    tickPositions: []
  },
  yAxis: {
    endOnTick: false,
    startOnTick: false,
    labels: {
      enabled: false
    },
    title: {
      text: null
    },
    tickPositions: [0]
  },
  legend: {
    enabled: false
  },
  tooltip: {
    backgroundColor: null,
    borderWidth: 0,
    shadow: false,
    useHTML: true,
    hideDelay: 0,
    shared: true,
    padding: 0,
    positioner: function (w, h, point) {
      return { x: point.plotX - w / 2, y: point.plotY - h };
    },
    headerFormat: ''
  },
  plotOptions: {
    series: {
      animation: false,
      lineWidth: 1,
      shadow: false,
      states: {
        hover: {
          lineWidth: 1
        }
      },
      marker: {
        radius: 1,
        states: {
          hover: {
            radius: 2
          }
        }
      },
      fillOpacity: 0.25
    },
    column: {
      negativeColor: '#910000',
      borderColor: 'silver'
    }
  },
  series: [] //result.chart_data
};

@Component({
  selector: 'app-currency-monitor',
  templateUrl: './currency-monitor.component.html',
  styleUrls: ['./currency-monitor.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CurrencyMonitorComponent implements OnInit {

  constructor(private _poloniexService:PoloniexApiService) { }

  ngOnInit() {
    COINS.forEach((coin:{id: string, name:string, img:string}) => {
      this.items_select.push({
        id: coin.id,
        text: `<img src='assets/images/currencies/${coin.img}.png' /> ${coin.name} [${coin.id}]`
      });
    });
    
    this.value_select = [this.items_select[0], this.items_select[6], this.items_select[8]];
    this.refreshChartData();
  }
  
  // ng2-highcharts
  chartList = [];
  chartStock = {};
  
  // Select
  public items_select:Array<any> = [];
  public value_select:Array<any> = [];
 
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
  
  private _chartDepth:number = 100;
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
  
  
  private refreshChartData():void {
    
    // setup currency list
    this.chartList = []; // clear
    
    for(let i = 0; i < this.value_select.length; i++) {
      let cyrrency_code = this.value_select[i].id;
      let cyrrency_initial_code:string = 'BTC';
      if(this.value_select[0].id == 'USDT') {
        cyrrency_code = 'BTC';
        cyrrency_initial_code = this.value_select[0].id;
      }
      
      let coin = _.find(COINS, function(p) {
        return cyrrency_code == p.id;
      });
      
      if(!coin) {
        console.error('can not find coin by ID: ' + cyrrency_code);
        continue;
      }
      
      this._poloniexService.getMarketCyrrency(cyrrency_code, this._chartDepth, cyrrency_initial_code).then((data) => {
          var result : any;
          
          if(this._chartGrouping) {
            result = this.prepareDepthDataGrouped(data, this._chartGroupingDecimals);
          } else {
            result = this.prepareDepthDataLinear(data);
          }
          
          // simple charts:
          var chart_stock = _.extend({}, _ChartStock_prototype);
          // chart_stock.series = [{data: [10, 20, 0, i*10, 20], name: 'TET', type: 'spline'}];
          chart_stock.series = result.chart_data;
      
          
          this.chartList.push({
            id: cyrrency_code,
            name: `<img src='assets/images/currencies/${coin.img}.png' /> ${coin.name} [${coin.id}]`,
            asks: chart_stock.series[4].data[0],
            bids: chart_stock.series[4].data[chart_stock.series[4].data.length-1],
            chartStock: chart_stock,
          });
          
      });
    };
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
}
