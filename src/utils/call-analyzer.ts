import { CallRecord, CallCategory, CallSummary, CallerAnalysis, PrefixConfig } from '@/types/call-analysis';

export class CallAnalyzer {
  static defaultPrefixConfig: PrefixConfig[] = [
    // Prefissi fissi italiani - SPECIFICI PRIMA (3 cifre)
    { prefix: '010', category: 'landline', description: 'Fisso Genova', costPerMinute: 0.03 },
    { prefix: '011', category: 'landline', description: 'Fisso Torino', costPerMinute: 0.03 },
    { prefix: '02', category: 'landline', description: 'Fisso Milano', costPerMinute: 0.03 },
    { prefix: '06', category: 'landline', description: 'Fisso Roma', costPerMinute: 0.03 },
    { prefix: '051', category: 'landline', description: 'Fisso Bologna', costPerMinute: 0.03 },
    { prefix: '055', category: 'landline', description: 'Fisso Firenze', costPerMinute: 0.03 },
    { prefix: '081', category: 'landline', description: 'Fisso Napoli', costPerMinute: 0.03 },
    { prefix: '091', category: 'landline', description: 'Fisso Palermo', costPerMinute: 0.03 },
    { prefix: '040', category: 'landline', description: 'Fisso Trieste', costPerMinute: 0.03 },
    { prefix: '045', category: 'landline', description: 'Fisso Verona', costPerMinute: 0.03 },
    { prefix: '049', category: 'landline', description: 'Fisso Padova', costPerMinute: 0.03 },
    { prefix: '0', category: 'landline', description: 'Fisso', costPerMinute: 0.05 },
    
    // Numeri speciali italiani - SPECIFICI PRIMA
    { prefix: '800', category: 'special', description: 'Numero Verde', costPerMinute: 0.00 },
    { prefix: '803', category: 'special', description: 'Numero Verde', costPerMinute: 0.00 },
    { prefix: '199', category: 'special', description: 'Numero Premium', costPerMinute: 0.90 },
    { prefix: '899', category: 'special', description: 'Numero Premium', costPerMinute: 0.90 },
    { prefix: '190', category: 'special', description: 'Assistenza Provider', costPerMinute: 0.00 },
    { prefix: '191', category: 'special', description: 'Assistenza Provider', costPerMinute: 0.00 },
    { prefix: '192', category: 'special', description: 'Assistenza Provider', costPerMinute: 0.00 },
    { prefix: '187', category: 'special', description: 'Assistenza Provider', costPerMinute: 0.00 },
    { prefix: '188', category: 'special', description: 'Assistenza Provider', costPerMinute: 0.00 },
    
    // Mobile TIM - prefissi 3 cifre PRIMA
    { prefix: '330', category: 'mobile', description: 'Mobile TIM', costPerMinute: 0.15 },
    { prefix: '331', category: 'mobile', description: 'Mobile TIM', costPerMinute: 0.15 },
    { prefix: '333', category: 'mobile', description: 'Mobile TIM', costPerMinute: 0.15 },
    { prefix: '334', category: 'mobile', description: 'Mobile TIM', costPerMinute: 0.15 },
    { prefix: '335', category: 'mobile', description: 'Mobile TIM', costPerMinute: 0.15 },
    { prefix: '336', category: 'mobile', description: 'Mobile TIM', costPerMinute: 0.15 },
    { prefix: '337', category: 'mobile', description: 'Mobile TIM', costPerMinute: 0.15 },
    { prefix: '338', category: 'mobile', description: 'Mobile TIM', costPerMinute: 0.15 },
    { prefix: '339', category: 'mobile', description: 'Mobile TIM', costPerMinute: 0.15 },
    { prefix: '340', category: 'mobile', description: 'Mobile TIM', costPerMinute: 0.15 },
    { prefix: '341', category: 'mobile', description: 'Mobile TIM', costPerMinute: 0.15 },
    { prefix: '342', category: 'mobile', description: 'Mobile TIM', costPerMinute: 0.15 },
    { prefix: '343', category: 'mobile', description: 'Mobile TIM', costPerMinute: 0.15 },
    { prefix: '344', category: 'mobile', description: 'Mobile TIM', costPerMinute: 0.15 },
    { prefix: '345', category: 'mobile', description: 'Mobile TIM', costPerMinute: 0.15 },
    { prefix: '346', category: 'mobile', description: 'Mobile TIM', costPerMinute: 0.15 },
    { prefix: '347', category: 'mobile', description: 'Mobile TIM', costPerMinute: 0.15 },
    { prefix: '348', category: 'mobile', description: 'Mobile TIM', costPerMinute: 0.15 },
    { prefix: '349', category: 'mobile', description: 'Mobile TIM', costPerMinute: 0.15 },
    
    // Mobile Vodafone - prefissi 3 cifre
    { prefix: '350', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '351', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '352', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '353', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '354', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '355', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '356', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '357', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '358', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '359', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '360', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '361', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '362', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '363', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '364', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '365', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '366', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '367', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '368', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '369', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '380', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '383', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '388', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    { prefix: '389', category: 'mobile', description: 'Mobile Vodafone', costPerMinute: 0.15 },
    
    // Mobile Wind - prefissi 3 cifre
    { prefix: '320', category: 'mobile', description: 'Mobile Wind', costPerMinute: 0.15 },
    { prefix: '321', category: 'mobile', description: 'Mobile Wind', costPerMinute: 0.15 },
    { prefix: '322', category: 'mobile', description: 'Mobile Wind', costPerMinute: 0.15 },
    { prefix: '323', category: 'mobile', description: 'Mobile Wind', costPerMinute: 0.15 },
    { prefix: '324', category: 'mobile', description: 'Mobile Wind', costPerMinute: 0.15 },
    { prefix: '327', category: 'mobile', description: 'Mobile Wind', costPerMinute: 0.15 },
    { prefix: '328', category: 'mobile', description: 'Mobile Wind', costPerMinute: 0.15 },
    { prefix: '329', category: 'mobile', description: 'Mobile Wind', costPerMinute: 0.15 },
    { prefix: '390', category: 'mobile', description: 'Mobile Wind', costPerMinute: 0.15 },
    { prefix: '391', category: 'mobile', description: 'Mobile Wind', costPerMinute: 0.15 },
    { prefix: '392', category: 'mobile', description: 'Mobile Wind', costPerMinute: 0.15 },
    { prefix: '393', category: 'mobile', description: 'Mobile Wind', costPerMinute: 0.15 },
    { prefix: '394', category: 'mobile', description: 'Mobile Wind', costPerMinute: 0.15 },
    { prefix: '395', category: 'mobile', description: 'Mobile Wind', costPerMinute: 0.15 },
    { prefix: '396', category: 'mobile', description: 'Mobile Wind', costPerMinute: 0.15 },
    { prefix: '397', category: 'mobile', description: 'Mobile Wind', costPerMinute: 0.15 },
    { prefix: '398', category: 'mobile', description: 'Mobile Wind', costPerMinute: 0.15 },
    { prefix: '399', category: 'mobile', description: 'Mobile Wind', costPerMinute: 0.15 },
    
    // Prefissi generici ALLA FINE (solo 1 cifra)
    { prefix: '1', category: 'special', description: 'Numero Speciale', costPerMinute: 0.50 },
    { prefix: '3', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    { prefix: '7', category: 'mobile', description: 'Mobile', costPerMinute: 0.15 },
    
    // Prefissi internazionali
    { prefix: '+1', category: 'special', description: 'USA/Canada', costPerMinute: 0.25 },
    { prefix: '+44', category: 'special', description: 'Regno Unito', costPerMinute: 0.20 },
    { prefix: '+33', category: 'special', description: 'Francia', costPerMinute: 0.18 },
    { prefix: '+49', category: 'special', description: 'Germania', costPerMinute: 0.18 },
    { prefix: '+34', category: 'special', description: 'Spagna', costPerMinute: 0.18 },
    { prefix: '+41', category: 'special', description: 'Svizzera', costPerMinute: 0.30 },
    { prefix: '+43', category: 'special', description: 'Austria', costPerMinute: 0.22 },
    { prefix: '+86', category: 'special', description: 'Cina', costPerMinute: 0.35 },
    { prefix: '+81', category: 'special', description: 'Giappone', costPerMinute: 0.40 },
    { prefix: '+91', category: 'special', description: 'India', costPerMinute: 0.30 },
    { prefix: '+55', category: 'special', description: 'Brasile', costPerMinute: 0.28 },
    { prefix: '+7', category: 'special', description: 'Russia', costPerMinute: 0.35 }
  ];

  static categorizeNumber(number: string, prefixConfig: PrefixConfig[] = this.defaultPrefixConfig): CallCategory & { costPerMinute: number } {
    // Clean number: remove spaces, #, and other non-numeric characters except + for international
    const cleanNumber = number.replace(/[^+0-9]/g, '');
    
    console.log('=== CATEGORIZING NUMBER ===');
    console.log('Original number:', number);
    console.log('Cleaned number:', cleanNumber);
    
    // Check if this looks like a phone number
    if (!cleanNumber || cleanNumber.length < 3) {
      console.log('❌ Not a valid phone number:', cleanNumber);
      return { 
        type: 'unknown', 
        description: 'Altro', 
        costPerMinute: 0 
      };
    }

    // Handle international numbers (not Italian)
    if (cleanNumber.startsWith('+') && !cleanNumber.startsWith('+39')) {
      console.log('🌍 International number detected:', cleanNumber);
      
      // Check other international prefixes - sort by length desc to match longest first
      const sortedIntlPrefixes = prefixConfig
        .filter(p => p.prefix.startsWith('+') && p.prefix !== '+39')
        .sort((a, b) => b.prefix.length - a.prefix.length);
      
      const matchingPrefix = sortedIntlPrefixes.find(p => cleanNumber.startsWith(p.prefix));
      
      if (matchingPrefix) {
        console.log('✅ Found matching international prefix:', matchingPrefix.prefix, '→', matchingPrefix.description);
        return {
          type: matchingPrefix.category,
          description: matchingPrefix.description,
          costPerMinute: matchingPrefix.costPerMinute
        };
      }
      
      console.log('❓ Unknown international number:', cleanNumber);
      return { 
        type: 'unknown', 
        description: 'Internazionale Sconosciuto', 
        costPerMinute: 0.50 
      };
    }

    // Handle Italian numbers - SEMPRE rimuovi il prefisso 39
    let numberToAnalyze = cleanNumber;
    
    // Rimuovi SEMPRE il prefisso 39 se presente (con o senza +)
    if (cleanNumber.startsWith('+39')) {
      numberToAnalyze = cleanNumber.substring(3);
      console.log('🇮🇹 Removed +39 prefix, analyzing:', numberToAnalyze);
    } else if (cleanNumber.startsWith('39') && cleanNumber.length >= 8) {
      numberToAnalyze = cleanNumber.substring(2);
      console.log('🇮🇹 Removed 39 prefix, analyzing:', numberToAnalyze);
    } else if (cleanNumber.startsWith('0039')) {
      numberToAnalyze = cleanNumber.substring(4);
      console.log('🇮🇹 Removed 0039 prefix, analyzing:', numberToAnalyze);
    }

    // Now analyze the Italian number
    return this.categorizeItalianNumber(numberToAnalyze, prefixConfig);
  }

  static categorizeItalianNumber(number: string, prefixConfig: PrefixConfig[]): CallCategory & { costPerMinute: number } {
    console.log('🔍 Analyzing Italian number:', number);
    
    if (!number || number.length < 3) {
      console.log('❌ Italian number too short:', number);
      return { 
        type: 'unknown', 
        description: 'Altro', 
        costPerMinute: 0 
      };
    }

    // Filtra solo i prefissi italiani (no +) e ordina per lunghezza (più lunghi prima)
    const sortedPrefixes = prefixConfig
      .filter(p => !p.prefix.startsWith('+'))
      .sort((a, b) => b.prefix.length - a.prefix.length);

    console.log('🔄 Checking prefixes in order (longest first):');

    // Check each prefix in order (longest first to avoid false matches)
    for (const prefixConf of sortedPrefixes) {
      if (number.startsWith(prefixConf.prefix)) {
        console.log('✅ MATCH FOUND:', prefixConf.prefix, '→', prefixConf.description);
        return {
          type: prefixConf.category,
          description: prefixConf.description,
          costPerMinute: prefixConf.costPerMinute
        };
      } else {
        console.log('❌ No match for prefix:', prefixConf.prefix);
      }
    }

    console.log('❓ No matching Italian prefix for:', number);
    return { 
      type: 'unknown', 
      description: 'Altro', 
      costPerMinute: 0 
    };
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
