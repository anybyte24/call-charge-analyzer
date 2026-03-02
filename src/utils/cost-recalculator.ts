import { CallRecord, PrefixConfig } from '@/types/call-analysis';
import { NumberCategorizer } from './number-categorizer';

export class CostRecalculator {
  static recalculateAllCosts(records: CallRecord[], prefixConfig?: PrefixConfig[]): CallRecord[] {
    const config = prefixConfig || NumberCategorizer.defaultPrefixConfig;
    
    return records.map((record) => {
      const categoryWithCost = NumberCategorizer.categorizeNumber(record.calledNumber, config);
      const newCost = this.calculatePreciseCost(record.durationSeconds, categoryWithCost.costPerMinute);
      
      return {
        ...record,
        category: {
          type: categoryWithCost.type,
          description: categoryWithCost.description
        },
        cost: newCost
      };
    });
  }
  
  private static calculatePreciseCost(durationSeconds: number, costPerMinute: number): number {
    if (durationSeconds === 0 || costPerMinute === 0) return 0;
    const exactMinutes = durationSeconds / 60;
    const cost = exactMinutes * costPerMinute;
    return parseFloat(cost.toFixed(4));
  }
  
  static verifyCosts(records: CallRecord[]): boolean {
    return records.every(record => record.cost !== undefined && record.cost !== null);
  }
}
