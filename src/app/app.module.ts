import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule }   from '@angular/router';
import { HttpModule }    from '@angular/http';
import { SelectModule } from 'ng2-select-compat'
import { FormsModule } from '@angular/forms';
import { APP_BASE_HREF } from '@angular/common';
import { TabsModule, ButtonsModule, ModalModule, BsDropdownModule, TooltipModule } from 'ngx-bootstrap';
import { Ng2HighchartsModule } from 'ng2-highcharts';

// services:
import { PoloniexApiService } from './services/poloniex-api.service';
import { BittrexApiService } from './services/bittrex-api.service';
import { CoinmarketcapApiService } from './services/coinmarketcap-api.service';
import { TraderBotService } from './services/trader-bot.service';
import { LoaderWaitService } from './services/loader-wait.service';
// components:
import { AppComponent } from './app.component';
import { RadarChartCurrencyComponent } from './radar-chart-currency/radar-chart-currency.component';
import { CurrencyListComponent } from './currency-list/currency-list.component';
import { CurrencyMonitorComponent } from './currency-monitor/currency-monitor.component';
import { CyclicExchangeComponent } from './cyclic-exchange/cyclic-exchange.component';
import { TraderBotManagerComponent } from './trader-bot-manager/trader-bot-manager.component';
import { CreateTraderModalComponent } from './trader-bot-manager/create-trader.modal.component';
import { PredictionConfigComponent } from './trader-bot-manager/prediction.config.component';
import { PredictionTriggerComponent } from './trader-bot-manager/prediction.trigger.component';
// common:
import { OrdersFilterPipe } from './trader-bot-manager/common/orders.filter.pipe';
import { OrdersSortPipe } from './trader-bot-manager/common/orders.sort.pipe';

@NgModule({
  declarations: [
    AppComponent,
    RadarChartCurrencyComponent,
    CurrencyListComponent,
    CurrencyMonitorComponent,
    CyclicExchangeComponent,
    TraderBotManagerComponent,
    CreateTraderModalComponent,
    PredictionConfigComponent,
    PredictionTriggerComponent,
    OrdersFilterPipe,
    OrdersSortPipe,
  ],
  entryComponents: [CreateTraderModalComponent, PredictionConfigComponent, PredictionTriggerComponent],
  imports: [
    BrowserModule,
    HttpModule,
    SelectModule,
    FormsModule,
    Ng2HighchartsModule,
    TabsModule.forRoot(),
    ButtonsModule.forRoot(),
    ModalModule.forRoot(),
    BsDropdownModule.forRoot(),
    TooltipModule.forRoot(),
    RouterModule.forRoot([
      {
        path: '', // currency-list
        component: TraderBotManagerComponent
      }, {
        path: 'overview',
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
  providers: [ {provide: APP_BASE_HREF, useValue : '/cchartpanel' },
               PoloniexApiService, BittrexApiService, CoinmarketcapApiService,
               TraderBotService, LoaderWaitService ],
  bootstrap: [AppComponent]
})
export class AppModule { }
