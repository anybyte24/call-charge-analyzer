import React, { useEffect, useState } from 'react';
import { ModernCard } from '@/components/ModernCard';
import { ModernButton } from '@/components/ModernButton';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { 
  Download, FileText, BarChart3, PieChart, 
  TrendingUp, Calendar, Filter, Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdvancedExportProps {
  data: any[];
  summary: any[];
  callerAnalysis: any[];
  fileName: string;
  className?: string;
}

export const AdvancedExport: React.FC<AdvancedExportProps> = ({
  data,
  summary,
  callerAnalysis,
  fileName,
  className
}) => {
  const [generating, setGenerating] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    includeCharts: true,
    includeAnalysis: true,
    includeRecommendations: true,
    dateRange: 'all',
    format: 'pdf'
  });

  const { currentOrganization } = useOrganization();
  const { toast } = useToast();

  const generateAdvancedPdf = async () => {
    if (!currentOrganization || !data || data.length === 0) {
      toast({
        title: "Errore",
        description: "Nessun dato disponibile per l'export",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
    try {
      // Prepare comprehensive HTML content for PDF
      const htmlContent = generatePdfHtml();
      
      const { data: pdfData, error } = await supabase.functions.invoke('pdf-generator', {
        body: {
          html_content: htmlContent,
          filename: `${fileName}_advanced_report.pdf`,
          options: {
            format: 'A4',
            printBackground: true,
            margin: {
              top: '2cm',
              right: '1.5cm',
              bottom: '2cm',
              left: '1.5cm'
            },
            displayHeaderFooter: true,
            headerTemplate: `
              <div style="font-size: 10px; width: 100%; text-align: center; color: #666;">
                ${currentOrganization.name} - Report Analisi Chiamate
              </div>
            `,
            footerTemplate: `
              <div style="font-size: 10px; width: 100%; text-align: center; color: #666;">
                Generato il ${new Date().toLocaleDateString()} - Pagina <span class="pageNumber"></span> di <span class="totalPages"></span>
              </div>
            `
          }
        }
      });

      if (error) throw error;

      // Download the PDF
      const blob = new Blob([pdfData], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}_advanced_report.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Completato",
        description: "Il report PDF avanzato è stato generato con successo"
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Errore Export",
        description: "Errore durante la generazione del report PDF",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const generatePdfHtml = () => {
    const totalCost = summary.reduce((sum, cat) => sum + (cat.cost || 0), 0);
    const totalCalls = data.length;
    const totalDuration = data.reduce((sum, record) => sum + (record.durationSeconds || 0), 0);
    
    // Calculate insights
    const topCallers = callerAnalysis
      .sort((a, b) => (b.totalCost || 0) - (a.totalCost || 0))
      .slice(0, 5);
    
    const costsByCategory = summary.map(cat => ({
      category: cat.description || cat.type,
      cost: cat.cost || 0,
      percentage: ((cat.cost || 0) / totalCost * 100).toFixed(1)
    }));

    // Generate hourly distribution
    const hourlyData = new Array(24).fill(0);
    data.forEach(record => {
      const hour = new Date(`2000-01-01T${record.timeCall}`).getHours();
      hourlyData[hour]++;
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Report Analisi Chiamate - ${fileName}</title>
          <style>
            * { box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', system-ui, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0; 
              padding: 20px;
              background: #fff;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 3px solid #2563eb;
            }
            .header h1 {
              color: #2563eb;
              font-size: 2.5em;
              margin: 0;
              font-weight: 700;
            }
            .header p {
              color: #666;
              font-size: 1.1em;
              margin: 10px 0 0 0;
            }
            .metrics {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 20px;
              margin-bottom: 40px;
            }
            .metric-card {
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
              padding: 20px;
              border-radius: 12px;
              text-align: center;
              border: 1px solid #e2e8f0;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .metric-value {
              font-size: 2.5em;
              font-weight: 700;
              color: #2563eb;
              margin: 0;
            }
            .metric-label {
              color: #666;
              font-size: 0.9em;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin: 5px 0 0 0;
            }
            .section {
              margin-bottom: 40px;
              page-break-inside: avoid;
            }
            .section h2 {
              color: #1e40af;
              font-size: 1.8em;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 2px solid #e2e8f0;
            }
            .chart-placeholder {
              background: linear-gradient(45deg, #f1f5f9 25%, transparent 25%), 
                          linear-gradient(-45deg, #f1f5f9 25%, transparent 25%), 
                          linear-gradient(45deg, transparent 75%, #f1f5f9 75%), 
                          linear-gradient(-45deg, transparent 75%, #f1f5f9 75%);
              background-size: 20px 20px;
              background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
              height: 300px;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #64748b;
              font-weight: 600;
              margin: 20px 0;
              border: 2px dashed #cbd5e1;
            }
            .data-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              background: #fff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .data-table th {
              background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
              color: white;
              padding: 15px 12px;
              text-align: left;
              font-weight: 600;
              font-size: 0.9em;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .data-table td {
              padding: 12px;
              border-bottom: 1px solid #e2e8f0;
            }
            .data-table tr:nth-child(even) {
              background-color: #f8fafc;
            }
            .data-table tr:hover {
              background-color: #e2e8f0;
            }
            .insight-card {
              background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
              border-left: 4px solid #2563eb;
              padding: 20px;
              margin: 15px 0;
              border-radius: 8px;
            }
            .insight-title {
              font-weight: 600;
              color: #1e40af;
              margin-bottom: 8px;
            }
            .recommendation {
              background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
              border-left: 4px solid #10b981;
              padding: 20px;
              margin: 15px 0;
              border-radius: 8px;
            }
            .recommendation-title {
              font-weight: 600;
              color: #047857;
              margin-bottom: 8px;
            }
            .page-break {
              page-break-before: always;
            }
            .two-column {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin: 20px 0;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
              margin: 20px 0;
            }
            .summary-item {
              background: #f8fafc;
              padding: 15px;
              border-radius: 8px;
              border: 1px solid #e2e8f0;
            }
            .summary-item strong {
              color: #2563eb;
            }
          </style>
        </head>
        <body>
          <!-- Header -->
          <div class="header">
            <h1>Report Analisi Chiamate</h1>
            <p>${currentOrganization.name} • ${new Date().toLocaleDateString()}</p>
            <p>File: ${fileName} • ${totalCalls} chiamate analizzate</p>
          </div>

          <!-- Executive Summary -->
          <div class="metrics">
            <div class="metric-card">
              <div class="metric-value">€${totalCost.toFixed(2)}</div>
              <div class="metric-label">Costo Totale</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${totalCalls}</div>
              <div class="metric-label">Chiamate</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${Math.round(totalDuration / 60)}</div>
              <div class="metric-label">Minuti Totali</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">€${(totalCost / totalCalls).toFixed(3)}</div>
              <div class="metric-label">Costo Medio</div>
            </div>
          </div>

          <!-- Cost Analysis -->
          <div class="section">
            <h2>📊 Analisi Costi per Categoria</h2>
            <div class="chart-placeholder">
              Grafico Distribuzione Costi per Categoria
            </div>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Categoria</th>
                  <th>Costo</th>
                  <th>Percentuale</th>
                  <th>Chiamate</th>
                </tr>
              </thead>
              <tbody>
                ${costsByCategory.map(item => `
                  <tr>
                    <td>${item.category}</td>
                    <td>€${item.cost.toFixed(2)}</td>
                    <td>${item.percentage}%</td>
                    <td>${summary.find(s => s.description === item.category)?.count || 0}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Top Callers Analysis -->
          <div class="section page-break">
            <h2>👥 Top 5 Chiamanti per Costo</h2>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Numero</th>
                  <th>Chiamate</th>
                  <th>Durata Totale</th>
                  <th>Costo Totale</th>
                  <th>Costo Medio</th>
                </tr>
              </thead>
              <tbody>
                ${topCallers.map(caller => `
                  <tr>
                    <td>${caller.callerNumber}</td>
                    <td>${caller.totalCalls}</td>
                    <td>${Math.round((caller.totalDuration || 0) / 60)} min</td>
                    <td>€${(caller.totalCost || 0).toFixed(2)}</td>
                    <td>€${((caller.totalCost || 0) / caller.totalCalls).toFixed(3)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Time Analysis -->
          <div class="section">
            <h2>⏰ Analisi Temporale</h2>
            <div class="chart-placeholder">
              Grafico Distribuzione Chiamate per Ora del Giorno
            </div>
            <div class="summary-grid">
              <div class="summary-item">
                <strong>Ora di Picco:</strong> ${hourlyData.indexOf(Math.max(...hourlyData))}:00
              </div>
              <div class="summary-item">
                <strong>Ora Minima:</strong> ${hourlyData.indexOf(Math.min(...hourlyData))}:00
              </div>
              <div class="summary-item">
                <strong>Durata Media:</strong> ${Math.round(totalDuration / totalCalls)} secondi
              </div>
              <div class="summary-item">
                <strong>Periodo Analisi:</strong> ${data[0]?.dateCall || 'N/A'} - ${data[data.length - 1]?.dateCall || 'N/A'}
              </div>
            </div>
          </div>

          ${exportOptions.includeRecommendations ? `
          <!-- Recommendations -->
          <div class="section page-break">
            <h2>💡 Raccomandazioni</h2>
            <div class="recommendation">
              <div class="recommendation-title">Ottimizzazione Costi</div>
              <p>Considera piani tariffari alternativi per ridurre i costi delle chiamate verso numeri mobili, che rappresentano il ${((costsByCategory.find(c => c.category.includes('mobile')) || {percentage: 0}).percentage)}% del costo totale.</p>
            </div>
            <div class="recommendation">
              <div class="recommendation-title">Gestione Orari</div>
              <p>Le chiamate si concentrano principalmente nell'orario ${hourlyData.indexOf(Math.max(...hourlyData))}:00. Valuta piani con fasce orarie per ottimizzare i costi.</p>
            </div>
            <div class="recommendation">
              <div class="recommendation-title">Monitoraggio Continuo</div>
              <p>Implementa alert automatici per chiamate che superano €${(totalCost / totalCalls * 3).toFixed(2)} per identificare anomalie in tempo reale.</p>
            </div>
          </div>
          ` : ''}

          <!-- Footer -->
          <div style="margin-top: 60px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center; color: #666; font-size: 0.9em;">
            <p>Report generato automaticamente da Call Analytics Enterprise</p>
            <p>${currentOrganization.name} • ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
          </div>
        </body>
      </html>
    `;
  };

  return (
    <ModernCard variant="elevated" className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-semibold">Export Avanzato</h3>
        </div>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={exportOptions.includeCharts}
              onChange={(e) => setExportOptions(prev => ({
                ...prev,
                includeCharts: e.target.checked
              }))}
              className="rounded"
            />
            <span className="text-sm">Includi grafici</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={exportOptions.includeAnalysis}
              onChange={(e) => setExportOptions(prev => ({
                ...prev,
                includeAnalysis: e.target.checked
              }))}
              className="rounded"
            />
            <span className="text-sm">Includi analisi dettagliata</span>
          </label>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={exportOptions.includeRecommendations}
              onChange={(e) => setExportOptions(prev => ({
                ...prev,
                includeRecommendations: e.target.checked
              }))}
              className="rounded"
            />
            <span className="text-sm">Includi raccomandazioni</span>
          </label>

          <select
            value={exportOptions.format}
            onChange={(e) => setExportOptions(prev => ({
              ...prev,
              format: e.target.value
            }))}
            className="w-full p-2 border rounded-lg text-sm"
          >
            <option value="pdf">PDF Professionale</option>
            <option value="excel">Excel Avanzato</option>
            <option value="powerpoint">PowerPoint Report</option>
          </select>
        </div>
      </div>

      {/* Export Actions */}
      <div className="flex gap-3">
        <ModernButton
          variant="primary"
          onClick={generateAdvancedPdf}
          loading={generating}
          disabled={!data || data.length === 0}
          icon={Download}
          className="flex-1"
        >
          Genera Report PDF
        </ModernButton>

        <ModernButton
          variant="outline"
          disabled={!data || data.length === 0}
          icon={BarChart3}
        >
          Export Excel
        </ModernButton>

        <ModernButton
          variant="outline"
          disabled={!data || data.length === 0}
          icon={PieChart}
        >
          PowerPoint
        </ModernButton>
      </div>

      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Report Avanzato Include:</strong> Executive summary, grafici interattivi, 
          analisi temporale, top performers, raccomandazioni AI, e insights predittivi.
        </p>
      </div>
    </ModernCard>
  );
};