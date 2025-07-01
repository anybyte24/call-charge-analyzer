
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileText, Printer, User, List, BarChart, Database } from 'lucide-react';
import { CallSummary, CallerAnalysis, CallRecord } from '@/types/call-analysis';
import { CallAnalyzer } from '@/utils/call-analyzer';

interface ExportPanelProps {
  records: CallRecord[];
  summary: CallSummary[];
  callerAnalysis: CallerAnalysis[];
  fileName: string;
}

type ExportType = 'summary' | 'details' | 'calls' | 'complete';

const ExportPanel: React.FC<ExportPanelProps> = ({ 
  records, 
  summary, 
  callerAnalysis, 
  fileName 
}) => {
  const [selectedCaller, setSelectedCaller] = useState<string>('all');
  const [exportType, setExportType] = useState<ExportType>('complete');
  const [groupByCategory, setGroupByCategory] = useState<boolean>(false);

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

  const generateCustomCSV = () => {
    const { records: filteredRecords, summary: filteredSummary, callerAnalysis: filteredCallerAnalysis } = getFilteredData();
    let csv = '';

    // Include summary
    if (exportType === 'summary' || exportType === 'complete') {
      csv += 'RIEPILOGO GENERALE\n';
      csv += 'Categoria,Chiamate,Durata,Costo\n';
      
      filteredSummary.forEach(cat => {
        csv += `${cat.category},${cat.count},${cat.formattedDuration},€${cat.cost?.toFixed(2) || '0.00'}\n`;
      });
    }

    // Include caller analysis
    if (exportType === 'details' || exportType === 'complete') {
      if (csv) csv += '\n\n';
      
      csv += 'ANALISI PER CHIAMANTE\n';
      csv += 'Numero Chiamante,Totale Chiamate,Durata Totale,Costo Totale\n';
      
      filteredCallerAnalysis.forEach(caller => {
        const totalCost = caller.categories.reduce((sum, cat) => sum + (cat.cost || 0), 0);
        csv += `${caller.callerNumber},${caller.totalCalls},${caller.formattedTotalDuration},€${totalCost.toFixed(2)}\n`;
      });
    }

    // SEMPRE includere le chiamate singole (anche per summary e details)
    if (csv) csv += '\n\n';
    
    if (groupByCategory && selectedCaller !== 'all') {
      // Group calls by category for single caller
      const categories = [...new Set(filteredRecords.map(r => r.category.description))];
      
      categories.forEach(category => {
        const categoryRecords = filteredRecords.filter(r => r.category.description === category);
        csv += `CHIAMATE ${category.toUpperCase()}\n`;
        csv += 'Data,Ora,Chiamante,Chiamato,Durata,Costo\n';
        
        categoryRecords.forEach(record => {
          csv += `${record.date},${record.timestamp},${record.callerNumber},${record.calledNumber},${record.duration},€${record.cost?.toFixed(2) || '0.00'}\n`;
        });
        csv += '\n';
      });
    } else {
      csv += 'DETTAGLIO TUTTE LE CHIAMATE\n';
      csv += 'Data,Ora,Chiamante,Chiamato,Durata,Categoria,Costo\n';
      
      // Ordina le chiamate per data e ora
      const sortedRecords = [...filteredRecords].sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.timestamp}`);
        const dateB = new Date(`${b.date} ${b.timestamp}`);
        return dateA.getTime() - dateB.getTime();
      });
      
      sortedRecords.forEach(record => {
        csv += `${record.date},${record.timestamp},${record.callerNumber},${record.calledNumber},${record.duration},${record.category.description},€${record.cost?.toFixed(2) || '0.00'}\n`;
      });
    }

    console.log('Generated CSV with all calls:', csv);
    return csv;
  };

  const handleExportCSV = () => {
    const csvContent = generateCustomCSV();
    const timestamp = new Date().toISOString().split('T')[0];
    const suffix = selectedCaller === 'all' ? 'complete' : `caller-${selectedCaller}`;
    const typeStr = exportType;
    downloadFile(csvContent, `report-${fileName}-${suffix}-${typeStr}-${timestamp}.csv`, 'text/csv');
  };

  const handleExportPDF = () => {
    const { records: filteredRecords, summary: filteredSummary, callerAnalysis: filteredCallerAnalysis } = getFilteredData();
    const reportTitle = selectedCaller === 'all' ? fileName : `${fileName} - ${selectedCaller}`;
    
    // Passa anche le chiamate filtrate al PDF
    const htmlContent = CallAnalyzer.exportToPDF(filteredSummary, filteredCallerAnalysis, reportTitle, filteredRecords);
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
    
    // Ordina le chiamate per data e ora
    const sortedRecords = [...filteredRecords].sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.timestamp}`);
      const dateB = new Date(`${b.date} ${b.timestamp}`);
      return dateA.getTime() - dateB.getTime();
    });
    
    const exportData = {
      fileName,
      caller: selectedCaller,
      exportType,
      exportDate: new Date().toISOString(),
      summary: filteredSummary,
      callerAnalysis: filteredCallerAnalysis,
      totalRecords: sortedRecords.length,
      allCalls: sortedRecords // SEMPRE includere tutte le chiamate
    };
    
    const jsonContent = JSON.stringify(exportData, null, 2);
    const timestamp = new Date().toISOString().split('T')[0];
    const suffix = selectedCaller === 'all' ? 'complete' : `caller-${selectedCaller}`;
    const typeStr = exportType;
    downloadFile(jsonContent, `data-${fileName}-${suffix}-${typeStr}-${timestamp}.json`, 'application/json');
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

        <div>
          <label className="text-sm font-medium mb-2 block">Tipo di Export</label>
          <Select value={exportType} onValueChange={(value: ExportType) => setExportType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="summary">
                <div className="flex items-center space-x-2">
                  <BarChart className="h-4 w-4" />
                  <span>Solo Riepilogo</span>
                </div>
              </SelectItem>
              <SelectItem value="details">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Solo Analisi Chiamanti</span>
                </div>
              </SelectItem>
              <SelectItem value="calls">
                <div className="flex items-center space-x-2">
                  <List className="h-4 w-4" />
                  <span>Solo Dettaglio Chiamate</span>
                </div>
              </SelectItem>
              <SelectItem value="complete">
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4" />
                  <span>Report Completo</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedCaller !== 'all' && (exportType === 'calls' || exportType === 'complete') && (
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="groupByCategory" 
              checked={groupByCategory} 
              onCheckedChange={(checked) => setGroupByCategory(checked === true)}
            />
            <label htmlFor="groupByCategory" className="text-sm">
              Raggruppa chiamate per categoria
            </label>
          </div>
        )}

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
              {exportType === 'summary' ? 'Solo riepilogo' : 
               exportType === 'details' ? 'Solo chiamanti' : 
               exportType === 'calls' ? 'Solo chiamate' : 'Completo'}
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
              ? `Export ${exportType === 'summary' ? 'riepilogo generale' : 
                        exportType === 'details' ? 'analisi chiamanti' : 
                        exportType === 'calls' ? 'dettaglio chiamate' : 'completo'} per tutti i chiamanti.`
              : `Export ${exportType === 'summary' ? 'riepilogo' : 
                        exportType === 'details' ? 'analisi chiamanti' : 
                        exportType === 'calls' ? 'dettaglio chiamate' : 'completo'} per ${selectedCaller}${groupByCategory && (exportType === 'calls' || exportType === 'complete') ? ' raggruppato per categoria' : ''}.`
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportPanel;
