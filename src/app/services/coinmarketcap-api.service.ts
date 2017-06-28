/**
 *  @Documentation
 *  https://coinmarketcap.com/api/
 */

import { Injectable } from '@angular/core';
import { Http }       from '@angular/http';

import 'rxjs/add/operator/toPromise';

@Injectable()
export class CoinmarketcapApiService {

  constructor(private http: Http) { }

  public getTicker(_limit:number = 50) : Promise<any> {
    const url = `https://api.coinmarketcap.com/v1/ticker/?limit=`+_limit;
    
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
