import { CallRecord, CallCategory, CallSummary, CallerAnalysis, PrefixConfig } from '@/types/call-analysis';
import { NumberCategorizer } from './number-categorizer';

export class CallAnalyzer {
  static defaultPrefixConfig = NumberCategorizer.defaultPrefixConfig;

  static categorizeNumber(number: string, prefixConfig: PrefixConfig[] = this.defaultPrefixConfig): CallCategory & { costPerMinute: number } {
    return NumberCategorizer.categorizeNumber(number, prefixConfig);
  }

  static parseDuration(duration: string): number {
    if (!duration || duration.trim() === '') return 0;
    
    // Clean the duration string
    const cleanDuration = duration.replace(/"/g, '').trim();
    
    console.log('Parsing duration:', cleanDuration);
    
    // Check for time format (HH:MM:SS or MM:SS)
    if (cleanDuration.includes(':')) {
      const parts = cleanDuration.split(':');
      
      if (parts.length === 3) {
        // HH:MM:SS format
        const hours = parseInt(parts[0]) || 0;
        const minutes = parseInt(parts[1]) || 0;
        const seconds = parseInt(parts[2]) || 0;
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        console.log('Duration HH:MM:SS:', hours, minutes, seconds, '=', totalSeconds, 'seconds');
        return totalSeconds;
      } else if (parts.length === 2) {
        // MM:SS format
        const minutes = parseInt(parts[0]) || 0;
        const seconds = parseInt(parts[1]) || 0;
        const totalSeconds = minutes * 60 + seconds;
        console.log('Duration MM:SS:', minutes, seconds, '=', totalSeconds, 'seconds');
        return totalSeconds;
      }
    }
    
    // Single number might be seconds
    if (!isNaN(parseInt(cleanDuration))) {
      const seconds = parseInt(cleanDuration);
      console.log('Duration as seconds:', seconds);
      return seconds;
    }
    
    console.log('Could not parse duration:', cleanDuration);
    return 0;
  }

  static formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  static parseCSV(csvContent: string, prefixConfig: PrefixConfig[] = this.defaultPrefixConfig): CallRecord[] {
    console.log('Starting CSV parse, content length:', csvContent.length);
    
    const lines = csvContent.split('\n');
    const records: CallRecord[] = [];
    
    console.log('Total lines:', lines.length);
    console.log('First few lines:', lines.slice(0, 5));
    
    // Skip header if present
    let startIndex = 0;
    const firstLine = lines[0]?.toLowerCase() || '';
    if (firstLine.includes('ora') || firstLine.includes('data') || firstLine.includes('durata') || firstLine.includes('numero')) {
      startIndex = 1;
      console.log('Skipping header line:', lines[0]);
    }
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      console.log(`Processing line ${i}:`, line);
      
      // Parse CSV line with proper handling of quoted fields
      const fields = this.parseCSVLine(line, ',');
      console.log(`Line ${i} fields:`, fields);
      
      if (fields.length >= 5) {
        // Based on your CSV structure:
        // 0: Ora Chiamata, 1: Data Chiamata, 2: Chiamante, 3: Chiamato, 4: Durata
        const cleanFields = fields.map(field => field.replace(/"/g, '').trim());
        
        const timeCall = cleanFields[0] || '';
        const dateCall = cleanFields[1] || '';
        const callerNumber = cleanFields[2] || '';
        const calledNumber = cleanFields[3] || '';
        const duration = cleanFields[4] || '00:00:00';
        
        console.log('Parsed fields:', {
          timeCall,
          dateCall,
          callerNumber,
          calledNumber,
          duration
        });
        
        const categoryWithCost = this.categorizeNumber(calledNumber, prefixConfig);
        const durationSeconds = this.parseDuration(duration);
        
        console.log('Parsed record:', {
          calledNumber,
          callerNumber,
          duration,
          durationSeconds,
          category: categoryWithCost
        });
        
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
          cost: (durationSeconds / 60) * categoryWithCost.costPerMinute
        });
      }
    }
    
    console.log('Total records parsed:', records.length);
    console.log('Sample records:', records.slice(0, 3));
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
      const key = record.category.type;
      const existing = categoryMap.get(key);
      
      if (existing) {
        existing.count++;
        existing.totalSeconds += record.durationSeconds;
        existing.cost = (existing.cost || 0) + (record.cost || 0);
      } else {
        categoryMap.set(key, {
          category: record.category.description,
          count: 1,
          totalSeconds: record.durationSeconds,
          totalMinutes: 0,
          totalHours: 0,
          formattedDuration: '',
          cost: record.cost || 0
        });
      }
    });
    
    // Calculate minutes, hours and format duration
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
    
    // Group by caller number
    records.forEach(record => {
      const caller = record.callerNumber;
      if (!callerMap.has(caller)) {
        callerMap.set(caller, []);
      }
      callerMap.get(caller)!.push(record);
    });
    
    // Analyze each caller
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
    // Return HTML that can be printed as PDF
    const totalCost = summary.reduce((sum, cat) => sum + (cat.cost || 0), 0);
    const totalCalls = summary.reduce((sum, cat) => sum + cat.count, 0);
    const totalDuration = summary.reduce((sum, cat) => sum + cat.totalSeconds, 0);
    
    // Ordina le chiamate per data e ora se fornite
    const sortedRecords = allRecords ? [...allRecords].sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.timestamp}`);
      const dateB = new Date(`${b.date} ${b.timestamp}`);
      return dateA.getTime() - dateB.getTime();
    }) : [];
    
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
        @media print { 
          .no-print { display: none; }
          .page-break { page-break-before: always; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Report Analisi Chiamate</h1>
        <p>File: ${fileName}</p>
        <p>Data: ${new Date().toLocaleDateString('it-IT')}</p>
    </div>
    
    <div class="summary">
        <h2>Riepilogo Generale</h2>
        <p><strong>Totale Chiamate:</strong> ${totalCalls}</p>
        <p><strong>Durata Totale:</strong> ${CallAnalyzer.formatDuration(totalDuration)}</p>
        <p><strong>Costo Totale:</strong> €${totalCost.toFixed(2)}</p>
    </div>
    
    <table class="table">
        <thead>
            <tr>
                <th>Categoria</th>
                <th>Chiamate</th>
                <th>Durata</th>
                <th>Costo</th>
            </tr>
        </thead>
        <tbody>
            ${summary.map(cat => `
                <tr>
                    <td>${cat.category}</td>
                    <td>${cat.count}</td>
                    <td>${cat.formattedDuration}</td>
                    <td>€${cat.cost?.toFixed(2) || '0.00'}</td>
                </tr>
            `).join('')}
            <tr class="total">
                <td><strong>TOTALE</strong></td>
                <td><strong>${totalCalls}</strong></td>
                <td><strong>${CallAnalyzer.formatDuration(totalDuration)}</strong></td>
                <td><strong>€${totalCost.toFixed(2)}</strong></td>
            </tr>
        </tbody>
    </table>
    
    <h2 class="section-title">Analisi per Chiamante</h2>
    <table class="table">
        <thead>
            <tr>
                <th>Numero</th>
                <th>Chiamate</th>
                <th>Durata</th>
                <th>Costo</th>
            </tr>
        </thead>
        <tbody>
            ${callerAnalysis.slice(0, 20).map(caller => {
                const totalCost = caller.categories.reduce((sum, cat) => sum + (cat.cost || 0), 0);
                return `
                    <tr>
                        <td>${caller.callerNumber}</td>
                        <td>${caller.totalCalls}</td>
                        <td>${caller.formattedTotalDuration}</td>
                        <td>€${totalCost.toFixed(2)}</td>
                    </tr>
                `;
            }).join('')}
        </tbody>
    </table>
    
    ${sortedRecords.length > 0 ? `
    <div class="page-break">
        <h2 class="section-title">Dettaglio Tutte le Chiamate</h2>
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
                        <td>${record.callerNumber}</td>
                        <td>${record.calledNumber}</td>
                        <td>${record.duration}</td>
                        <td>${record.category.description}</td>
                        <td>€${record.cost?.toFixed(2) || '0.00'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    ` : ''}
    
    <div class="no-print">
        <button onclick="window.print()">Stampa Report</button>
    </div>
</body>
</html>
    `;
  }
}
