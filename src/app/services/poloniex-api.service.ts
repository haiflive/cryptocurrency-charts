/**
 *  @Documentation
 *  https://poloniex.com/support/api/
 */

import { Injectable } from '@angular/core';
import { Http }       from '@angular/http';

// import { CyrrencyListObj } from './class/CyrrencyListObj';
// import { CyrrencyObj } from './class/CyrrencyObj';

// import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

/**
 *  
 *  @getMarketDepth - Market Depth.
 *  https://poloniex.com/public?command=returnOrderBook&currencyPair=BTC_XMR
 */

const BASE_URL = `https://poloniex.com/public`;

@Injectable()
export class PoloniexApiService {

  constructor(private http: Http) { }
  
  private testResponseData:string = `{"asks":[["0.09383489",0.8011014],["0.09387000",1.0000149],["0.09388002",10.65189376],["0.09388003",13.60968098],["0.09388004",6.94837911],["0.09390000",3],["0.09394259",0.17465731],["0.09395366",0.11398516],["0.09399902",119.085],["0.09399924",1.00046646]],"bids":[["0.09380000",7.59922072],["0.09379865",4.61038398],["0.09379546",2.15857887],["0.09377000",27.98767601],["0.09373510",5.88192837],["0.09371668",0.28030449],["0.09365000",8.54700865],["0.09360515",113.64387484],["0.09360514",85.079],["0.09360513",14.57627893]],"isFrozen":"0","seq":356717781}`;
  private debugMode:boolean = false;
  // --
  
  public getMarketCyrrency(cyrrency_code:string, chart_depth:number, cyrrency_initial_code:string = 'BTC') : Promise<any> {
    if(this.debugMode) {
        return Promise.resolve(JSON.parse(this.testResponseData));
    }
    
    const url = BASE_URL + `?command=returnOrderBook&currencyPair=`+cyrrency_initial_code+`_`+cyrrency_code+`&depth=`+chart_depth;
    
    return this.http.get(url)
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
  }
  
  public getCyrrencyList() : Promise<any> {
    const url = BASE_URL + `?command=returnCurrencies`;
    
    return this.http.get(url)
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
  }
  
  public getReturnTicker() : Promise<any> {
    const url = BASE_URL + `?command=returnTicker`;
    
    return this.http.get(url)
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
  }
  
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

}
