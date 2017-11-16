import { TraderBot, Trigger, IndexComparsion, TriggerAction, TraderBotConst, PredictionConfig,
         ActionValueOperator } from '../services/types/trader.types';

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
        currency_pair: 'USDT_ZEC',
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
        index_comparsion: IndexComparsion.less_than_value,
        comparsion_value: 5,
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
        param_name: TraderBotConst.TRIGGER_ACTIONS[4].uid,
        value_operator: ActionValueOperator.do_plus,
        value: 1, 
      };

      return action;
    }

    public static buildPredictionConfig() : PredictionConfig {
      let trigger_buy: Trigger = {
        index_name: 'indexChartDeviation',
        index_comparsion: IndexComparsion.less_than_value,
        comparsion_value: 10,
        actions: [{
          param_name: 'percentage_buy',
          value_operator: ActionValueOperator.do_plus,
          value: 2,
        }]
      };

      let trigger_sell: Trigger = {
        index_name: 'indexChartDeviation',
        index_comparsion: IndexComparsion.greater_than_value,
        comparsion_value: 90,
        actions: [{
          param_name: 'percentage_sell',
          value_operator: ActionValueOperator.do_plus,
          value: 2,
        }]
      };

      let config: PredictionConfig = {
        is_active: false,
        reorder_time: 21 * 24 * 60 * 60 * 1000, // default 3 week
        prediction_time: 7 * 24 * 60 * 60 * 1000, // default 3 days
        percentage_supply_source: 90,
        percentage_supply_trading: 90,
        percentage_buy: 7,
        percentage_sell: 10,
        percentage_buy_statical: 0.5,
        percentage_sell_statical: 0.5,
        balance: 50,
        steps_buy: 12,
        steps_sell: 12,
        steps_price_multiplier_buy: 1.05,
        steps_price_multiplier_sell: 1.05,
        steps_amount_multiplier_buy: 1.05,
        steps_amount_multiplier_sell: 1.05,
        order_book_depth: 300,
        extremum_smoth_pesentage_up: 2.5, // %
        extremum_smoth_pesentage_down: 2.5, // %
        depth_pesentage_volume_filter_asks: 2.5, // %
        depth_pesentage_volume_filter_bids: 2.5, // %
        triggers: [trigger_buy, trigger_sell]
      }

      return config;
    }
  }