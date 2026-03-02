import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, Trash2, Loader2 } from 'lucide-react';
import { AnalysisSession } from '@/types/call-analysis';

interface HistoryPanelProps {
  sessions: AnalysisSession[];
  onSessionSelect: (session: AnalysisSession) => void;
  onSessionDelete?: (sessionId: string) => void;
  currentSessionId?: string;
  loading?: boolean;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ 
  sessions, 
  onSessionSelect,
  onSessionDelete,
  currentSessionId,
  loading 
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
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4 text-primary" />
          <span>Storico Analisi</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
            <span className="text-xs text-muted-foreground">Caricamento...</span>
          </div>
        ) : (
          <div className="space-y-1.5">
            {sessions.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                Nessuna analisi salvata
              </p>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={`group p-2.5 rounded-lg cursor-pointer transition-all text-xs ${
                    currentSessionId === session.id 
                      ? 'bg-primary/10 border border-primary/20' 
                      : 'hover:bg-muted/80 border border-transparent'
                  }`}
                  onClick={() => onSessionSelect(session)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate text-xs">
                        {session.fileName}
                      </h4>
                      <div className="flex items-center gap-1.5 text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3 shrink-0" />
                        <span>{formatDate(session.uploadDate)}</span>
                      </div>
                      <p className="text-muted-foreground mt-0.5">
                        {session.totalRecords?.toLocaleString()} record
                      </p>
                    </div>
                    {onSessionDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSessionDelete(session.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HistoryPanel;
