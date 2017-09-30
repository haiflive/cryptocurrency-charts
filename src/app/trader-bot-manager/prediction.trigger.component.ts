import { Component, Input, OnInit } from '@angular/core';
import { Trigger, IndexComparsion, TriggerAction, TraderBotConst } from '../services/types/trader.types';
import { TraderBotHelper, TriggerActionSelect } from './trader.bot.helper';

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
  
  trigger_actions_list: TriggerActionSelect[];
  
  constructor() {
    //this.index_comparsion = IndexComparsion.less_than_index;
    // --
    
    // this.trigger_actions_list = [];
    // this.addTriggerAction();
  }

  ngOnInit() {
    this.index_select = _.map(TraderBotConst.TRIGGER_INDEXES, (p:any) => {
      return {
        id: p.uid,
        text: p.name,
      }
    });
    
    if(this.index_select.length > 0)
      this.value_index_select = [this.index_select[0]];

    this.trigger_actions_list = [];
    this.config.actions.forEach((action:TriggerAction) => {
      this.trigger_actions_list.push(TraderBotHelper.buildTriggerActionSelect(action));
    });
  }
  
  public addTriggerAction() {
    let action: TriggerAction = TraderBotHelper.buildTriggerAction();
    this.config.actions.push(action);
    this.trigger_actions_list.push(TraderBotHelper.buildTriggerActionSelect(action));
  }
  
  removeTriggerAction(action_select: TriggerActionSelect):void {
    this.config.actions = _.filter(this.config.actions, (p) => {
      return action_select.action !== p;
    });

    this.trigger_actions_list = _.filter(this.trigger_actions_list, (p) => {
      return action_select !== p;
    });
  }

  selectTriggerAction(item: {id: string, text: string}, action_select: TriggerActionSelect): void {
    action_select.action.name = item.id;
    // this.config.actions[?].name = item.id; // not need change by referance
  }
  
}
