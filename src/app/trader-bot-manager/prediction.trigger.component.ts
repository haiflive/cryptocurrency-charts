import { Component, Input, OnInit } from '@angular/core';
import { Trigger, IndexComparsion, TriggerOption, TraderBotConst } from '../services/types/trader.types';
import { TraderBotHelper, TriggerOptionSelect } from './trader.bot.helper';

import * as _ from "lodash";

@Component({
  selector: 'prediction-trigger-content',
  templateUrl: './prediction.trigger.component.html'
})
export class PredictionTriggerComponent implements OnInit {
  @Input('trigger-config') config: Trigger | Trigger; // see more: trader.types.ts:2-3
  
  public indexComparsion = IndexComparsion;
  // index select
  index_select: any[];
  value_index_select: any[];
  
  trigger_options_list: TriggerOptionSelect[];
  
  constructor() {
    //this.index_comparsion = IndexComparsion.less_than_index;
    // --
    
    // this.trigger_options_list = [];
    // this.addTriggerOption();
  }

  ngOnInit() {
    this.index_select = _.map(TraderBotConst.TRIGGER_INDEXES, (p:any) => {
      return {
        id: p.name,
        text: p.description,
      }
    });
    
    this.value_index_select = [this.index_select[0]];

    this.trigger_options_list = [];
    this.config.options.forEach((option:TriggerOption) => {
      this.trigger_options_list.push(TraderBotHelper.buildTriggerOptionSelect(option));
    });
  }
  
  public addTriggerOption() {
    let option: TriggerOption = TraderBotHelper.buildTriggerOption();
    this.config.options.push(option);
    this.trigger_options_list.push(TraderBotHelper.buildTriggerOptionSelect(option));
  }
  
  removeTriggerOption(option_select: TriggerOptionSelect):void {
    this.config.options = _.filter(this.config.options, (p) => {
      return option_select.option !== p;
    });

    this.trigger_options_list = _.filter(this.trigger_options_list, (p) => {
      return option_select !== p;
    });
  }

  selectTriggerOption(item: {id: string, text: string}, option_select: TriggerOptionSelect): void {
    option_select.option.name = item.id;
    // this.config.options[?].name = item.id; // not need change by referance
  }
  
}
