
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, Download } from 'lucide-react';
import { AnalysisSession } from '@/types/call-analysis';

interface HistoryPanelProps {
  sessions: AnalysisSession[];
  onSessionSelect: (session: AnalysisSession) => void;
  currentSessionId?: string;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ 
  sessions, 
  onSessionSelect, 
  currentSessionId 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Storico Analisi</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Nessuna analisi salvata
            </p>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  currentSessionId === session.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onSessionSelect(session)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm truncate">
                      {session.fileName}
                    </h4>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(session.uploadDate)}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {session.totalRecords.toLocaleString()} record
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Export functionality can be added here
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HistoryPanel;
