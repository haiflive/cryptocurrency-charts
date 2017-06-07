import { Component, OnInit } from '@angular/core';
import { PoloniexApiService } from '../poloniex-api.service';

@Component({
  selector: 'app-radar-chart-currency',
  templateUrl: './radar-chart-currency.component.html',
  styleUrls: ['./radar-chart-currency.component.css']
})
export class RadarChartCurrencyComponent implements OnInit {

  constructor(private _poloniexService:PoloniexApiService) {
    this.value = this.items[0];
    this.refreshChartData();
  }

  ngOnInit() {
  }
  
  // lineChart
  public lineChartData:Array<any> = [
    {data: [], label: 'Asks'},
    {data: [], label: 'Bids'},
    {data: [], label: 'Asks Depth'},
    {data: [], label: 'Bids Depth'},
  ];
  public lineChartLabels:Array<any> = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  
  public lineChartOptions:any = {
    responsive: true
  };
  public lineChartColors:Array<any> = [
    { // Asks
      backgroundColor: 'rgba(0,255,0,0.2)',
      borderColor: 'rgba(0,255,0,1)',
      pointBackgroundColor: 'rgba(0,255,0,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(0,255,0,0.8)'
    },
    { // Bids
      backgroundColor: 'rgba(255,0,0,0.2)',
      borderColor: 'rgba(255,0,0,1)',
      pointBackgroundColor: 'rgba(255,0,0,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(255,0,0,0.8)'
    },
    { // Asks Depth
      backgroundColor: 'rgba(100,255,0,0.2)',
      borderColor: 'rgba(100,255,0,1)',
      pointBackgroundColor: 'rgba(100,255,0,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(100,255,0,0.8)'
    },
    { // Bids Depth
      backgroundColor: 'rgba(255,100,0,0.2)',
      borderColor: 'rgba(255,100,0,1)',
      pointBackgroundColor: 'rgba(255,100,0,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(255,100,0,1)'
    }
  ];
  public lineChartLegend:boolean = true;
  public lineChartType:string = 'line';
  // --
  
  // Radar
  public radarChartLabels:string[] = ['ETH', 'BTC', 'XRP', 'LTC', 'DGB', 'BCN', 'ZEC'];
 
  public radarChartData:any = [
    {data: [0, 0, 0, 0, 0, 0, 0], label: 'BUY'},
    {data: [0, 0, 0, 0, 0, 0, 0], label: 'SELL'}
  ];
  
  // Select
  public items:Array<any> = [
    {
      id: 'BTC_ETH',
      text: 'Ethereum',
    }, {
      id: 'BTC_XEM',
      text: 'NEM',
    }, {
      id: 'BTC_XMR',
      text: 'Monero',
    }, {
      id: 'BTC_BCN',
      text: 'Bytecoin',
    }, {
      id: 'BTC_DGB',
      text: 'DigiByte',
    }, {
      id: 'BTC_ZEC',
      text: 'Zcash',
    }, {
      id: 'BTC_LSK',
      text: 'Lisk',
    }
  ];
  
  private value:any = {};
 
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
    this.value = value;
    this.refreshChartData();
  }
  // --
  
  public radarChartType:string = 'radar';
 
  // events
  public chartClicked(e:any):void {
    console.log(e);
  }
 
  public chartHovered(e:any):void {
    console.log(e);
  }

  private refreshChartData():void {
    this._poloniexService.getMarketDepth().then((charts) => this.radarChartData = charts);
    
    this._poloniexService.getMarketCyrrency(this.value.id).then((data) => {
        let chart_data_asks: Array<number> = [];
        let chart_data_bids: Array<number> = [];
        let chart_data_asks_depth: Array<number> = [];
        let chart_data_bids_depth: Array<number> = [];
        let chart_labels: Array<string> = [];
        
        
        for(let i = 0, total:number = 0; i < data.bids.length; i++) {
            total += data.bids[i][1];
            chart_data_asks.unshift(0);
            chart_data_asks_depth.unshift(0);
            chart_data_bids.unshift(data.bids[i][1]);
            chart_data_bids_depth.unshift(total);
            chart_labels.unshift(data.bids[i][0]+' BTC');
        }
        
        for(let i = 0, total:number = 0; i < data.asks.length; i++) {
            total += data.asks[i][1];
            chart_data_asks.push(data.asks[i][1]);
            chart_data_asks_depth.push(total);
            chart_data_bids.push(0);
            chart_data_bids_depth.push(0);
            chart_labels.push(data.asks[i][0]+' BTC');
        }
        
        this.lineChartLabels = chart_labels;
        
        setTimeout(() => {
          this.lineChartData = [
                {data: chart_data_asks, label: 'Asks'},
                {data: chart_data_bids, label: 'Bids'},
                {data: chart_data_asks_depth, label: 'Asks Depth'},
                {data: chart_data_bids_depth, label: 'Bids Depth'}
            ];
        }, 50);
        
    });
  }
}
