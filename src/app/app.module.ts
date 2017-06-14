import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule }   from '@angular/router';
import { HttpModule }    from '@angular/http';
import { SelectModule } from 'ng2-select-compat'
import { FormsModule } from '@angular/forms';
import { TabsModule, ButtonsModule } from 'ng2-bootstrap';
import { Ng2HighchartsModule } from 'ng2-highcharts';

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
    HttpModule,
    SelectModule,
    FormsModule,
    Ng2HighchartsModule,
    TabsModule.forRoot(),
    ButtonsModule.forRoot(),
    RouterModule.forRoot([
      {
        path: '',
        component: RadarChartCurrencyComponent
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
