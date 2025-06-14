
import React from 'react';
import { TestTubeDiagonalIcon } from './common/Icons'; // Assuming you have an icon component

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-900/80 backdrop-blur-md shadow-lg p-4 sm:p-6 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-center sm:justify-start">
        <TestTubeDiagonalIcon className="w-8 h-8 sm:w-10 sm:h-10 text-sky-400 mr-3" />
        <h1 className="text-2xl sm:text-3xl font-bold text-sky-400 tracking-tight">
          GTest Mock Generator
        </h1>
      </div>
    </header>
  );
};
