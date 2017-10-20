import { Component, Input, OnInit } from '@angular/core';
import { Trigger, IndexComparsion, TriggerAction, TraderBotConst, ActionValueOperator } from '../services/types/trader.types';
import { TraderBotHelper, TriggerActionSelect } from './trader.bot.helper';

import * as _ from "lodash";

@Component({
  selector: 'prediction-trigger-content',
  templateUrl: './prediction.trigger.component.html'
})
export class PredictionTriggerComponent implements OnInit {
  @Input('trigger-config') config: Trigger | Trigger; // see more: trader.types.ts:2-3
  
  public indexComparsion = IndexComparsion;
  public actionValueOperator = ActionValueOperator;
  // index select
  index_select: any[];
  value_index_select: any[];
  
  trigger_actions_list: TriggerActionSelect[];
  
  constructor() {}

  ngOnInit() {
    this.index_select = _.map(TraderBotConst.TRIGGER_INDEXES, (p:any) => {
      return {
        id: p.uid,
        text: p.name,
      }
    });
    
    this.value_index_select = [_.find(this.index_select, (p:any)=> {
      return p.id == this.config.index_name;
    })];
    
    if(_.isEmpty(this.value_index_select))
      this.value_index_select = [_.first(this.index_select)];

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

  selectTriggerIndex(value:any):void {
    this.config.index_name = value.id
    this.value_index_select = [value];
  }

  selectTriggerAction(item: {id: string, text: string}, action_select: TriggerActionSelect): void {
    action_select.action.param_name = item.id;
    action_select.value = [item];
    // this.config.actions[?].name = item.id; // not need change by referance
  }
  
}
