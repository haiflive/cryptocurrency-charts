import { Injectable } from '@angular/core';
import { Http }       from '@angular/http';

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
  
  private radarChartData:any = [
    {data: [65, 59, 90, 81, 56, 55, 40], label: 'BUY2'},
    {data: [28, 48, 40, 19, 96, 27, 100], label: 'SELL2'}
  ];
  
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
  
  public getMarketDepth() : Promise<any> {
    // return Promise.resolve(this.radarChartData);
    const url = `https://poloniex.com/public?command=returnOrderBook&currencyPair=BTC_XMR`;
    
    return this.http.get(url)
            .toPromise()
            .then(response => {
                debugger;
                let tmp = response.json()
                debugger;
                
                this.radarChartData
            })
            .catch(this.handleError);
  }

}
