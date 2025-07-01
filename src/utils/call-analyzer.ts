
import { CallRecord, CallCategory, CallSummary, CallerAnalysis } from '@/types/call-analysis';

export class CallAnalyzer {
  static categorizeNumber(number: string): CallCategory {
    // Remove Italian prefix +39 if present
    const cleanNumber = number.replace(/^(\+39|0039|39)/, '');
    
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
    // Parse duration in format "HH:MM:SS" to seconds
    const parts = duration.split(':');
    if (parts.length === 3) {
      const hours = parseInt(parts[0]) || 0;
      const minutes = parseInt(parts[1]) || 0;
      const seconds = parseInt(parts[2]) || 0;
      return hours * 3600 + minutes * 60 + seconds;
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
    const lines = csvContent.split('\n');
    const records: CallRecord[] = [];
    
    // Skip header if present
    const startIndex = lines[0].includes('Ora') || lines[0].includes('Data') ? 1 : 0;
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const fields = line.split(',');
      if (fields.length >= 6) {
        const calledNumber = fields[2]?.replace(/"/g, '') || '';
        const category = this.categorizeNumber(calledNumber);
        const duration = fields[5]?.replace(/"/g, '') || '00:00:00';
        
        records.push({
          id: `${i}-${Date.now()}`,
          timestamp: fields[0]?.replace(/"/g, '') || '',
          date: fields[1]?.replace(/"/g, '') || '',
          callerNumber: fields[3]?.replace(/"/g, '') || '',
          calledNumber,
          duration,
          durationSeconds: this.parseDuration(duration),
          category
        });
      }
    }
    
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
