import React from 'react';
import { Button } from './common/Button';
import { XCircleIcon, InfoIcon } from './common/Icons';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
    >
      <div 
        className="bg-slate-800 text-slate-100 p-6 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="help-modal-title" className="text-2xl font-bold text-sky-400 flex items-center">
            <InfoIcon className="w-7 h-7 mr-3 text-sky-400" />
            Help & Usage Guide
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-sky-300 transition-colors"
            aria-label="Close help modal"
          >
            <XCircleIcon className="w-8 h-8" />
          </button>
        </div>

        <div className="space-y-6 text-slate-300 text-sm sm:text-base">
          <section>
            <h3 className="text-xl font-semibold text-sky-300 mb-2">Getting Started</h3>
            <p>This tool helps you generate GTest/GMock mock code from your C++ header files.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-sky-300 mb-2">1. Selecting Files</h3>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Use the <strong className="text-sky-400">"Select Header Files"</strong> button to pick one or more `.h`, `.hpp`, or `.hh` files.</li>
              <li>Use the <strong className="text-sky-400">"Select Directory"</strong> button to choose a folder containing header files.</li>
              <li>Selected files will appear in a list. You can remove them using the <XCircleIcon className="w-4 h-4 inline-block text-red-400" /> icon next to each file.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-sky-300 mb-2">2. Generating Mocks</h3>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Once files are selected, click the <strong className="text-sky-400">"Generate Mocks"</strong> button.</li>
              <li>The tool will process each file and display the results.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-sky-300 mb-2">3. Using Generated Code</h3>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Each processed file gets a card showing its status and the generated mock.</li>
              <li><strong className="text-sky-400">Copy:</strong> Use the "Copy" button on a card to copy its mock code.</li>
              <li><strong className="text-sky-400">Download .h:</strong> Downloads the mock for that specific file (original filename is preserved).</li>
              <li><strong className="text-sky-400">Download All as ZIP:</strong> Creates a `GTestMocks.zip` file containing all successfully generated mocks.
                <ul className="list-['-_'] list-inside pl-4 mt-1">
                  <li>To save mocks to a specific folder (e.g., "mocks"): Download the ZIP, then extract its contents into your desired "mocks" folder. Files inside the ZIP retain their original names.</li>
                </ul>
              </li>
            </ul>
          </section>
          
          <section>
            <h3 className="text-lg font-semibold text-sky-300 mb-2">Key Transformation Rules</h3>
             <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Adds GMock/GTest includes.</li>
              <li>Public methods are converted to `MOCK_METHOD(...)`.</li>
              <li>Constructors and destructors are preserved exactly.</li>
              <li>Private and protected sections (and their members) are removed.</li>
              <li>Templated classes/methods and static methods are preserved with comments.</li>
              <li>Detailed comments are added throughout the generated code.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-sky-300 mb-2">Important Notes</h3>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>A valid <strong className="text-amber-400">Gemini API Key</strong> (set as `process.env.API_KEY` in the environment where this app runs) is required for mock generation.</li>
              <li>If generation fails, check the error messages and ensure your input C++ is valid.</li>
            </ul>
          </section>

          <div className="text-right mt-8">
            <Button onClick={onClose} variant="primary" size="md">
              Got it!
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
