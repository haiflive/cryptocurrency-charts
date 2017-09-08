import { Component, Input } from '@angular/core';
import * as _ from "lodash";
import { Trigger, IndexComparsion, TriggerOption, TriggerConst} from '../services/types/trader.types';

@Component({
  selector: 'prediction-trigger-content',
  templateUrl: './prediction.trigger.component.html'
})
export class PredictionTriggerComponent {
  @Input('trigger-config') config: Trigger | Trigger; // see more: trader.types.ts:2-3
  
  public indexComparsion = IndexComparsion;
  // index select
  index_select: any[];
  value_index_select: any[];
  
  // average_period: number;
  // index_comparsion: IndexComparsion;
  // comparsion_value: number;
  
  trigger_options_list: TriggerOption[];
  
  constructor() {
    //this.index_comparsion = IndexComparsion.less_than_index;
    // --
    this.index_select = _.map(TriggerConst.TRIGGER_INDEXES, (p:any) => {
      return {
        id: p.name,
        text: p.description,
      }
    });
    
    this.value_index_select = [this.index_select[0]];
    
    this.trigger_options_list = [];
    this.addTriggerOption();
  }
  
  public addTriggerOption() {
    
    
    this.trigger_options_list.push(this.buildTriggerOption());
  }

  public buildTriggerOption() : TriggerOption {
    let options_trigger_select = _.map(TriggerConst.TRIGGER_OPTIONS, (p:any) => {
      return {
        id: p.variable_name,
        text: p.description,
      }
    });
    
    let value_options_trigger_select = [options_trigger_select[0]];
    
    let option: TriggerOption = {
      name: TriggerConst.TRIGGER_OPTIONS[0].variable_name,
      value: 1000, // default one second
      options_trigger_select: options_trigger_select,
      value_options_trigger_select: value_options_trigger_select,
    };

    return option;
  }
  
  removeTriggerOption(option):void {
    this.trigger_options_list = _.filter(this.trigger_options_list, (p) => {
      return option !== p;
    });
  }
  
}
