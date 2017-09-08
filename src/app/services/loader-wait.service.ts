import { Injectable } from '@angular/core';

@Injectable()
export class LoaderWaitService {
  
  loaderWaitElement: any;
  countShows:number;
  
  constructor() {
    this.countShows = 1;
    this.loaderWaitElement = document.getElementById('loaderWait');
  }
  
  show() {
    this.countShows++;
    this.loaderWaitElement.style.display = "initial";
  }
  
  hide() {
    this.countShows--;
    if( this.countShows <= 0) {
      this.countShows = 0;
      this.loaderWaitElement.style.display = "none";
    }
  }

}
