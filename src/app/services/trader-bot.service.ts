import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers, URLSearchParams } from '@angular/http';
import { TraderBot } from '../services/types/trader.types';

const BASE_URL = `/traderbot`;
import * as _ from "lodash";

@Injectable()
export class TraderBotService {
  constructor(private http: Http) { }
  
  getAllTraders() {
    return this.http.get(BASE_URL)
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
  }
  
  getTrader(uid: string, queryParams?: {date_start: number, date_end: number, date_period: number}) {
    
    _.defaults(queryParams, {
      date_start: Math.round((Date.now() / 1000) - (8 * 24 * 60 * 60)),  // default 8 days
      date_end: Math.round(Date.now() / 1000),  // now
      date_period: 1800
    });
    
    let params: URLSearchParams = new URLSearchParams();
    params.set('date_start', queryParams.date_start.toString());
    params.set('date_end', queryParams.date_end.toString());
    params.set('date_period', queryParams.date_period.toString());
    
    let requestOptions = new RequestOptions();
    requestOptions.search = params;
    
    return this.http.get(BASE_URL + '/' + uid, requestOptions)
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
  }
  
  addTrader(trader:TraderBot) {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    
    return this.http.post(BASE_URL, trader, options)
          .toPromise()
          .then(response => response.json())
          .catch(this.handleError);
  }

  updateTrader(trader:TraderBot) {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    
    return this.http.put(BASE_URL, trader, options)
          .toPromise()
          .then(response => response.json())
          .catch(this.handleError);
  }
  
  deleteTrader(uid:string) {
    return this.http.delete(BASE_URL + `/` + uid)
          .toPromise()
          .then(response => response.json())
          .catch(this.handleError);
  }
  
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
