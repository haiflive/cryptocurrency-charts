import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule }   from '@angular/router';
import { HttpModule }    from '@angular/http';
import { SelectModule } from 'ng2-select-compat'
import { FormsModule } from '@angular/forms';
import { TabsModule, ButtonsModule } from 'ngx-bootstrap';
import { Ng2HighchartsModule } from 'ng2-highcharts';

// services:
import { PoloniexApiService } from './services/poloniex-api.service';
import { BittrexApiService } from './services/bittrex-api.service';
import { CoinmarketcapApiService } from './services/coinmarketcap-api.service';
// components:
import { AppComponent } from './app.component';
import { RadarChartCurrencyComponent } from './radar-chart-currency/radar-chart-currency.component';
import { CurrencyListComponent } from './currency-list/currency-list.component';
import { CurrencyMonitorComponent } from './currency-monitor/currency-monitor.component';
import { CyclicExchangeComponent } from './cyclic-exchange/cyclic-exchange.component';

@NgModule({
  declarations: [
    AppComponent,
    RadarChartCurrencyComponent,
    CurrencyListComponent,
    CurrencyMonitorComponent,
    CyclicExchangeComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    SelectModule,
    FormsModule,
    Ng2HighchartsModule,
    TabsModule.forRoot(),
    ButtonsModule.forRoot(),
    RouterModule.forRoot([
      {
        path: '', // currency-list
        component: CurrencyListComponent
      }, {
        path: 'radar-chart-currency',
        component: RadarChartCurrencyComponent
      }, {
        path: 'currency-monitor',
        component: CurrencyMonitorComponent
      }, {
        path: 'cyclic-exchange',
        component: CyclicExchangeComponent
      }
    ])
  ],
  providers: [ PoloniexApiService, BittrexApiService, CoinmarketcapApiService ],
  bootstrap: [AppComponent]
})
export class AppModule { }
