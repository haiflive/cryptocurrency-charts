import { Pipe, PipeTransform } from '@angular/core';

import { OpenOrder } from '../../services/types/trader.types';

@Pipe({
    name: 'ordersFilter',
    pure: false
})
export class OrdersFilterPipe implements PipeTransform {
  transform(items: OpenOrder[], filter: OpenOrder): OpenOrder[] {
    if (!items || !filter) {
      return items;
    }
    // filter items array, items which match and return true will be kept, false will be filtered out
    return items.filter((item: OpenOrder) => this.applyFilter(item, filter));
  }
  
  /**
   * Perform the filtering.
   * 
   * @param {OpenOrder} order The OpenOrder to compare to the filter.
   * @param {OpenOrder} filter The filter to apply.
   * @return {boolean} True if OpenOrder satisfies filters, false if not.
   */
  applyFilter(order: OpenOrder, filter: OpenOrder): boolean {
    for (let field in filter) {
      if (filter[field]) {
        if (typeof filter[field] === 'string') {
          if (order[field].toLowerCase().indexOf(filter[field].toLowerCase()) === -1) {
            return false;
          }
        } else if (typeof filter[field] === 'number') {
          if (order[field] !== filter[field]) {
            return false;
          }
        }
      }
    }
    return true;
  }
}