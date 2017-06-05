import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule }   from '@angular/router';
import { ChartsModule } from 'ng2-charts';
import { HttpModule }    from '@angular/http';

import { AppComponent } from './app.component';
import { RadarChartCurrencyComponent } from './radar-chart-currency/radar-chart-currency.component';

import { PoloniexApiService } from './poloniex-api.service';

@NgModule({
  declarations: [
    AppComponent,
    RadarChartCurrencyComponent
  ],
  imports: [
    BrowserModule,
    ChartsModule,
    HttpModule,
    RouterModule.forRoot([
      {
        path: '',
        component: AppComponent
      }, {
        path: 'radar-chart-currency',
        component: RadarChartCurrencyComponent
      }
    ])
  ],
  providers: [ PoloniexApiService ],
  bootstrap: [AppComponent]
})
export class AppModule { }
