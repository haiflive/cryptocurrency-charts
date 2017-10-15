/**
 *  @Documentation
 *  https://bittrex.com/Home/Api
 */

import { Injectable } from '@angular/core';
import { Http }       from '@angular/http';
import * as _ from "lodash";

import 'rxjs/add/operator/toPromise';

const SOURCE_URL = '';

@Injectable()
export class BittrexApiService {

  constructor(private http: Http) { }

  getmarketsummaries(): Promise<any> {
    const url = SOURCE_URL + `/api/bittrex/getmarketsummaries`;
    
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
