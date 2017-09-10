import { Component, Input, OnChanges, SimpleChange } from '@angular/core';
import { PredictionConfig } from '../services/types/trader.types';
import { TraderBotHelper } from './trader.bot.helper';

import * as _ from "lodash";

@Component({
  selector: 'prediction-content',
  templateUrl: './prediction.config.component.html'
})
export class PredictionConfigComponent {
  @Input('bot-config') config: PredictionConfig | PredictionConfig; // see more: trader.types.ts:2-3

  addTrigger() {
    if(!this.config.triggers)
      this.config.triggers = [];
    
    this.config.triggers.push(TraderBotHelper.buildTrigger());
  }
  
  removeTrigger(trigger):void {
    this.config.triggers = _.filter(this.config.triggers, (p) => {
      return trigger !== p;
    });
  }
}