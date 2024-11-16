import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { AlertCircle, BookOpen, CheckCircle2, Code, Loader2 } from 'lucide-react';
import {
  analyzeCode,
  suggestLearningResources,
  AssessmentResult
} from '../services/skillAssessmentService';
import {
  Question,
  SubmissionResult,
  generateQuestion,
  checkAnswer,
  saveScore
} from '../services/questionService';

const focusAreaOptions = [
  'Code Quality',
  'Performance',
  'Security',
  'Best Practices',
  'Design Patterns',
  'Testing',
  'Documentation',
  'Error Handling'
];

const SkillsAssessmentPage: React.FC = () => {
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState('typescript');
  const [skillLevel, setSkillLevel] = useState('intermediate');
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [resources, setResources] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || '');
    setError(null);
    setResult(null);
    setResources([]);
    setSubmissionResult(null);
  };

  const handleFocusAreaToggle = (area: string) => {
    setFocusAreas(prev => 
      prev.includes(area)
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const handleGenerateQuestion = async () => {
    try {
      setLoading(true);
      setLoadingMessage('Generating question...');
      setError(null);
      setCurrentQuestion(null);
      
      if (focusAreas.length === 0) {
        throw new Error('Please select at least one focus area');
      }

      if (!language) {
        throw new Error('Please select a programming language');
      }

      if (!skillLevel) {
        throw new Error('Please select a skill level');
      }

      console.log('Generating question with:', { language, skillLevel, focusAreas });
      const question = await generateQuestion(language, skillLevel, focusAreas);
      console.log('Generated question:', question);
      
      setCurrentQuestion(question);
      setCode(''); // Clear the editor
    } catch (err: any) {
      console.error('Question generation error:', err);
      const errorMessage = err.message || 'Failed to generate question';
      setError(`Error: ${errorMessage}. Please try again or select different parameters.`);
      setCurrentQuestion(null);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleAssessment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!code.trim()) {
        throw new Error('Please enter some code to analyze');
      }

      if (focusAreas.length === 0) {
        throw new Error('Please select at least one focus area');
      }

      // If there's a current question, check the answer first
      if (currentQuestion) {
        setLoadingMessage('Checking your solution...');
        const submission = await checkAnswer(currentQuestion, code, language);
        setSubmissionResult(submission);
        
        // Save the score to the database (replace 'user123' with actual user ID)
        await saveScore('user123', currentQuestion.id, submission.score, language);
      }

      // Continue with regular code analysis
      setLoadingMessage('Analyzing your code...');
      const assessmentResult = await analyzeCode(
        code,
        language,
        skillLevel,
        focusAreas
      );
      setResult(assessmentResult);

      // Get learning resources
      setLoadingMessage('Finding learning resources...');
      const learningResources = await suggestLearningResources(
        assessmentResult.weaknesses,
        language,
        skillLevel
      );
      setResources(learningResources);

    } catch (err: any) {
      console.error('Assessment error:', err);
      setError(err.message || 'An unexpected error occurred');
      setResult(null);
      setResources([]);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Skills Assessment</h1>
        <p className="text-gray-600">
          Practice coding questions and get personalized feedback.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Programming Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={loading}
              >
                <option value="typescript">TypeScript</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="csharp">C#</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skill Level
              </label>
              <select
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={loading}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Focus Areas
              </label>
              <div className="grid grid-cols-2 gap-2">
                {focusAreaOptions.map(area => (
                  <button
                    key={area}
                    onClick={() => handleFocusAreaToggle(area)}
                    disabled={loading}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      focusAreas.includes(area)
                        ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    } border disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                {currentQuestion ? 'Your Solution' : 'Your Code'}
              </label>
              <button
                onClick={handleGenerateQuestion}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Generate New Question
              </button>
            </div>

            {currentQuestion && (
              <div className="mb-4 bg-indigo-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-indigo-900 mb-2">Question:</h4>
                <p className="text-sm text-indigo-800 mb-3">{currentQuestion.question}</p>
                {currentQuestion.hints && currentQuestion.hints.length > 0 && (
                  <div className="mt-2">
                    <h5 className="text-sm font-medium text-indigo-900 mb-1">Hints:</h5>
                    <ul className="list-disc list-inside text-sm text-indigo-800">
                      {currentQuestion.hints.map((hint, index) => (
                        <li key={index}>{hint}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {loading ? (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                    <p className="text-gray-700 text-center">{loadingMessage}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#1e1e1e] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-gray-400 text-sm">Code Editor</span>
                </div>
                <Editor
                  height="400px"
                  language={language.toLowerCase()}
                  value={code}
                  onChange={handleEditorChange}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    readOnly: loading,
                    theme: 'vs-dark',
                    scrollBeyondLastLine: false,
                    lineNumbers: 'on',
                    renderLineHighlight: 'all',
                    quickSuggestions: true,
                    suggestOnTriggerCharacters: true
                  }}
                  className="rounded-md overflow-hidden border border-gray-700"
                />
              </div>
            )}

            <div className="flex space-x-2">
              <button
                onClick={handleAssessment}
                disabled={loading || !code.trim()}
                className={`flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading || !code.trim()
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {loadingMessage}
                  </>
                ) : (
                  currentQuestion ? 'Submit Solution' : 'Analyze Code'
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {submissionResult && (
            <div className={`bg-white p-6 rounded-lg shadow-sm border ${
              submissionResult.correct ? 'border-green-200' : 'border-amber-200'
            }`}>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Submission Result</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    submissionResult.correct ? 'bg-green-100' : 'bg-amber-100'
                  }`}>
                    {submissionResult.correct ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    )}
                  </div>
                  <div className="ml-3">
                    <h4 className={`font-medium ${
                      submissionResult.correct ? 'text-green-900' : 'text-amber-900'
                    }`}>
                      {submissionResult.correct ? 'Correct Solution!' : 'Not Quite Right'}
                    </h4>
                    <p className="text-sm text-gray-600">Score: {submissionResult.score}/10</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700">{submissionResult.feedback}</p>
              </div>
            </div>
          )}

          {result && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Analysis Results</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Overall Score</h4>
                  <p className="mt-1 text-3xl font-semibold text-indigo-600">
                    {result.overallScore}/10
                  </p>
                </div>

                {result.strengths.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Strengths</h4>
                    <ul className="space-y-2">
                      {result.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                          <span className="text-sm text-gray-700">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.weaknesses.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Areas for Improvement</h4>
                    <ul className="space-y-2">
                      {result.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                          <span className="text-sm text-gray-700">{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {resources.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Learning Resources</h3>
              <ul className="space-y-3">
                {resources.map((resource, index) => {
                  if (index < 2) return null; // Skip the header and focus areas
                  if (resource === '---') return <hr key={index} className="my-2" />;
                  
                  const lines = resource.split('\n');
                  const title = lines[0];
                  const snippet = lines[1];
                  const link = lines[2]?.replace('Link: ', '');
                  
                  return (
                    <li key={index} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-md font-medium text-indigo-600 mb-2">
                        {title}
                      </h4>
                      {snippet && (
                        <p className="text-sm text-gray-600 mb-2">
                          {snippet}
                        </p>
                      )}
                      {link && (
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-500 hover:text-indigo-600 flex items-center"
                        >
                          Learn More
                          <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillsAssessmentPage;