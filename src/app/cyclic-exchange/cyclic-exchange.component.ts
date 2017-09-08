import { Component, OnInit } from '@angular/core';
import { LoaderWaitService } from '../services/loader-wait.service';

@Component({
  selector: 'app-cyclic-exchange',
  templateUrl: './cyclic-exchange.component.html',
  styleUrls: ['./cyclic-exchange.component.css']
})
export class CyclicExchangeComponent implements OnInit {

  constructor(
    private loaderWait: LoaderWaitService
  ) {}

  ngOnInit() {
    this.loaderWait.hide();
  }

}
