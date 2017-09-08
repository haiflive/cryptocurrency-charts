import { Component, Input, OnChanges, SimpleChange } from '@angular/core';
import { PredictionConfig, Trigger, IndexComparsion, TriggerOption } from '../services/types/trader.types';
import { TriggerConst } from '../services/types/trader.types';

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
    
    let options: TriggerOption[] = [];
    options.push(this.buildTriggerOption());
    
    let trigger: Trigger = {
      index_name: 'predict_depth_balance',
      average_period: 30 * 60 * 1000, // default 30 min
      sleep_period: 0,
      index_comparsion: IndexComparsion.greater_than_index,
      comparsion_value: 0.6,
      options: options
    };
    
    this.config.triggers.push(trigger);
  }

  public buildTriggerOption() : TriggerOption {
    let options_trigger_select: any[] = _.map(TriggerConst.TRIGGER_OPTIONS, (p:any) => {
      return {
        id: p.variable_name,
        text: p.description,
      }
    });
    
    let value_options_trigger_select: any[] = [options_trigger_select[0]];
    
    let option: TriggerOption = {
      name: TriggerConst.TRIGGER_OPTIONS[0].variable_name,
      value: 1000, // default one second
      options_trigger_select: options_trigger_select,
      value_options_trigger_select: value_options_trigger_select,
    };

    return option;
  }
  
  removeTrigger(trigger):void {
    this.config.triggers = _.filter(this.config.triggers, (p) => {
      return trigger !== p;
    });
  }
}