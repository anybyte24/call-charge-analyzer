
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, CheckCircle, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FileUploadAdvancedProps {
  onFileUpload: (content: string, fileName: string) => Promise<void>;
  isLoading: boolean;
}

interface FilePreview {
  name: string;
  size: number;
  content: string;
  preview: string[];
}

const FileUploadAdvanced: React.FC<FileUploadAdvancedProps> = ({ onFileUpload, isLoading }) => {
  const [filePreview, setFilePreview] = useState<FilePreview | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({ title: "Formato file non valido", description: "Il file deve essere in formato CSV", variant: "destructive" });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File troppo grande", description: "Il file non può superare i 10MB", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const lines = content.split('\n').slice(0, 5);
      setFilePreview({ name: file.name, size: file.size, content, preview: lines });
    };
    reader.readAsText(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false
  });

  const handleUpload = async () => {
    if (!filePreview) return;
    try {
      setUploadProgress(0);
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) { clearInterval(progressInterval); return 90; }
          return prev + 10;
        });
      }, 100);
      await onFileUpload(filePreview.content, filePreview.name);
      clearInterval(progressInterval);
      setUploadProgress(100);
      setTimeout(() => { setFilePreview(null); setUploadProgress(0); }, 2000);
    } catch (error) {
      setUploadProgress(0);
      console.error('Upload error:', error);
    }
  };

  const clearPreview = () => { setFilePreview(null); setUploadProgress(0); };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Upload className="h-4 w-4 text-primary" />
          Carica File CSV
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!filePreview ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-3">
              <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                isDragActive ? 'bg-primary/10' : 'bg-muted'
              }`}>
                <Upload className={`h-6 w-6 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {isDragActive ? 'Rilascia il file qui' : 'Trascina il file CSV qui'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  oppure clicca per selezionare
                </p>
              </div>
              <p className="text-[11px] text-muted-foreground">
                CSV · Max 10MB
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-foreground">{filePreview.name}</h3>
                    <p className="text-xs text-muted-foreground">{formatFileSize(filePreview.size)}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={clearPreview} className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="bg-card rounded-lg border p-3">
                <h4 className="text-xs font-medium text-muted-foreground mb-2">Anteprima</h4>
                <div className="text-[11px] font-mono space-y-0.5 max-h-28 overflow-y-auto">
                  {filePreview.preview.map((line, index) => (
                    <div key={index} className={`${index === 0 ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                      {line || '(riga vuota)'}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {uploadProgress > 0 && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Elaborazione...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-1.5" />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={clearPreview} disabled={isLoading}>
                Annulla
              </Button>
              <Button
                size="sm"
                onClick={handleUpload}
                disabled={isLoading || uploadProgress > 0}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-primary-foreground mr-2"></div>
                    Elaborazione...
                  </>
                ) : uploadProgress === 100 ? (
                  <>
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                    Completato
                  </>
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                    Carica ed Elabora
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUploadAdvanced;
