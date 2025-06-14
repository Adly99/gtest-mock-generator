
import React, { useState, useEffect } from 'react';
import { Button } from './common/Button';
import { LoadingSpinner } from './common/LoadingSpinner';
import { ClipboardCopyIcon, CheckIcon, DownloadIcon, AlertTriangleIcon, UploadCloudIcon } from './common/Icons';

interface FileToProcessOutput {
  id: string;
  file: File;
  mockContent: string | null;
  status: 'pending' | 'loading' | 'success' | 'error';
  error: string | null;
}

interface MockOutputProps {
  files: FileToProcessOutput[];
  overallIsLoading: boolean;
}

const FileOutputCard: React.FC<{ fileOutput: FileToProcessOutput }> = ({ fileOutput }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (fileOutput.mockContent) {
      navigator.clipboard.writeText(fileOutput.mockContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (fileOutput.mockContent) {
      // Use original filename for the downloaded file
      const mockFileName = fileOutput.file.name; 
      const blob = new Blob([fileOutput.mockContent], { type: 'text/x-c++hdr;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = mockFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    }
  };
  
  let statusColor = 'text-slate-400';
  if (fileOutput.status === 'success') statusColor = 'text-green-400';
  if (fileOutput.status === 'error') statusColor = 'text-red-400';
  if (fileOutput.status === 'loading') statusColor = 'text-sky-400';


  return (
    <div className="bg-slate-700 border border-slate-600 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-md font-semibold text-sky-300 truncate" title={fileOutput.file.name}>
          {fileOutput.file.name}
        </h3>
        <span className={`text-xs font-medium uppercase ${statusColor}`}>
          {fileOutput.status}
        </span>
      </div>

      {fileOutput.status === 'loading' && (
        <div className="flex flex-col items-center justify-center min-h-[100px] text-slate-300">
          <LoadingSpinner className="w-8 h-8 text-sky-400" />
          <p className="mt-2 text-sm">Generating mock...</p>
        </div>
      )}

      {fileOutput.status === 'error' && fileOutput.error && (
        <div className="p-3 bg-red-800/30 rounded-md text-red-300 text-sm">
          <p className="flex items-center"><AlertTriangleIcon className="w-4 h-4 mr-2" /> Error: {fileOutput.error}</p>
        </div>
      )}

      {fileOutput.status === 'success' && fileOutput.mockContent && (
        <>
          <div className="flex items-center gap-2 mb-2">
            <Button onClick={handleCopy} variant="outline" size="sm" className="text-xs">
              {copied ? <CheckIcon className="w-3 h-3 mr-1" /> : <ClipboardCopyIcon className="w-3 h-3 mr-1" />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button onClick={handleDownload} variant="outline" size="sm" className="text-xs">
              <DownloadIcon className="w-3 h-3 mr-1" />
              Download .h
            </Button>
          </div>
          <pre className="p-3 bg-slate-800 rounded-md overflow-auto max-h-[40vh] code-block text-sm text-slate-100">
            <code>{fileOutput.mockContent}</code>
          </pre>
        </>
      )}
       {fileOutput.status === 'pending' && (
         <div className="flex flex-col items-center justify-center min-h-[100px] text-slate-400 text-sm">
            <p>Pending generation...</p>
        </div>
      )}
    </div>
  );
};


export const MockOutput: React.FC<MockOutputProps> = ({ files, overallIsLoading }) => {
  if (files.length === 0 && !overallIsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] text-slate-400 text-center">
        <UploadCloudIcon className="w-16 h-16 mb-4 text-slate-500" />
        <p className="text-lg">No files selected for processing.</p>
        <p className="text-sm">Use the area above to select C++ header files or a directory.</p>
      </div>
    );
  }
  
  if (files.every(f => f.status === 'pending') && !overallIsLoading) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[200px] text-slate-400 text-center">
        <UploadCloudIcon className="w-16 h-16 mb-4 text-slate-500" />
        <p className="text-lg">Files selected. Click "Generate Mocks" to start.</p>
      </div>
    );
  }


  return (
    <div>
      <h2 className="text-xl font-semibold text-sky-300 mb-4">Generated Mock Files</h2>
      {overallIsLoading && files.every(f => f.status === 'pending' || f.status === 'loading') && (
         <div className="flex flex-col items-center justify-center bg-slate-700/50 rounded-lg p-8">
            <LoadingSpinner className="w-12 h-12 text-sky-400" />
            <p className="mt-3 text-slate-300 text-lg">Processing files, please wait...</p>
          </div>
      )}
      <div className="space-y-4">
        {files.map(fileOutput => (
          <FileOutputCard key={fileOutput.id} fileOutput={fileOutput} />
        ))}
      </div>
    </div>
  );
};
