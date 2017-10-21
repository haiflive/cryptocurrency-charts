import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers, URLSearchParams } from '@angular/http';
import { TraderBot } from '../services/types/trader.types';
import { Observable, Subject } from 'rxjs';

import * as io from "socket.io-client";

const BASE_URL = `/traderbot`;
import * as _ from "lodash";

@Injectable()
export class TraderBotService {
  constructor(private http: Http) { }
  
  getAllTraders(): Promise<any> {
    return this.http.get(BASE_URL)
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
  }
  
  getTrader(uid: string): Promise<any> {
    return this.http.get(BASE_URL + '/' + uid)
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);
  }
  
  addTrader(trader:TraderBot): Promise<any> {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    
    return this.http.post(BASE_URL, trader, options)
          .toPromise()
          .then(response => response.json())
          .catch(this.handleError);
  }

  updateTrader(trader:TraderBot): Promise<any> {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    
    
    return  this.http.put(BASE_URL, trader, options)
            .toPromise()
            .then(response => {response.json()})
            .catch(this.handleError);
  }
  
  deleteTrader(uid:string): Promise<any> {
    return this.http.delete(BASE_URL + `/` + uid)
          .toPromise()
          .then(response => response.json())
          .catch(this.handleError);
  }

  addOrder(uid: string, order: {type: string, amount: number, price: number}) : Promise<any> {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    
    return this.http.post(BASE_URL + `/${uid}/add_order`, order, options)
          .toPromise()
          .then(response => response.json())
          .catch(this.handleError);
  }

  cancelOrder(uid: string, order_number: number) : Promise<any> {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    
    return this.http.post(BASE_URL + `/${uid}/cancel_order/${order_number}`, {}, options)
          .toPromise()
          .then(response => response.json())
          .catch(this.handleError);
  }

  // -- socket
  protected _socket;
  protected _is_socket_connected = false;
  // protected _refresh_data_subject: Subject<any>;

  watchTrader(trader_uid: string) : Observable<any> {
    let url = location.protocol+'//'+location.hostname+':8181';
    
    if(!this._socket)
      this._socket = io(url);
    
    let observable = Observable.create(observer => {
      let me = this;
      this._socket.on('connect', () => {
        console.log('socket connect');
        me._socket.emit('watch-trader', { trader_uid: trader_uid });
      });

      this._socket.on('trader-changed', (data) => {
        if(!data.success)
          console.log('somthing wrong');
        
        observer.next(data.data);
      });

      this._socket.on('disconnect', function() {
        console.log('socket disconnect');
        observer.complete();
        delete me._socket;
      });

      this._socket.on('error', function (err) {
        debugger;
        if (err.description) throw err.description;
        else throw err; // Or whatever you want to do
      });

      return () => { // just called unsubscribe
        console.log('unsubscribed');
        this._socket.disconnect();
      };  
    });

    return observable;

    // if(!this._is_socket_connected)
    //   this.setupWebSocketConnection();
    // console.log('connected status 1: ' + this._socket.connected);

    // let me = this;
    // this._socket.on('connect', function() {
    //   console.log('connected status 2: ' + me._socket.connected);
    // });

    // // subscribe:
    // me._socket.emit('watch-trader', { trader_uid: trader_uid });

    // this._socket.on('disconnect', function(){});

    // // watching:
    // this._socket.on('trader-changed', (data) => {
    //   if(!data.success)
    //     console.log('somthing wrong');
      
    //   console.log('recived data: ' + data.data);
    //   this._refresh_data_subject.next(data.data);
    // });
    
    // return this._refresh_data_subject;
  }

  // setupWebSocketConnection() {
  //   this._refresh_data_subject = new Subject();
  //   this._is_socket_connected = true;
    
  //   let url = location.protocol+'//'+location.hostname+':8181';

  //   this._socket = io(url);
  // }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
