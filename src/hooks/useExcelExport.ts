import { useCallback } from 'react';
import * as XLSX from 'xlsx';
import { CallRecord, CallSummary, CallerAnalysis } from '@/types/call-analysis';
import { useToast } from './use-toast';

export const useExcelExport = () => {
  const { toast } = useToast();

  const exportToExcel = useCallback(async (
    records: CallRecord[],
    summary: CallSummary[],
    callerAnalysis: CallerAnalysis[],
    fileName: string
  ) => {
    try {
      // Create a new workbook
      const workbook = XLSX.utils.book_new();

      // Sheet 1: Summary
      const summaryData = summary.map(cat => ({
        'Categoria': cat.category,
        'Chiamate': cat.count,
        'Percentuale': `${((cat.count / records.length) * 100).toFixed(1)}%`,
        'Durata Totale': cat.formattedDuration,
        'Costo Totale': `€${cat.cost?.toFixed(2) || '0.00'}`,
        'Costo Medio': `€${cat.count > 0 ? ((cat.cost || 0) / cat.count).toFixed(3) : '0.000'}`,
        'Durata Media': cat.count > 0 ? formatDuration(Math.floor(cat.totalSeconds / cat.count)) : '00:00:00'
      }));

      // Add totals row
      const totalCost = summary.reduce((sum, cat) => sum + (cat.cost || 0), 0);
      const totalCalls = summary.reduce((sum, cat) => sum + cat.count, 0);
      const totalDuration = summary.reduce((sum, cat) => sum + cat.totalSeconds, 0);

      summaryData.push({
        'Categoria': 'TOTALE',
        'Chiamate': totalCalls,
        'Percentuale': '100.0%',
        'Durata Totale': formatDuration(totalDuration),
        'Costo Totale': `€${totalCost.toFixed(2)}`,
        'Costo Medio': `€${totalCalls > 0 ? (totalCost / totalCalls).toFixed(3) : '0.000'}`,
        'Durata Media': totalCalls > 0 ? formatDuration(Math.floor(totalDuration / totalCalls)) : '00:00:00'
      });

      const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Riepilogo');

      // Sheet 2: Caller Analysis
      const callerData = callerAnalysis.map(caller => {
        const totalCost = caller.categories.reduce((sum, cat) => sum + (cat.cost || 0), 0);
        return {
          'Numero Chiamante': caller.callerNumber,
          'Totale Chiamate': caller.totalCalls,
          'Durata Totale': caller.formattedTotalDuration,
          'Costo Totale': `€${totalCost.toFixed(2)}`,
          'Costo Medio': `€${(totalCost / caller.totalCalls).toFixed(3)}`,
          'Durata Media': formatDuration(Math.floor(caller.totalDuration / caller.totalCalls))
        };
      });

      const callerWorksheet = XLSX.utils.json_to_sheet(callerData);
      XLSX.utils.book_append_sheet(workbook, callerWorksheet, 'Analisi Chiamanti');

      // Sheet 3: Hourly Distribution
      const hourlyData = generateHourlyData(records);
      const hourlyWorksheet = XLSX.utils.json_to_sheet(hourlyData);
      XLSX.utils.book_append_sheet(workbook, hourlyWorksheet, 'Distribuzione Oraria');

      // Sheet 4: Top Numbers
      const topNumbersData = generateTopNumbersData(records);
      const topNumbersWorksheet = XLSX.utils.json_to_sheet(topNumbersData);
      XLSX.utils.book_append_sheet(workbook, topNumbersWorksheet, 'Top Numeri');

      // Sheet 5: All Records (limited to 10000 for performance)
      if (records.length <= 10000) {
        const recordsData = records.map(record => ({
          'Data': record.date,
          'Ora': record.timestamp,
          'Chiamante': record.callerNumber,
          'Chiamato': record.calledNumber,
          'Durata': record.duration,
          'Durata (secondi)': record.durationSeconds,
          'Categoria': record.category.description,
          'Costo': `€${record.cost?.toFixed(2) || '0.00'}`
        }));

        const recordsWorksheet = XLSX.utils.json_to_sheet(recordsData);
        XLSX.utils.book_append_sheet(workbook, recordsWorksheet, 'Dettaglio Chiamate');
      }

      // Generate and download the Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName.replace('.csv', '')}_analisi_completa.xlsx`;
      link.click();
      
      URL.revokeObjectURL(url);

      toast({
        title: "Export Excel completato",
        description: `File ${link.download} scaricato con successo.`
      });

    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast({
        title: "Errore nell'export Excel",
        description: "Si è verificato un errore durante l'export.",
        variant: "destructive"
      });
    }
  }, [toast]);

  return { exportToExcel };
};

// Utility functions
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const generateHourlyData = (records: CallRecord[]) => {
  const hourCounts = new Array(24).fill(0).map((_, hour) => ({
    'Ora': `${hour.toString().padStart(2, '0')}:00`,
    'Chiamate': 0,
    'Costo Totale': 0,
    'Durata Totale (min)': 0
  }));

  records.forEach(record => {
    if (record.timestamp) {
      const timeParts = record.timestamp.split(':');
      if (timeParts.length >= 1) {
        const hour = parseInt(timeParts[0]);
        if (hour >= 0 && hour < 24) {
          hourCounts[hour]['Chiamate']++;
          hourCounts[hour]['Costo Totale'] += record.cost || 0;
          hourCounts[hour]['Durata Totale (min)'] += Math.floor(record.durationSeconds / 60);
        }
      }
    }
  });

  return hourCounts.map(hour => ({
    ...hour,
    'Costo Totale': `€${hour['Costo Totale'].toFixed(2)}`,
    'Percentuale Chiamate': `${((hour['Chiamate'] / records.length) * 100).toFixed(1)}%`
  }));
};

const generateTopNumbersData = (records: CallRecord[]) => {
  const numberMap = new Map();
  
  records.forEach(record => {
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

  return Array.from(numberMap.values())
    .sort((a, b) => b.callCount - a.callCount)
    .slice(0, 50)
    .map(item => ({
      'Numero': item.number,
      'Categoria': item.category,
      'Chiamate': item.callCount,
      'Durata Totale': formatDuration(item.totalDuration),
      'Costo Totale': `€${item.totalCost.toFixed(2)}`,
      'Chiamanti Unici': item.callers.length,
      'Costo Medio': `€${(item.totalCost / item.callCount).toFixed(3)}`,
      'Durata Media': formatDuration(Math.floor(item.totalDuration / item.callCount))
    }));
};