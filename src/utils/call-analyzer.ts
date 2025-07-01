import { CallRecord, CallCategory, CallSummary, CallerAnalysis, PrefixConfig } from '@/types/call-analysis';

export class CallAnalyzer {
  static defaultPrefixConfig: PrefixConfig[] = [
    { prefix: '3', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '7', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '0', category: 'landline', description: 'Fisso', costPerMinute: 0.05 },
    { prefix: '199', category: 'special', description: 'Numero Speciale', costPerMinute: 0.50 },
    { prefix: '899', category: 'special', description: 'Numero Speciale', costPerMinute: 0.50 },
    { prefix: '166', category: 'special', description: 'Numero Speciale', costPerMinute: 0.50 },
    { prefix: '144', category: 'special', description: 'Numero Speciale', costPerMinute: 0.50 }
  ];

  static categorizeNumber(number: string, prefixConfig: PrefixConfig[] = this.defaultPrefixConfig): CallCategory & { costPerMinute: number } {
    // Remove Italian prefix +39 if present and clean the number
    const cleanNumber = number.replace(/^(\+39|0039|39)/, '').replace(/\s+/g, '');
    
    console.log('Categorizing number:', number, 'cleaned:', cleanNumber);
    
    // Find matching prefix (longest match first)
    const sortedPrefixes = prefixConfig.sort((a, b) => b.prefix.length - a.prefix.length);
    const matchingPrefix = sortedPrefixes.find(p => cleanNumber.startsWith(p.prefix));
    
    if (matchingPrefix) {
      return {
        type: matchingPrefix.category,
        description: matchingPrefix.description,
        costPerMinute: matchingPrefix.costPerMinute
      };
    }
    
    return { 
      type: 'unknown', 
      description: 'Altro', 
      costPerMinute: 0 
    };
  }

  static parseDuration(duration: string): number {
    // Parse duration in format "HH:MM:SS" or "MM:SS" to seconds
    const cleanDuration = duration.replace(/"/g, '').trim();
    
    // Try different formats
    let parts: string[] = [];
    
    // Check for colon-separated format
    if (cleanDuration.includes(':')) {
      parts = cleanDuration.split(':');
    }
    // Check for dot-separated format (some CSV use dots)
    else if (cleanDuration.includes('.')) {
      parts = cleanDuration.split('.');
    }
    // Check for space-separated format
    else if (cleanDuration.includes(' ')) {
      parts = cleanDuration.split(' ');
    }
    // Single number might be seconds
    else if (cleanDuration && !isNaN(parseInt(cleanDuration))) {
      return parseInt(cleanDuration);
    }
    
    console.log('Duration parts:', parts, 'from:', cleanDuration);
    
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
    console.log('First few lines:', lines.slice(0, 10));
    
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
      
      let fields: string[] = [];
      
      // Try different CSV parsing approaches
      if (line.includes(',')) {
        fields = this.parseCSVLine(line, ',');
      } else if (line.includes(';')) {
        fields = this.parseCSVLine(line, ';');
      } else if (line.includes('\t')) {
        fields = line.split('\t');
      }
      
      console.log(`Line ${i} fields:`, fields);
      
      if (fields.length >= 3) {
        const cleanFields = fields.map(field => field.replace(/"/g, '').trim());
        
        // Try to identify fields more intelligently
        let timestamp = '';
        let date = '';
        let calledNumber = '';
        let callerNumber = '';
        let duration = '00:00:00';
        
        // Look for phone numbers (start with digits)
        const phoneFields = cleanFields.filter(field => /^\+?[0-9]/.test(field));
        const timeFields = cleanFields.filter(field => /[0-9]+[:\.][0-9]/.test(field) || /^[0-9]+$/.test(field));
        
        console.log('Phone fields:', phoneFields);
        console.log('Time fields:', timeFields);
        
        // Assign fields based on content
        if (phoneFields.length >= 1) {
          calledNumber = phoneFields[0];
          callerNumber = phoneFields[1] || phoneFields[0];
        }
        
        if (timeFields.length > 0) {
          // Look for duration field (usually the longest time field or contains colons/dots)
          duration = timeFields.find(t => t.includes(':') || t.includes('.')) || timeFields[timeFields.length - 1] || '0';
        }
        
        // Use first fields as timestamp/date if they look like dates/times
        timestamp = cleanFields[0] || '';
        date = cleanFields[1] || '';
        
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
          timestamp,
          date,
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
    
    // Group by caller
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

  static exportToPDF(summary: CallSummary[], callerAnalysis: CallerAnalysis[], fileName: string): string {
    // Return HTML that can be printed as PDF
    const totalCost = summary.reduce((sum, cat) => sum + (cat.cost || 0), 0);
    const totalCalls = summary.reduce((sum, cat) => sum + cat.count, 0);
    const totalDuration = summary.reduce((sum, cat) => sum + cat.totalSeconds, 0);
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Report Chiamate - ${fileName}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { margin-bottom: 30px; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .table th { background-color: #f2f2f2; }
        .total { font-weight: bold; background-color: #e8f4fd; }
        @media print { .no-print { display: none; } }
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
    
    <h2>Analisi per Chiamante</h2>
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
    
    <div class="no-print">
        <button onclick="window.print()">Stampa Report</button>
    </div>
</body>
</html>
    `;
  }
}
