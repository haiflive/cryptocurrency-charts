import { TraderBot, Trigger, IndexComparsion, TriggerOption, TraderBotConst, PredictionConfig } from '../services/types/trader.types';

import * as _ from "lodash";

export interface TriggerOptionSelect {
  option: TriggerOption;
  // option trigger select
  options_trigger_select?: any[];
  value_options_trigger_select?: any[];
}

export class TraderBotHelper {
  
    public static buildTrader() : TraderBot {
      let trader: TraderBot = {
        name: 'New bot',
        is_active: false,
        api_key: 'QWXA2ZA8-UJH5ITDI-7JK8V192-R690VFDC',
        api_secret: 'cbfd802e81509866707ca91d1e9dd68a947e16d2956c30f503f06080061037f2fe09a636fd4050e6f8e8904e34b7af5421d7f3663da36365905421485b412e99',
        stock_id: TraderBotConst.STOCK_EXCHANGE_LIST[0].id,// 'poloniex',
        currency_pair: 'XMR_ZEC',
        bot_config: TraderBotHelper.buildPredictionConfig()
      }

      return trader;
    }

    public static buildTrigger() : Trigger {
      let options: TriggerOption[] = [];
      options.push(TraderBotHelper.buildTriggerOption());
      
      let trigger: Trigger = {
        index_name: 'predict_depth_balance',
        average_period: 30 * 60 * 1000, // default 30 min
        sleep_period: 0,
        index_comparsion: IndexComparsion.greater_than_index,
        comparsion_value: 0.6,
        options: options
      };
  
      return trigger;
    }
  
    public static buildTriggerOptionSelect(trigger_option: TriggerOption) : TriggerOptionSelect {
      let options_trigger_select = _.map(TraderBotConst.TRIGGER_OPTIONS, (p:any) => {
        return {
          id: p.variable_name,
          text: p.description,
        }
      });
      
      let value_options_trigger_select = _.find(options_trigger_select, (p:any) => {
        return trigger_option.name == p.id;
      });
      value_options_trigger_select = [value_options_trigger_select];

      if(_.isEmpty(value_options_trigger_select))
        value_options_trigger_select = [options_trigger_select[0]];
        

      let option_select: TriggerOptionSelect = {
        option: trigger_option,
        options_trigger_select: options_trigger_select,
        value_options_trigger_select: value_options_trigger_select,
      }
  
      return option_select;
    }

    public static buildTriggerOption() : TriggerOption {
      let option: TriggerOption = {
        name: TraderBotConst.TRIGGER_OPTIONS[0].variable_name,
        value: 1000, // default one second
      };

      return option;
    }

    public static buildPredictionConfig() : PredictionConfig {
      let config: PredictionConfig = {
        reorder_time: 30 * 60 *1000, // default 30 min
        prediction_time: 3 * 24 * 60 * 60 * 1000, // default 3 days
        percentage_supply: 20,
        percentage_buy: 5,
        percentage_sell: 10,
        balance: 1/2,
        order_book_depth: 200,
        triggers: [TraderBotHelper.buildTrigger()]
      }

      return config;
    }
  }