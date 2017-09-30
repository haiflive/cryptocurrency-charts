import { TraderBot, Trigger, IndexComparsion, TriggerAction, TraderBotConst, PredictionConfig } from '../services/types/trader.types';

import * as _ from "lodash";

export interface TriggerActionSelect {
  action: TriggerAction;
  // action trigger select
  actions_trigger_select?: any[];
  value_actions_trigger_select?: any[];
}

export class TraderBotHelper {
  
    public static buildTrader() : TraderBot {
      let trader: TraderBot = {
        name: 'New bot',
        api_key: 'QWXA2ZA8-UJH5ITDI-7JK8V192-R690VFDC',
        api_secret: 'cbfd802e81509866707ca91d1e9dd68a947e16d2956c30f503f06080061037f2fe09a636fd4050e6f8e8904e34b7af5421d7f3663da36365905421485b412e99',
        stock_id: TraderBotConst.STOCK_EXCHANGE_LIST[0].id,// 'poloniex',
        currency_pair: 'XMR_ZEC',
        bot_config: TraderBotHelper.buildPredictionConfig()
      }

      return trader;
    }

    public static buildTrigger() : Trigger {
      let actions: TriggerAction[] = [];
      actions.push(TraderBotHelper.buildTriggerAction());
      
      let trigger: Trigger = {
        index_name: 'predict_depth_balance',
        average_period: 30 * 60 * 1000, // default 30 min
        sleep_period: 0,
        index_comparsion: IndexComparsion.greater_than_index,
        comparsion_value: 0.6,
        actions: actions
      };
  
      return trigger;
    }
  
    public static buildTriggerActionSelect(trigger_action: TriggerAction) : TriggerActionSelect {
      let action_GroupParams = _.map(TraderBotConst.TRIGGER_ACTIONS, (p:any) => {
        return {
          id: p.variable_name,
          text: p.name,
        }
      });

      let actions_trigger_select = [{
        id: 1,
        text: 'Change param',
        children: action_GroupParams
      }];

      let value_actions_trigger_select: any[] = [
        _.find(action_GroupParams, (p:any) => {
          return trigger_action.param == p.id;
        })
      ];

      if(_.isEmpty(value_actions_trigger_select))
        value_actions_trigger_select = [action_GroupParams[0]];
        

      let action_select: TriggerActionSelect = {
        action: trigger_action,
        actions_trigger_select: actions_trigger_select,
        value_actions_trigger_select: value_actions_trigger_select,
      }
  
      return action_select;
    }

    public static buildTriggerAction() : TriggerAction {
      let action: TriggerAction = {
        name: TraderBotConst.TRIGGER_ACTIONS[0].name,
        param: TraderBotConst.TRIGGER_ACTIONS[0].variable_name,
        value: 0, 
      };

      return action;
    }

    public static buildPredictionConfig() : PredictionConfig {
      let config: PredictionConfig = {
        is_active: false,
        reorder_time: 30 * 60 *1000, // default 30 min
        prediction_time: 3 * 24 * 60 * 60 * 1000, // default 3 days
        percentage_supply: 60,
        percentage_buy: 5,
        percentage_sell: 10,
        balance: 50,
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