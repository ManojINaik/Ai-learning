import React, { useState } from 'react';
import { Check, X } from 'lucide-react';

interface CodeEditorProps {
  language: string;
  onSubmit: (code: string) => void;
  isAnalyzing: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ language, onSubmit, isAnalyzing }) => {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(code);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Write your {language} code here:
            </label>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-64 p-4 font-mono text-sm bg-gray-900 text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder={`// Enter your ${language} code here...`}
            spellCheck="false"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isAnalyzing || !code.trim()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                Analyze Code
                <Check className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CodeEditor;