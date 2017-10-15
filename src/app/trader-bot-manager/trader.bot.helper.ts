import { TraderBot, Trigger, IndexComparsion, TriggerAction, TraderBotConst, PredictionConfig } from '../services/types/trader.types';

import * as _ from "lodash";

export interface TriggerActionSelect {
  action: TriggerAction;
  // action trigger select
  list?: any[];
  value?: any[];
}

export class TraderBotHelper {
  
    public static buildTrader() : TraderBot {
      let trader: TraderBot = {
        name: 'New bot',
        api_key: '',
        api_secret: '',
        stock_id: TraderBotConst.STOCK_EXCHANGE_LIST[0].id,// 'poloniex',
        currency_pair: 'XMR_ZEC',
        bot_config: TraderBotHelper.buildPredictionConfig()
      }

      return trader;
    }

    public static buildTrigger() : Trigger {
      let actions: TriggerAction[] = [];
      actions.push(TraderBotHelper.buildTriggerAction());
      
      let trigger_index = _.first(TraderBotConst.TRIGGER_INDEXES);

      let trigger: Trigger = {
        index_name: trigger_index.uid,
        index_comparsion: IndexComparsion.greater_than_index,
        comparsion_value: 50,
        actions: actions
      };
  
      return trigger;
    }
  
    public static buildTriggerActionSelect(trigger_action: TriggerAction) : TriggerActionSelect {
      let groups: any[] = _.map(TraderBotConst.ACTION_GROUPS, (p:any) => {
        let current_group = _.filter(TraderBotConst.TRIGGER_ACTIONS, (p2:any) => {
          return p2.gid == p.gid;
        });

        let children = _.map(current_group, (p:any) => {
          return {
            id: p.uid,
            text: p.name,
          }
        });

        return {
          id: p.gid,
          text: p.name,
          children: children
        };
      });

      // [{
      //   id: 1,
      //   text: 'Change param',
      //   children: action_GroupParams
      // }];
      
      let value: any[] = [];
      
      _.each(groups, (p:any) => {
        if(_.isEmpty(value)) {
          value = [_.find(p.children, (child:any) => {
            return trigger_action.param_name == child.id;
          })];
        }
      });


      if(_.isEmpty(value)) {
        let action = groups[0].children[0];
        value = [action];
      }
        

      let action_select: TriggerActionSelect = {
        action: trigger_action,
        list: groups,
        value: value,
      }
  
      return action_select;
    }

    public static buildTriggerAction() : TriggerAction {
      let action: TriggerAction = {
        param_name: TraderBotConst.TRIGGER_ACTIONS[0].uid,
        value: 0, 
      };

      return action;
    }

    public static buildPredictionConfig() : PredictionConfig {
      let config: PredictionConfig = {
        is_active: false,
        reorder_time: 30 * 60 *1000, // default 30 min
        prediction_time: 3 * 24 * 60 * 60 * 1000, // default 3 days
        percentage_supply_source: 90,
        percentage_supply_trading: 90,
        percentage_buy: 5,
        percentage_sell: 10,
        balance: 50,
        steps: 3,
        steps_price_multiplier_buy: 1,
        steps_price_multiplier_sell: 1,
        steps_amount_multiplier_buy: 1,
        steps_amount_multiplier_sell: 1,
        order_book_depth: 200,
        extremum_smoth_pesentage_up: 2.5, // %
        extremum_smoth_pesentage_down: 2.5, // %
        depth_pesentage_volume_filter_asks: 2.5, // %
        depth_pesentage_volume_filter_bids: 2.5, // %
        triggers: [TraderBotHelper.buildTrigger()]
      }

      return config;
    }
  }