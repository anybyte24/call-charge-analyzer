import { CallRecord, CallCategory, CallSummary, CallerAnalysis, PrefixConfig } from '@/types/call-analysis';
import { NumberCategorizer } from './number-categorizer';

export class CallAnalyzer {
  static defaultPrefixConfig = NumberCategorizer.defaultPrefixConfig;

  static categorizeNumber(number: string, prefixConfig: PrefixConfig[] = this.defaultPrefixConfig): CallCategory & { costPerMinute: number } {
    return NumberCategorizer.categorizeNumber(number, prefixConfig);
  }

  static parseDuration(duration: string): number {
    if (!duration || duration.trim() === '') return 0;
    
    const cleanDuration = duration.replace(/"/g, '').trim();
    
    if (cleanDuration.includes(':')) {
      const parts = cleanDuration.split(':');
      
      if (parts.length === 3) {
        const hours = parseInt(parts[0]) || 0;
        const minutes = parseInt(parts[1]) || 0;
        const seconds = parseInt(parts[2]) || 0;
        return hours * 3600 + minutes * 60 + seconds;
      } else if (parts.length === 2) {
        const minutes = parseInt(parts[0]) || 0;
        const seconds = parseInt(parts[1]) || 0;
        return minutes * 60 + seconds;
      }
    }
    
    if (!isNaN(parseInt(cleanDuration))) {
      return parseInt(cleanDuration);
    }
    
    return 0;
  }

  static formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  static calculateCallCost(durationSeconds: number, costPerMinute: number): number {
    if (durationSeconds === 0 || costPerMinute === 0) return 0;
    const exactMinutes = durationSeconds / 60;
    const cost = exactMinutes * costPerMinute;
    return parseFloat(cost.toFixed(4));
  }

  static parseCSV(csvContent: string, prefixConfig: PrefixConfig[] = this.defaultPrefixConfig): CallRecord[] {
    const lines = csvContent.split('\n');
    const records: CallRecord[] = [];
    
    let startIndex = 0;
    const firstLine = lines[0]?.toLowerCase() || '';
    if (firstLine.includes('ora') || firstLine.includes('data') || firstLine.includes('durata') || firstLine.includes('numero')) {
      startIndex = 1;
    }
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const fields = this.parseCSVLine(line, ',');
      
      if (fields.length >= 5) {
        const cleanFields = fields.map(field => field.replace(/"/g, '').trim());
        
        const timeCall = cleanFields[0] || '';
        const dateCall = cleanFields[1] || '';
        const callerNumber = cleanFields[2] || '';
        const calledNumber = cleanFields[3] || '';
        const duration = cleanFields[4] || '00:00:00';
        
        const categoryWithCost = this.categorizeNumber(calledNumber, prefixConfig);
        const durationSeconds = this.parseDuration(duration);
        const callCost = this.calculateCallCost(durationSeconds, categoryWithCost.costPerMinute);
        
        records.push({
          id: `${i}-${Date.now()}`,
          timestamp: timeCall,
          date: dateCall,
          callerNumber,
          calledNumber,
          duration,
          durationSeconds,
          category: {
            type: categoryWithCost.type,
            description: categoryWithCost.description
          },
          cost: callCost
        });
      }
    }
    
    return records;
  }

  static parseCSVLine(line: string, delimiter: string): string[] {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        fields.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    fields.push(current);
    return fields;
  }

  static generateSummary(records: CallRecord[]): CallSummary[] {
    const categoryMap = new Map<string, CallSummary>();
    
    records.forEach(record => {
      let macroCategory = '';
      const category = record.category.description;
      
      if (['Spagna', 'Francia', 'Germania', 'Regno Unito', 'Svizzera', 'Austria', 'Paesi Bassi', 'Belgio'].some(paese => category.includes(paese))) {
        if (category.includes('Mobile')) {
          const paese = ['Spagna', 'Francia', 'Germania', 'Regno Unito', 'Svizzera', 'Austria', 'Paesi Bassi', 'Belgio'].find(p => category.includes(p));
          macroCategory = `${paese} Mobile`;
        } else if (category.includes('Fisso')) {
          const paese = ['Spagna', 'Francia', 'Germania', 'Regno Unito', 'Svizzera', 'Austria', 'Paesi Bassi', 'Belgio'].find(p => category.includes(p));
          macroCategory = `${paese} Fisso`;
        } else {
          macroCategory = category;
        }
      }
      else if (category.includes('TIM') || category.includes('Vodafone') || 
               category.includes('Wind') || category.includes('Iliad') || 
               category.includes('Fastweb') || category.includes('Tre') ||
               category === 'Mobile') {
        macroCategory = 'Mobile';
      }
      else if (category === 'Numero Verde') {
        macroCategory = 'Numero Verde';
      } else if (category === 'Numero Premium') {
        macroCategory = 'Numero Premium';
      }
      else if (record.category.type === 'landline') {
        macroCategory = 'Fisso';
      }
      else if (record.category.type === 'mobile') {
        macroCategory = 'Mobile';
      }
      else {
        macroCategory = category;
      }
      
      const existing = categoryMap.get(macroCategory);
      
      if (existing) {
        existing.count++;
        existing.totalSeconds += record.durationSeconds;
        existing.cost = (existing.cost || 0) + (record.cost || 0);
      } else {
        categoryMap.set(macroCategory, {
          category: macroCategory,
          count: 1,
          totalSeconds: record.durationSeconds,
          totalMinutes: 0,
          totalHours: 0,
          formattedDuration: '',
          cost: record.cost || 0
        });
      }
    });
    
    const summaries = Array.from(categoryMap.values()).map(summary => ({
      ...summary,
      totalMinutes: Math.floor(summary.totalSeconds / 60),
      totalHours: Math.floor(summary.totalSeconds / 3600),
      formattedDuration: this.formatDuration(summary.totalSeconds)
    }));
    
    return summaries.sort((a, b) => b.totalSeconds - a.totalSeconds);
  }

  static generateCallerAnalysis(records: CallRecord[]): CallerAnalysis[] {
    const callerMap = new Map<string, CallRecord[]>();
    
    records.forEach(record => {
      const caller = record.callerNumber;
      if (!callerMap.has(caller)) {
        callerMap.set(caller, []);
      }
      callerMap.get(caller)!.push(record);
    });
    
    const analyses: CallerAnalysis[] = [];
    
    callerMap.forEach((callerRecords, callerNumber) => {
      const summary = this.generateSummary(callerRecords);
      const totalDuration = callerRecords.reduce((sum, record) => sum + record.durationSeconds, 0);
      
      analyses.push({
        callerNumber,
        totalCalls: callerRecords.length,
        categories: summary,
        totalDuration,
        formattedTotalDuration: this.formatDuration(totalDuration)
      });
    });
    
    return analyses.sort((a, b) => b.totalDuration - a.totalDuration);
  }

  static exportToCSV(records: CallRecord[], summary: CallSummary[], callerAnalysis: CallerAnalysis[]): string {
    let csv = 'RIEPILOGO GENERALE\n';
    csv += 'Categoria,Chiamate,Durata,Costo\n';
    
    summary.forEach(cat => {
      csv += `${cat.category},${cat.count},${cat.formattedDuration},€${cat.cost?.toFixed(2) || '0.00'}\n`;
    });
    
    csv += '\n\nDETTAGLIO PER CHIAMANTE\n';
    csv += 'Numero Chiamante,Totale Chiamate,Durata Totale,Costo Totale\n';
    
    callerAnalysis.forEach(caller => {
      const totalCost = caller.categories.reduce((sum, cat) => sum + (cat.cost || 0), 0);
      csv += `${caller.callerNumber},${caller.totalCalls},${caller.formattedTotalDuration},€${totalCost.toFixed(2)}\n`;
    });
    
    csv += '\n\nDETTAGLIO CHIAMATE\n';
    csv += 'Data,Ora,Chiamante,Chiamato,Durata,Categoria,Costo\n';
    
    records.forEach(record => {
      csv += `${record.date},${record.timestamp},${record.callerNumber},${record.calledNumber},${record.duration},${record.category.description},€${record.cost?.toFixed(2) || '0.00'}\n`;
    });
    
    return csv;
  }

  static exportToPDF(summary: CallSummary[], callerAnalysis: CallerAnalysis[], fileName: string, allRecords?: CallRecord[]): string {
    const totalCost = summary.reduce((sum, cat) => sum + (cat.cost || 0), 0);
    const totalCalls = summary.reduce((sum, cat) => sum + cat.count, 0);
    const totalDuration = summary.reduce((sum, cat) => sum + cat.totalSeconds, 0);
    
    const sortedRecords = allRecords ? [...allRecords].sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.timestamp}`);
      const dateB = new Date(`${b.date} ${b.timestamp}`);
      return dateA.getTime() - dateB.getTime();
    }) : [];

    let hourlyAnalysis = '';
    if (allRecords && allRecords.length > 0) {
      const hourCounts = new Array(24).fill(0).map((_, hour) => ({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        calls: 0,
        cost: 0
      }));

      allRecords.forEach(record => {
        if (record.timestamp) {
          const timeParts = record.timestamp.split(':');
          if (timeParts.length >= 1) {
            const hour = parseInt(timeParts[0]);
            if (hour >= 0 && hour < 24) {
              hourCounts[hour].calls++;
              hourCounts[hour].cost += record.cost || 0;
            }
          }
        }
      });

      const peakHours = hourCounts
        .filter(hour => hour.calls > 0)
        .sort((a, b) => b.calls - a.calls)
        .slice(0, 5);

      hourlyAnalysis = `
        <h2 class="section-title">Distribuzione Oraria</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Fascia Oraria</th>
              <th>Chiamate</th>
              <th>Costo</th>
              <th>% del Totale</th>
            </tr>
          </thead>
          <tbody>
            ${peakHours.map(hour => `
              <tr>
                <td>${hour.hour}</td>
                <td>${hour.calls}</td>
                <td>€${hour.cost.toFixed(2)}</td>
                <td>${((hour.calls / totalCalls) * 100).toFixed(1)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    let topNumbersAnalysis = '';
    if (allRecords && allRecords.length > 0) {
      const numberMap = new Map();
      
      allRecords.forEach(record => {
        const number = record.calledNumber;
        const existing = numberMap.get(number);
        
        if (existing) {
          existing.callCount++;
          existing.totalCost += record.cost || 0;
          existing.totalDuration += record.durationSeconds;
          if (!existing.callers.includes(record.callerNumber)) {
            existing.callers.push(record.callerNumber);
          }
        } else {
          numberMap.set(number, {
            number,
            callCount: 1,
            totalCost: record.cost || 0,
            totalDuration: record.durationSeconds,
            category: record.category.description,
            callers: [record.callerNumber]
          });
        }
      });

      const topNumbers = Array.from(numberMap.values())
        .sort((a, b) => b.callCount - a.callCount)
        .slice(0, 10);

      const repeatedNumbers = Array.from(numberMap.values())
        .filter(n => n.callCount > 1)
        .length;

      topNumbersAnalysis = `
        <h2 class="section-title">Analisi Numeri Chiamati</h2>
        <div style="margin-bottom: 20px;">
          <p><strong>Numeri unici chiamati:</strong> ${numberMap.size}</p>
          <p><strong>Numeri chiamati ripetutamente:</strong> ${repeatedNumbers} (${((repeatedNumbers / numberMap.size) * 100).toFixed(1)}%)</p>
        </div>
        
        <h3 style="font-size: 14px; margin-bottom: 10px;">Top 10 Numeri Più Chiamati</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Numero</th>
              <th>Categoria</th>
              <th>Chiamate</th>
              <th>Durata Totale</th>
              <th>Costo Totale</th>
              <th>Chiamanti Unici</th>
            </tr>
          </thead>
          <tbody>
            ${topNumbers.map(number => `
              <tr>
                <td style="font-family: monospace;">${number.number}</td>
                <td>${number.category}</td>
                <td>${number.callCount}</td>
                <td>${CallAnalyzer.formatDuration(number.totalDuration)}</td>
                <td>€${number.totalCost.toFixed(2)}</td>
                <td>${number.callers.length}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Report Chiamate - ${fileName}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { margin-bottom: 30px; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .table th, .table td { border: 1px solid #ddd; padding: 6px; text-align: left; font-size: 11px; }
        .table th { background-color: #f2f2f2; font-weight: bold; }
        .total { font-weight: bold; background-color: #e8f4fd; }
        .section-title { font-size: 16px; font-weight: bold; margin-top: 30px; margin-bottom: 15px; }
        .highlight-box { background-color: #f8f9fa; border: 1px solid #dee2e6; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
        @media print { 
          .no-print { display: none; }
          .page-break { page-break-before: always; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Report Analisi Chiamate Telefoniche</h1>
        <p>File: ${fileName}</p>
        <p>Data: ${new Date().toLocaleDateString('it-IT')} - ${new Date().toLocaleTimeString('it-IT')}</p>
    </div>
    
    <div class="highlight-box">
        <h2>Riepilogo Esecutivo</h2>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
            <div>
                <p><strong>Totale Chiamate:</strong> ${totalCalls}</p>
                <p><strong>Durata Totale:</strong> ${CallAnalyzer.formatDuration(totalDuration)}</p>
            </div>
            <div>
                <p><strong>Costo Totale:</strong> €${totalCost.toFixed(2)}</p>
                <p><strong>Costo Medio:</strong> €${totalCalls > 0 ? (totalCost / totalCalls).toFixed(3) : '0.000'}/chiamata</p>
            </div>
            <div>
                <p><strong>Chiamanti Unici:</strong> ${callerAnalysis.length}</p>
                <p><strong>Durata Media:</strong> ${CallAnalyzer.formatDuration(Math.floor(totalDuration / totalCalls))}/chiamata</p>
            </div>
        </div>
    </div>
    
    <h2 class="section-title">Riepilogo per Categoria</h2>
    <table class="table">
        <thead>
            <tr>
                <th>Categoria</th>
                <th>Chiamate</th>
                <th>% del Totale</th>
                <th>Durata</th>
                <th>Costo</th>
                <th>Costo Medio</th>
            </tr>
        </thead>
        <tbody>
            ${summary.map(cat => `
                <tr>
                    <td>${cat.category}</td>
                    <td>${cat.count}</td>
                    <td>${((cat.count / totalCalls) * 100).toFixed(1)}%</td>
                    <td>${cat.formattedDuration}</td>
                    <td>€${cat.cost?.toFixed(2) || '0.00'}</td>
                    <td>€${cat.count > 0 ? ((cat.cost || 0) / cat.count).toFixed(3) : '0.000'}</td>
                </tr>
            `).join('')}
            <tr class="total">
                <td><strong>TOTALE</strong></td>
                <td><strong>${totalCalls}</strong></td>
                <td><strong>100.0%</strong></td>
                <td><strong>${CallAnalyzer.formatDuration(totalDuration)}</strong></td>
                <td><strong>€${totalCost.toFixed(2)}</strong></td>
                <td><strong>€${totalCalls > 0 ? (totalCost / totalCalls).toFixed(3) : '0.000'}</strong></td>
            </tr>
        </tbody>
    </table>
    
    ${hourlyAnalysis}
    
    ${topNumbersAnalysis}
    
    <h2 class="section-title">Top 10 Chiamanti per Costo</h2>
    <table class="table">
        <thead>
            <tr>
                <th>Numero</th>
                <th>Chiamate</th>
                <th>Durata</th>
                <th>Costo</th>
                <th>% del Costo Totale</th>
            </tr>
        </thead>
        <tbody>
            ${callerAnalysis.slice(0, 10).map(caller => {
                const totalCallerCost = caller.categories.reduce((sum, cat) => sum + (cat.cost || 0), 0);
                return `
                    <tr>
                        <td style="font-family: monospace;">${caller.callerNumber}</td>
                        <td>${caller.totalCalls}</td>
                        <td>${caller.formattedTotalDuration}</td>
                        <td>€${totalCallerCost.toFixed(2)}</td>
                        <td>${((totalCallerCost / totalCost) * 100).toFixed(1)}%</td>
                    </tr>
                `;
            }).join('')}
        </tbody>
    </table>
    
    ${sortedRecords.length > 0 && sortedRecords.length <= 100 ? `
    <div class="page-break">
        <h2 class="section-title">Dettaglio Chiamate</h2>
        <table class="table">
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Ora</th>
                    <th>Chiamante</th>
                    <th>Chiamato</th>
                    <th>Durata</th>
                    <th>Categoria</th>
                    <th>Costo</th>
                </tr>
            </thead>
            <tbody>
                ${sortedRecords.map(record => `
                    <tr>
                        <td>${record.date}</td>
                        <td>${record.timestamp}</td>
                        <td style="font-family: monospace;">${record.callerNumber}</td>
                        <td style="font-family: monospace;">${record.calledNumber}</td>
                        <td>${record.duration}</td>
                        <td>${record.category.description}</td>
                        <td>€${record.cost?.toFixed(2) || '0.00'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    ` : sortedRecords.length > 100 ? `
    <div class="page-break">
        <h2 class="section-title">Dettaglio Chiamate</h2>
        <p><em>Il dettaglio completo delle chiamate non è incluso in questo report a causa del numero elevato di record (${sortedRecords.length}). 
        Utilizzare l'export CSV per ottenere il dettaglio completo.</em></p>
    </div>
    ` : ''}
    
    <div class="no-print" style="margin-top: 30px; text-align: center;">
        <button onclick="window.print()" style="background-color: #3B82F6; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
            Stampa Report
        </button>
    </div>
</body>
</html>
    `;
  }
}
