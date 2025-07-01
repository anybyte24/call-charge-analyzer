
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
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
      toast({
        title: "Formato file non valido",
        description: "Il file deve essere in formato CSV",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File troppo grande",
        description: "Il file non può superare i 10MB",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const lines = content.split('\n').slice(0, 5); // First 5 lines for preview
      
      setFilePreview({
        name: file.name,
        size: file.size,
        content,
        preview: lines
      });
    };
    
    reader.readAsText(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false
  });

  const handleUpload = async () => {
    if (!filePreview) return;

    try {
      setUploadProgress(0);
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      await onFileUpload(filePreview.content, filePreview.name);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setFilePreview(null);
        setUploadProgress(0);
      }, 2000);
      
    } catch (error) {
      setUploadProgress(0);
      console.error('Upload error:', error);
    }
  };

  const clearPreview = () => {
    setFilePreview(null);
    setUploadProgress(0);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur-sm border shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Carica File CSV</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!filePreview ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                isDragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="space-y-4">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                  isDragActive ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Upload className={`h-8 w-8 ${isDragActive ? 'text-blue-600' : 'text-gray-600'}`} />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {isDragActive ? 'Rilascia il file qui' : 'Trascina il file CSV qui'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    oppure clicca per selezionare il file
                  </p>
                </div>
                <div className="text-xs text-gray-400">
                  Formati supportati: CSV • Dimensione massima: 10MB
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* File Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">{filePreview.name}</h3>
                      <p className="text-sm text-gray-500">{formatFileSize(filePreview.size)}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearPreview}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* CSV Preview */}
                <div className="bg-white rounded border p-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Anteprima (Prime 5 righe):</h4>
                  <div className="text-xs font-mono space-y-1 max-h-32 overflow-y-auto">
                    {filePreview.preview.map((line, index) => (
                      <div key={index} className={`${index === 0 ? 'font-bold text-blue-600' : 'text-gray-600'}`}>
                        {line || '(riga vuota)'}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Upload Progress */}
              {uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Upload in corso...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {/* Upload Actions */}
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={clearPreview}
                  disabled={isLoading}
                >
                  Annulla
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={isLoading || uploadProgress > 0}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Elaborazione...
                    </>
                  ) : uploadProgress === 100 ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Completato
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Carica ed Elabora
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FileUploadAdvanced;
