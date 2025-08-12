import { CallRecord, PrefixConfig } from '@/types/call-analysis';
import { NumberCategorizer } from './number-categorizer';

export class CostRecalculator {
  /**
   * Sistema di ricalcolo completamente nuovo e indipendente
   */
  static recalculateAllCosts(records: CallRecord[], prefixConfig?: PrefixConfig[]): CallRecord[] {
    console.log('🔄 === NUOVO SISTEMA DI RICALCOLO ===');
    console.log(`📊 Elaboro ${records.length} chiamate`);
    
    const config = prefixConfig || NumberCategorizer.defaultPrefixConfig;
    
    return records.map((record, index) => {
      // Categorizza il numero chiamato
      const categoryWithCost = NumberCategorizer.categorizeNumber(record.calledNumber, config);
      
      // Calcolo del costo con il nuovo sistema
      const newCost = this.calculatePreciseCost(record.durationSeconds, categoryWithCost.costPerMinute);
      
      console.log(`🔢 Record ${index + 1}: ${record.calledNumber} (${record.durationSeconds}s) → Categoria: ${categoryWithCost.description} → Tariffa: €${categoryWithCost.costPerMinute}/min → Costo: €${newCost.toFixed(4)}`);
      
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
  
  /**
   * Calcolo preciso del costo basato su minuti esatti
   */
  private static calculatePreciseCost(durationSeconds: number, costPerMinute: number): number {
    if (durationSeconds === 0 || costPerMinute === 0) {
      return 0;
    }

    // Fatturazione 60/60: minimo 60s e scatti da 60s
    const billedMinutes = Math.max(1, Math.ceil(durationSeconds / 60));

    // Calcola il costo in base ai minuti fatturati
    const cost = billedMinutes * costPerMinute;

    // Arrotonda a 4 decimali per precisione
    return parseFloat(cost.toFixed(4));
  }
  
  /**
   * Verifica l'integrità dei calcoli
   */
  static verifyCosts(records: CallRecord[]): boolean {
    let hasErrors = false;
    
    records.forEach((record, index) => {
      if (record.cost === undefined || record.cost === null) {
        console.error(`❌ Record ${index + 1}: Costo mancante`);
        hasErrors = true;
      }
      
      if (record.durationSeconds > 0 && record.cost === 0) {
        console.warn(`⚠️ Record ${index + 1}: Durata ${record.durationSeconds}s ma costo €0.00`);
      }
    });
    
    return !hasErrors;
  }
}