import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface AnalysisResultProps {
  result: string;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ result }) => {
  const isCorrect = result === 'CORRECT';

  return (
    <div className="rounded-lg border p-4 bg-white shadow-sm flex items-center gap-3">
      {isCorrect ? (
        <>
          <CheckCircle2 className="w-6 h-6 text-green-500" />
          <span className="text-lg font-medium text-green-700">Correct Solution!</span>
        </>
      ) : (
        <>
          <XCircle className="w-6 h-6 text-red-500" />
          <span className="text-lg font-medium text-red-700">Incorrect Solution</span>
        </>
      )}
    </div>
  );
};

export default AnalysisResult;