import { Component, OnInit } from '@angular/core';
import { PoloniexApiService } from '../services/poloniex-api.service';
import { CoinmarketcapApiService } from '../services/coinmarketcap-api.service';
import * as _ from "lodash";
import { Ng2Highcharts, Ng2Highmaps, Ng2Highstocks } from 'ng2-highcharts';
import { Observable } from 'rxjs/Observable';
import { LoaderWaitService } from '../services/loader-wait.service';

@Component({
  selector: 'app-currency-list',
  templateUrl: './currency-list.component.html',
  styleUrls: ['./currency-list.component.css']
})
export class CurrencyListComponent implements OnInit {

  constructor(
    private _poloniexService:PoloniexApiService,
    private _coinmarketcapService:CoinmarketcapApiService,
    private loaderWait: LoaderWaitService
  ) { }

  ngOnInit() {
    this.refreshChartData();
    this.loaderWait.hide();
  }
  
  // --
  private topCoinLimit:number = 20;
  
  public get topCoinLimitV():number {
    return this.topCoinLimit;
  }
 
  public set topCoinLimitV(value:number) {
    this.topCoinLimit = value;
    this.refreshChartData();
  }
  // --
  
  // ng2-highcharts
  chartStock = {};
  chartCap = {};
  
  // --

  private refreshChartData():void {
    
    Observable.forkJoin([
      this._poloniexService.getReturnTicker(),
      this._coinmarketcapService.getTicker(500)
    ]).subscribe(t=> {
      var poloniexTickerData = t[0];
      var coinmarketcapTickerData = t[1];
      
      // default sort by 24h volume
      coinmarketcapTickerData = _.sortBy(coinmarketcapTickerData, [(p) => 0 - +p['24h_volume_usd']]);
      // limit top
      var topCoinmarketcapTickerData = coinmarketcapTickerData.splice(0, this.topCoinLimit);
      
      // --
      
      var categories : Array<string> = _.keys(poloniexTickerData);
      var last : Array<any> = []; // = _.map(poloniexTickerData, (p:any) => +p.last);
      var chartBaseVolume : Array<any> = [];
      var chartQuoteVolume : Array<number> = [];
      var chartQuoteVolumePersentage : Array<number> = [];
      
      _.each(poloniexTickerData, (p:any, key:any) => {
        let code = _.last(key.match(/[a-zA-Z]+/g));
        let currencyObj = _.find(coinmarketcapTickerData, (p:any) => p.symbol == code);
        let isTopCurrency = false;
        if(_.find(topCoinmarketcapTickerData, (p:any) => p.symbol == code)) {
          isTopCurrency = true;
        }
        
        if(currencyObj) {
          let total_supply = currencyObj.total_supply;
          chartQuoteVolumePersentage.push( (+p.quoteVolume / +total_supply) * 100 );
        } else {
          chartQuoteVolumePersentage.push(-1); // not found
        }
        
        // --
        
        if(isTopCurrency) {
          chartBaseVolume.push({
            y: +p.baseVolume,
            color: "#FFFF00", // pink
            name: code
          });
          
        } else {
          chartBaseVolume.push( +p.baseVolume );
        }
        
        chartQuoteVolume.push( +p.quoteVolume );
        
      });
      
      /**
       *  @chartStock options
       *  @API - http://api.highcharts.com/highcharts/
       */
      this.chartStock = {
        chart: {
          type: 'column'
        },
        title: {
          text: '24h Volume'
        },
        // subtitle: {
          // text: 'Source: WorldClimate com'
        // },
        xAxis: {
          categories: categories,
          crosshair: true
        },
        yAxis: {
          min: 10,
          title: {
            text: 'Volume'
          },
          type: 'logarithmic',
          tickAmount: 10,
          minTickInterval: 1,
          minorTickInterval: null,
        },
        tooltip: {
          // headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
          // pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
              // '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
          // footerFormat: '</table>',
          shared: true,
          useHTML: true
        },
        // plotOptions: {
            // column: {
                // pointPadding: 0.2,
                // borderWidth: 0
            // }
        // },
        series: [{
          name: 'Quote Volume %',
          data: chartQuoteVolumePersentage,
          color: '#FF0000'
        }, {
          name: 'Quote Volume',
          data: chartQuoteVolume,
          color: '#85baec'
        }, {
          name: 'Volume',
          data: chartBaseVolume,
          color: '#97e787'
        }]
      };
      
      // --
      var categories : Array<string> = [];
      var market_cap_usd : Array<number> = [];
      var _24h_volume_usd : Array<number> = [];
      var price_usd : Array<number> = [];
      var price_btc : Array<number> = [];
      
      _.each(topCoinmarketcapTickerData, (p:any) => {
        categories.push(p.name + ' [' + p.symbol + ']');
        market_cap_usd.push(+p.market_cap_usd);
        _24h_volume_usd.push(+p['24h_volume_usd']);
        price_usd.push(+p.price_usd);
        price_btc.push(+p.price_btc);
      });
      
      /**
       *  @chartCap options
       *  @API - http://api.highcharts.com/highcharts/
       */
      this.chartCap = {
        chart: {
          type: 'column'
        },
        title: {
          text: 'Currencies'
        },
        xAxis: {
          categories: categories,
          crosshair: true
        },
        yAxis: {
          min: 0.1,
          title: {
            text: 'Volume'
          },
          type: 'logarithmic',
          tickAmount: 10,
          minTickInterval: 1,
          minorTickInterval: null,
        },
        tooltip: {
          shared: true,
          useHTML: true
        },
        series: [{
          name: 'Market Cap USD',
          data: market_cap_usd
        }, {
          name: '24h volume USD',
          data: _24h_volume_usd
        }, {
          name: 'Price USD',
          data: price_usd
        }, {
          name: 'Price BTC',
          data: price_btc
        }]
      };
    });
  }

}
