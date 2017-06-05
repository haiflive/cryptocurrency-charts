import { Component, OnInit } from '@angular/core';
import { PoloniexApiService } from '../poloniex-api.service';

@Component({
  selector: 'app-radar-chart-currency',
  templateUrl: './radar-chart-currency.component.html',
  styleUrls: ['./radar-chart-currency.component.css']
})
export class RadarChartCurrencyComponent implements OnInit {

  constructor(private _poloniexService:PoloniexApiService) {
    this._poloniexService.getMarketDepth().then((charts) => this.radarChartData = charts);
  }

  ngOnInit() {
  }
  
  // Radar
  public radarChartLabels:string[] = ['ETH', 'BTC', 'XRP', 'LTC', 'DGB', 'BCN', 'ZEC'];
 
 
   public radarChartData:any = [
    {data: [0, 0, 0, 0, 0, 0, 0], label: 'BUY'},
    {data: [0, 0, 0, 0, 0, 0, 0], label: 'SELL'}
  ];
  
  public radarChartType:string = 'radar';
 
  // events
  public chartClicked(e:any):void {
    console.log(e);
  }
 
  public chartHovered(e:any):void {
    console.log(e);
  }

}
