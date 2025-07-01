
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, Printer, User } from 'lucide-react';
import { CallSummary, CallerAnalysis, CallRecord } from '@/types/call-analysis';
import { CallAnalyzer } from '@/utils/call-analyzer';

interface ExportPanelProps {
  records: CallRecord[];
  summary: CallSummary[];
  callerAnalysis: CallerAnalysis[];
  fileName: string;
}

const ExportPanel: React.FC<ExportPanelProps> = ({ 
  records, 
  summary, 
  callerAnalysis, 
  fileName 
}) => {
  const [selectedCaller, setSelectedCaller] = useState<string>('all');

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getFilteredData = () => {
    if (selectedCaller === 'all') {
      return { records, summary, callerAnalysis };
    }
    
    const filteredRecords = records.filter(r => r.callerNumber === selectedCaller);
    const filteredSummary = CallAnalyzer.generateSummary(filteredRecords);
    const filteredCallerAnalysis = callerAnalysis.filter(c => c.callerNumber === selectedCaller);
    
    return { 
      records: filteredRecords, 
      summary: filteredSummary, 
      callerAnalysis: filteredCallerAnalysis 
    };
  };

  const handleExportCSV = () => {
    const { records: filteredRecords, summary: filteredSummary, callerAnalysis: filteredCallerAnalysis } = getFilteredData();
    const csvContent = CallAnalyzer.exportToCSV(filteredRecords, filteredSummary, filteredCallerAnalysis);
    const timestamp = new Date().toISOString().split('T')[0];
    const suffix = selectedCaller === 'all' ? 'complete' : `caller-${selectedCaller}`;
    downloadFile(csvContent, `report-${fileName}-${suffix}-${timestamp}.csv`, 'text/csv');
  };

  const handleExportPDF = () => {
    const { summary: filteredSummary, callerAnalysis: filteredCallerAnalysis } = getFilteredData();
    const reportTitle = selectedCaller === 'all' ? fileName : `${fileName} - ${selectedCaller}`;
    const htmlContent = CallAnalyzer.exportToPDF(filteredSummary, filteredCallerAnalysis, reportTitle);
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
      setTimeout(() => {
        newWindow.print();
      }, 1000);
    }
  };

  const handleExportJSON = () => {
    const { records: filteredRecords, summary: filteredSummary, callerAnalysis: filteredCallerAnalysis } = getFilteredData();
    const exportData = {
      fileName,
      caller: selectedCaller,
      exportDate: new Date().toISOString(),
      summary: filteredSummary,
      callerAnalysis: filteredCallerAnalysis,
      records: filteredRecords.slice(0, 1000) // Limit to first 1000 records for JSON
    };
    
    const jsonContent = JSON.stringify(exportData, null, 2);
    const timestamp = new Date().toISOString().split('T')[0];
    const suffix = selectedCaller === 'all' ? 'complete' : `caller-${selectedCaller}`;
    downloadFile(jsonContent, `data-${fileName}-${suffix}-${timestamp}.json`, 'application/json');
  };

  const { summary: currentSummary } = getFilteredData();
  const totalCost = currentSummary.reduce((sum, cat) => sum + (cat.cost || 0), 0);
  const totalCalls = currentSummary.reduce((sum, cat) => sum + cat.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Download className="h-5 w-5" />
          <span>Esporta Report</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Filtra per Chiamante</label>
          <Select value={selectedCaller} onValueChange={setSelectedCaller}>
            <SelectTrigger>
              <SelectValue placeholder="Seleziona chiamante" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Tutti i chiamanti</span>
                </div>
              </SelectItem>
              {callerAnalysis.map((caller) => (
                <SelectItem key={caller.callerNumber} value={caller.callerNumber}>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{caller.callerNumber}</span>
                    <span className="text-xs text-gray-500">({caller.totalCalls} chiamate)</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">Totale Chiamate</p>
            <p className="text-xl font-bold">{totalCalls}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Costo Totale</p>
            <p className="text-xl font-bold text-green-600">€{totalCost.toFixed(2)}</p>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handleExportCSV} 
            className="w-full justify-start"
            variant="outline"
          >
            <FileText className="h-4 w-4 mr-2" />
            Esporta come CSV
            <span className="ml-auto text-xs text-gray-500">
              Excel/Calc compatibile
            </span>
          </Button>

          <Button 
            onClick={handleExportPDF} 
            className="w-full justify-start"
            variant="outline"
          >
            <Printer className="h-4 w-4 mr-2" />
            Genera Report PDF
            <span className="ml-auto text-xs text-gray-500">
              Pronto per la stampa
            </span>
          </Button>

          <Button 
            onClick={handleExportJSON} 
            className="w-full justify-start"
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            Esporta Dati JSON
            <span className="ml-auto text-xs text-gray-500">
              Formato tecnico
            </span>
          </Button>
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-gray-500">
            {selectedCaller === 'all' 
              ? 'I report includono riepilogo per categoria, analisi per chiamante e dettaglio completo delle chiamate.'
              : `Report per il chiamante ${selectedCaller} con analisi dettagliata delle sue chiamate.`
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportPanel;
