import { Injectable } from '@angular/core';
import { Http }       from '@angular/http';

import { CyrrencyListObj } from './class/CyrrencyListObj';
import { CyrrencyObj } from './class/CyrrencyObj';

// import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

/**
 *  
 *  @getMarketDepth - Market Depth.
 *  https://poloniex.com/public?command=returnOrderBook&currencyPair=BTC_XMR
 */

@Injectable()
export class PoloniexApiService {

  constructor(private http: Http) { }
  
  // private cyrrencyData: CyrrencyListObj[];
  
  private radarChartData:any = [
    {data: [65, 59, 90, 81, 56, 55, 40], label: 'Bids'},
    {data: [28, 48, 40, 19, 96, 27, 100], label: 'Asks'}
  ];
  
  private lineChartData:Array<any> = [
    [65, 59, 80],
    [28, 48, 40]
  ];
  
  public getMarketCyrrency(cyrrency_code:string) : Promise<any> {
    // return Promise.resolve(this.radarChartData);
    const url = `https://poloniex.com/public?command=returnOrderBook&currencyPair=`+cyrrency_code;
    
    return this.http.get(url)
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
  }
  
  public getMarketDepth() : Promise<any> {
    // return Promise.resolve(this.radarChartData);
    const url = `https://poloniex.com/public?command=returnOrderBook&currencyPair=BTC_ETH`;
    
    return this.http.get(url)
            .toPromise()
            .then(response => {
                
                // let tmp = response.json()
                // debugger;
                
                this.radarChartData
            })
            .catch(this.handleError);
  }
  
  public getCyrrencyList() : Array<any> {
      return ['BTC_ETH'];
  }
  
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

}
