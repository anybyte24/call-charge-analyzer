import { CallRecord, CallCategory, CallSummary, CallerAnalysis } from '@/types/call-analysis';

export class CallAnalyzer {
  static categorizeNumber(number: string): CallCategory {
    // Remove Italian prefix +39 if present and clean the number
    const cleanNumber = number.replace(/^(\+39|0039|39)/, '').replace(/\s+/g, '');
    
    console.log('Categorizing number:', number, 'cleaned:', cleanNumber);
    
    if (cleanNumber.startsWith('3') || cleanNumber.startsWith('7')) {
      return { type: 'mobile', description: 'Mobile' };
    } else if (cleanNumber.startsWith('0')) {
      return { type: 'landline', description: 'Fisso' };
    } else if (cleanNumber.startsWith('199') || cleanNumber.startsWith('899') || 
               cleanNumber.startsWith('166') || cleanNumber.startsWith('144')) {
      return { type: 'special', description: 'Numero Speciale' };
    }
    
    return { type: 'unknown', description: 'Altro' };
  }

  static parseDuration(duration: string): number {
    // Parse duration in format "HH:MM:SS" or "MM:SS" to seconds
    const cleanDuration = duration.replace(/"/g, '').trim();
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
    return 0;
  }

  static formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  static parseCSV(csvContent: string): CallRecord[] {
    console.log('Starting CSV parse, content length:', csvContent.length);
    
    const lines = csvContent.split('\n');
    const records: CallRecord[] = [];
    
    console.log('Total lines:', lines.length);
    console.log('First few lines:', lines.slice(0, 5));
    
    // Skip header if present - look for common CSV headers
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
      
      // Try different CSV parsing approaches
      let fields: string[] = [];
      
      // First try: split by comma (standard CSV)
      if (line.includes(',')) {
        fields = line.split(',');
      } 
      // Second try: split by semicolon (European CSV)
      else if (line.includes(';')) {
        fields = line.split(';');
      }
      // Third try: split by tab
      else if (line.includes('\t')) {
        fields = line.split('\t');
      }
      
      console.log(`Line ${i} fields:`, fields);
      
      if (fields.length >= 4) {
        // Clean fields from quotes
        const cleanFields = fields.map(field => field.replace(/"/g, '').trim());
        
        // Try to identify the structure - adapt based on your CSV format
        let timestamp = '';
        let date = '';
        let calledNumber = '';
        let callerNumber = '';
        let duration = '00:00:00';
        
        // Flexible parsing based on field count and content
        if (cleanFields.length >= 6) {
          // Standard format: timestamp, date, called, caller, ?, duration
          timestamp = cleanFields[0] || '';
          date = cleanFields[1] || '';
          calledNumber = cleanFields[2] || '';
          callerNumber = cleanFields[3] || '';
          duration = cleanFields[5] || '00:00:00';
        } else if (cleanFields.length >= 4) {
          // Simplified format: try to identify fields
          timestamp = cleanFields[0] || '';
          date = cleanFields[1] || '';
          calledNumber = cleanFields[2] || '';
          duration = cleanFields[3] || '00:00:00';
          callerNumber = cleanFields[2] || ''; // Use called as caller if not available
        }
        
        const category = this.categorizeNumber(calledNumber);
        const durationSeconds = this.parseDuration(duration);
        
        console.log('Parsed record:', {
          calledNumber,
          callerNumber,
          duration,
          durationSeconds,
          category
        });
        
        records.push({
          id: `${i}-${Date.now()}`,
          timestamp,
          date,
          callerNumber,
          calledNumber,
          duration,
          durationSeconds,
          category
        });
      }
    }
    
    console.log('Total records parsed:', records.length);
    return records;
  }

  static generateSummary(records: CallRecord[]): CallSummary[] {
    const categoryMap = new Map<string, CallSummary>();
    
    records.forEach(record => {
      const key = record.category.type;
      const existing = categoryMap.get(key);
      
      if (existing) {
        existing.count++;
        existing.totalSeconds += record.durationSeconds;
      } else {
        categoryMap.set(key, {
          category: record.category.description,
          count: 1,
          totalSeconds: record.durationSeconds,
          totalMinutes: 0,
          totalHours: 0,
          formattedDuration: ''
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
}
