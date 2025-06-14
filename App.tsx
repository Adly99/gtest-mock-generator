
import React, { useState, useCallback, useEffect } from 'react';
import JSZip from 'jszip';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FileInput } from './components/FileInput'; // New component
import { MockOutput } from './components/MockOutput';
import { HelpModal } from './components/HelpModal'; // Added
import { Button } from './components/common/Button';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { generateGTestMocks } from './services/geminiService';
import { InfoIcon, AlertTriangleIcon, UploadCloudIcon, XCircleIcon, DownloadCloudIcon, QuestionMarkCircleIcon } from './components/common/Icons'; // Added QuestionMarkCircleIcon

interface FileToProcess {
  id: string; // Unique ID for React key
  file: File;
  content: string | null;
  mockContent: string | null;
  status: 'pending' | 'loading' | 'success' | 'error';
  error: string | null;
}

const App: React.FC = () => {
  const [filesToProcess, setFilesToProcess] = useState<FileToProcess[]>([]);
  const [overallIsLoading, setOverallIsLoading] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [currentFileProcessing, setCurrentFileProcessing] = useState<string | null>(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false); // Added state for Help Modal

  const handleFilesSelected = useCallback((selectedFiles: FileList) => {
    setGlobalError(null);
    const newFiles: FileToProcess[] = Array.from(selectedFiles)
      .filter(file => /\.(h|hpp|hh)$/i.test(file.name)) // Basic filter for header files
      .map(file => ({
        id: `${file.name}-${file.lastModified}-${file.size}`,
        file,
        content: null,
        mockContent: null,
        status: 'pending',
        error: null,
      }));

    setFilesToProcess(prevFiles => {
      const existingFileIds = new Set(prevFiles.map(f => f.id));
      return [...prevFiles, ...newFiles.filter(nf => !existingFileIds.has(nf.id))];
    });
  }, []);

  const readFileContent = async (fileToProcess: FileToProcess): Promise<FileToProcess> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve({ ...fileToProcess, content: event.target?.result as string, status: 'pending' });
      };
      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        resolve({ ...fileToProcess, status: 'error', error: `Error reading file ${fileToProcess.file.name}: ${reader.error?.message || 'Unknown read error'}` });
      };
      reader.readAsText(fileToProcess.file);
    });
  };

  const handleGenerateMocks = useCallback(async () => {
    if (filesToProcess.every(f => f.status === 'success' || f.status === 'error' && f.mockContent !== null)) {
       if(!filesToProcess.some(f => f.status === 'pending' || (f.status === 'error' && f.mockContent === null))) {
        setGlobalError("All selected files have been processed or attempted. Clear list or add new files.");
        return;
       }
    }

    setOverallIsLoading(true);
    setGlobalError(null);

    const filesToActuallyProcess = filesToProcess.filter(f => f.status === 'pending' || (f.status === 'error' && f.mockContent === null));

    for (let i = 0; i < filesToActuallyProcess.length; i++) {
      let currentFile = filesToActuallyProcess[i];
      setCurrentFileProcessing(`Reading ${currentFile.file.name}...`);
      
      if (!currentFile.content) {
        currentFile = await readFileContent(currentFile);
        setFilesToProcess(prev => prev.map(f => f.id === currentFile.id ? currentFile : f));
        if (currentFile.status === 'error' || !currentFile.content) {
          continue; 
        }
      }
      
      setFilesToProcess(prev => prev.map(f => f.id === currentFile.id ? { ...f, status: 'loading', error: null } : f));
      setCurrentFileProcessing(`Generating mock for ${currentFile.file.name}... (${i + 1} of ${filesToActuallyProcess.length})`);

      try {
        const result = await generateGTestMocks(currentFile.content!);
        setFilesToProcess(prev => prev.map(f => f.id === currentFile.id ? { ...f, mockContent: result, status: 'success' } : f));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during mock generation.';
        setFilesToProcess(prev => prev.map(f => f.id === currentFile.id ? { ...f, status: 'error', error: errorMessage } : f));
      }
    }

    setCurrentFileProcessing(null);
    setOverallIsLoading(false);
  }, [filesToProcess]);

  const handleClearAll = useCallback(() => {
    setFilesToProcess([]);
    setGlobalError(null);
    setCurrentFileProcessing(null);
    setOverallIsLoading(false);
  }, []);
  
  const handleRemoveFile = useCallback((fileId: string) => {
    setFilesToProcess(prevFiles => prevFiles.filter(f => f.id !== fileId));
  }, []);

  const handleDownloadAllAsZip = useCallback(async () => {
    const zip = new JSZip();
    const successfulFiles = filesToProcess.filter(f => f.status === 'success' && f.mockContent);

    if (successfulFiles.length === 0) {
      setGlobalError("No successfully generated mocks to download.");
      return;
    }
    setGlobalError(null);

    successfulFiles.forEach(f => {
      const mockFileName = f.file.name; 
      zip.file(mockFileName, f.mockContent!);
    });

    try {
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = "GTestMocks.zip"; 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
        console.error("Error generating ZIP file:", error);
        setGlobalError(error instanceof Error ? `Failed to create ZIP: ${error.message}`: "Failed to create ZIP file.");
    }
  }, [filesToProcess]);
  
  const canGenerate = filesToProcess.length > 0 && filesToProcess.some(f => f.status === 'pending' || (f.status === 'error' && f.mockContent === null));
  const canDownloadZip = filesToProcess.some(f => f.status === 'success' && f.mockContent);

  const openHelpModal = () => setIsHelpModalOpen(true);
  const closeHelpModal = () => setIsHelpModalOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 text-slate-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col gap-8">
        <div className="bg-slate-800 p-6 rounded-xl shadow-2xl">
          <p className="flex items-center text-sky-400 mb-2">
            <InfoIcon className="w-5 h-5 mr-2" />
            Select C++ header files (.h, .hpp, .hh) or a directory containing them.
          </p>
          <FileInput onFilesSelected={handleFilesSelected} disabled={overallIsLoading} />

          {filesToProcess.length > 0 && (
            <div className="mt-4">
              <h3 className="text-md font-semibold text-sky-300 mb-2">Selected Files:</h3>
              <ul className="max-h-48 overflow-y-auto space-y-2 pr-2">
                {filesToProcess.map(ftp => (
                  <li key={ftp.id} className="flex justify-between items-center p-2 bg-slate-700 rounded-md text-sm">
                    <span className="truncate" title={ftp.file.name}>{ftp.file.name} ({ (ftp.file.size / 1024).toFixed(1) } KB)</span>
                    <button
                      onClick={() => handleRemoveFile(ftp.id)}
                      title="Remove file"
                      className="ml-2 p-1 text-slate-400 hover:text-red-400 disabled:opacity-50"
                      disabled={overallIsLoading}
                    >
                      <XCircleIcon className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-4 flex-wrap">
            <Button
              onClick={handleGenerateMocks}
              disabled={overallIsLoading || !canGenerate}
              className="w-full sm:w-auto flex-grow sm:flex-grow-0 bg-sky-600 hover:bg-sky-500 disabled:bg-sky-800 text-white"
            >
              {overallIsLoading && currentFileProcessing ? (
                <>
                  <LoadingSpinner className="w-5 h-5 mr-2" />
                  {currentFileProcessing}
                </>
              ) : overallIsLoading ? (
                 <>
                  <LoadingSpinner className="w-5 h-5 mr-2" />
                  Processing...
                </>
              ) : (
                'Generate Mocks'
              )}
            </Button>
            <Button
              onClick={handleDownloadAllAsZip}
              variant="outline"
              className="w-full sm:w-auto flex-grow sm:flex-grow-0 text-sky-400 border-sky-600 hover:bg-sky-700/50"
              disabled={overallIsLoading || !canDownloadZip}
            >
              <DownloadCloudIcon className="w-5 h-5 mr-2" />
              Download All as ZIP
            </Button>
            <Button
              onClick={handleClearAll}
              variant="secondary"
              className="w-full sm:w-auto flex-grow sm:flex-grow-0"
              disabled={overallIsLoading && filesToProcess.some(f => f.status === 'loading')}
            >
              Clear All
            </Button>
            <Button
              onClick={openHelpModal}
              variant="secondary"
              className="w-full sm:w-auto flex-grow sm:flex-grow-0 bg-teal-600 hover:bg-teal-500 text-white"
              title="Help & Usage Guide"
            >
              <QuestionMarkCircleIcon className="w-5 h-5 mr-2" />
              Help
            </Button>
          </div>
        </div>

        {globalError && (
          <div className="bg-red-700/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg shadow-md flex items-start" role="alert">
            <AlertTriangleIcon className="w-5 h-5 mr-3 mt-1 text-red-300" />
            <div>
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline ml-1">{globalError}</span>
            </div>
          </div>
        )}

        {(filesToProcess.length > 0 || overallIsLoading) && (
           <div className="bg-slate-800 p-6 rounded-xl shadow-2xl">
            <MockOutput files={filesToProcess} overallIsLoading={overallIsLoading} />
          </div>
        )}
      </main>
      <Footer />
      <HelpModal isOpen={isHelpModalOpen} onClose={closeHelpModal} />
    </div>
  );
};

export default App;
