import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';

const BASE_URL = `/traderbot`;

@Injectable()
export class TraderBotService {
  constructor(private http: Http) { }
  
  getAllTraders() {
    return this.http.get(BASE_URL)
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
  }
  
  getTrader(botId: number) {
    return this.http.get(BASE_URL + `/` + botId)
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
  }
  
  addTrader(
    trader:{
      name: string,
      api_key: string,
      api_secret: string,
      stock_id: string,
      currency_pair: string
  }) {
    
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    
    return this.http.post(BASE_URL, trader, options)
          .toPromise()
          .then(response => response.json())
          .catch(this.handleError);
  }
  
  deleteTrader(botId:number) {
    return this.http.delete(BASE_URL + `/` + botId)
          .toPromise()
          .then(response => response.json())
          .catch(this.handleError);
  }
  
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
