
import React, { useCallback, useRef } from 'react';
import { UploadCloudIcon } from './common/Icons';

interface FileInputProps {
  onFilesSelected: (files: FileList) => void;
  disabled?: boolean;
}

export const FileInput: React.FC<FileInputProps> = ({ onFilesSelected, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const directoryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onFilesSelected(event.target.files);
       // Reset input value to allow selecting the same file(s) again if needed after clearing
      event.target.value = '';
    }
  }, [onFilesSelected]);

  const triggerFileInput = () => fileInputRef.current?.click();
  const triggerDirectoryInput = () => directoryInputRef.current?.click();

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept=".h,.hpp,.hh"
        className="hidden"
        disabled={disabled}
      />
      <input
        type="file"
        ref={directoryInputRef}
        onChange={handleFileChange}
        // @ts-expect-error Non-standard attribute for directory selection.
        webkitdirectory=""
        // Non-standard attribute for directory selection (Firefox).
        mozdirectory=""
        // Non-standard attribute for directory selection.
        directory=""
        className="hidden"
        disabled={disabled}
      />
       <button
        type="button"
        onClick={triggerFileInput}
        disabled={disabled}
        className="w-full sm:flex-1 p-3 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg shadow-sm text-sky-300 hover:text-sky-200 transition-colors duration-150 focus:ring-2 focus:ring-sky-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <UploadCloudIcon className="w-5 h-5" />
        Select Header Files (.h, .hpp)
      </button>
      <button
        type="button"
        onClick={triggerDirectoryInput}
        disabled={disabled}
        className="w-full sm:flex-1 p-3 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg shadow-sm text-sky-300 hover:text-sky-200 transition-colors duration-150 focus:ring-2 focus:ring-sky-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <UploadCloudIcon className="w-5 h-5" />
        Select Directory
      </button>
    </div>
  );
};
