
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText } from 'lucide-react';
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
    <Card className="p-8">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          {isLoading ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          ) : (
            <Upload className="h-12 w-12 text-gray-400" />
          )}
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isLoading ? 'Analizzando...' : 'Carica file CSV'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {isDragActive 
                ? 'Rilascia il file qui...' 
                : 'Trascina qui il file CSV o clicca per selezionare'
              }
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <FileText className="h-4 w-4" />
            <span>Solo file .csv</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FileUpload;
