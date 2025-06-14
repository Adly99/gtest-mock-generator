
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900/80 backdrop-blur-md shadow-top p-4 text-center mt-auto">
      <p className="text-sm text-slate-400">
        &copy; {new Date().getFullYear()} GTest Mock Generator. Powered by AI.
      </p>
    </footer>
  );
};
