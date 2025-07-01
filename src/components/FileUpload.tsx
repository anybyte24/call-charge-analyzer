
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface FileUploadProps {
  onFileUpload: (content: string, fileName: string) => void;
  isLoading?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isLoading }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onFileUpload(content, file.name);
      };
      reader.readAsText(file);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false,
    disabled: isLoading
  });

  return (
    <Card className="bg-white/70 backdrop-blur-sm border shadow-lg">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragActive 
            ? 'border-blue-400 bg-blue-50/80 scale-[1.02]' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          {isLoading ? (
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-200"></div>
              <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-blue-600 absolute top-0"></div>
            </div>
          ) : (
            <div className="relative">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl shadow-lg">
                <Upload className="h-8 w-8 text-white" />
              </div>
              {isDragActive && (
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="h-6 w-6 text-blue-500 animate-pulse" />
                </div>
              )}
            </div>
          )}
          <div>
            <p className="text-xl font-semibold text-gray-900 mb-1">
              {isLoading ? 'Analizzando il file...' : 'Carica file CSV'}
            </p>
            <p className="text-gray-600">
              {isDragActive 
                ? 'Rilascia il file qui...' 
                : 'Trascina qui il file CSV o clicca per selezionare'
              }
            </p>
            {isLoading && (
              <p className="text-sm text-blue-600 mt-2 animate-pulse">
                Elaborazione in corso, attendere...
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-full">
            <FileText className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Solo file .csv</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FileUpload;
