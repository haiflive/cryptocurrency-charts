import { Pipe } from "@angular/core";
import { OpenOrder } from '../../services/types/trader.types';

import * as _ from "lodash";

export enum OrderSortDirection {
  ASC = 10,
  DESC = 20,
}

export interface OrderSortArgs {
  filed_name: string;
  direction: OrderSortDirection;
};

@Pipe({
  name: "ordersSort"
})
export class OrdersSortPipe {
  transform(array: OpenOrder[], args: OrderSortArgs): OpenOrder[] {
    if(_.isEmpty(args.filed_name))
      return array;
    
    return _.sortBy(array, (p) => {
      if(args.direction == OrderSortDirection.ASC) {
        return p[args.filed_name];
      }

      return -p[args.filed_name];
    });
  }
}