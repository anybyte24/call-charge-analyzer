
export interface CallRecord {
  id: string;
  timestamp: string;
  date: string;
  callerNumber: string;
  calledNumber: string;
  duration: string;
  durationSeconds: number;
  category: CallCategory;
  cost?: number;
}

export interface CallCategory {
  type: 'mobile' | 'landline' | 'special' | 'international' | 'unknown';
  description: string;
}

export interface CallSummary {
  category: string;
  count: number;
  totalSeconds: number;
  totalMinutes: number;
  totalHours: number;
  formattedDuration: string;
  cost?: number;
}

export interface CallerAnalysis {
  callerNumber: string;
  totalCalls: number;
  categories: CallSummary[];
  totalDuration: number;
  formattedTotalDuration: string;
}

export interface AnalysisSession {
  id: string;
  fileName: string;
  uploadDate: string;
  totalRecords: number;
  summary: CallSummary[];
  callerAnalysis: CallerAnalysis[];
  prefixConfig?: PrefixConfig[];
}

export interface PrefixConfig {
  prefix: string;
  category: 'mobile' | 'landline' | 'special' | 'international' | 'unknown';
  description: string;
  costPerMinute: number;
}
