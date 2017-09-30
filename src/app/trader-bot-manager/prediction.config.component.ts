import { Component, Input, OnChanges, SimpleChange } from '@angular/core';
import { PredictionConfig } from '../services/types/trader.types';
import { TraderBotHelper } from './trader.bot.helper';

import * as _ from "lodash";

const SELECT_TIME_VARIANTS = [{
    text: '30 minutes',
    value: (30*60*1000),
  }, {
    text: '1 hour',
    value: (60*60*1000),
  }, {
    text: '3 hours',
    value: (3*60*60*1000),
  }, {
    text: '6 hours',
    value: (6*60*60*1000),
  }, {
    text: '12 hours',
    value: (12*60*60*1000),
  }, {
    text: '1 day',
    value: (24*60*60*1000),
  }, {
    text: '3 days',
    value: (3*24*60*60*1000),
  }, {
    text: '7 days',
    value: (7*24*60*60*1000),
  }, {
    text: '30 days',
    value: (30*24*60*60*1000),
  }, {
    text: '90 days',
    value: (90*24*60*60*1000),
  },
];

@Component({
  selector: 'prediction-content',
  templateUrl: './prediction.config.component.html'
})
export class PredictionConfigComponent {
  @Input('bot-config') config: PredictionConfig | PredictionConfig; // see more: trader.types.ts:2-3

  select_time_variants = SELECT_TIME_VARIANTS;

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