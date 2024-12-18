import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Question, AssessmentResult, generateQuestions, evaluateAnswers } from '../services/knowledgeAssessmentService';
import { Brain, CheckCircle, XCircle, AlertCircle, ArrowRight, Book } from 'lucide-react';

interface Domain {
  id: string;
  name: string;
  description: string;
}

const KnowledgeAssessmentPage: React.FC = () => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [stage, setStage] = useState<'domain' | 'assessment' | 'result'>('domain');

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const domainsCollection = collection(db, 'domains');
        const domainsSnapshot = await getDocs(domainsCollection);
        const domainsList = domainsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Domain));
        setDomains(domainsList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching domains:', error);
        setLoading(false);
      }
    };

    fetchDomains();
  }, []);

  const handleDomainSelect = async (domainId: string) => {
    try {
      setLoading(true);
      setSelectedDomain(domainId);
      
      // Find the selected domain name
      const selectedDomainData = domains.find(d => d.id === domainId);
      if (!selectedDomainData) {
        throw new Error('Domain not found');
      }

      // Generate questions for the selected domain
      const generatedQuestions = await generateQuestions(selectedDomainData.name);
      setQuestions(generatedQuestions);
      setStage('assessment');
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setResult(null);
    } catch (error) {
      console.error('Error starting assessment:', error);
      setError('Failed to start assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startAssessment = async () => {
    try {
      setLoading(true);
      setError(null);
      const generatedQuestions = await generateQuestions(selectedDomain);
      setQuestions(generatedQuestions);
      setStage('assessment');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (option: string, index: number) => {
    const answerLetter = String.fromCharCode(65 + index); // Convert index to 'A', 'B', 'C', 'D'
    setUserAnswers(prev => ({
      ...prev,
      [questions[currentQuestionIndex].id]: answerLetter
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitAssessment();
    }
  };

  const submitAssessment = async () => {
    try {
      setLoading(true);
      setError(null);
      const assessmentResult = await evaluateAnswers(questions, userAnswers);
      setResult(assessmentResult);
      setStage('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to evaluate assessment');
    } finally {
      setLoading(false);
    }
  };

  const resetAssessment = () => {
    setSelectedDomain('');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setResult(null);
    setStage('domain');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 flex items-center">
          <AlertCircle className="mr-2" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {stage === 'domain' && (
        <div>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Knowledge Assessment</h1>
            <p className="text-gray-600">Select your domain of interest to begin the assessment</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {domains.map((domain) => (
              <button
                key={domain.id}
                onClick={() => handleDomainSelect(domain.id)}
                className={`p-4 rounded-lg border transition-all ${
                  selectedDomain === domain.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Brain className={`w-5 h-5 ${
                    selectedDomain === domain.id ? 'text-indigo-500' : 'text-gray-400'
                  }`} />
                  <span className={selectedDomain === domain.id ? 'text-indigo-700' : 'text-gray-700'}>
                    {domain.name}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {domains.length === 0 && (
            <p className="text-gray-600 text-center">No domains available. Please contact an administrator.</p>
          )}
        </div>
      )}

      {stage === 'assessment' && questions[currentQuestionIndex] && (
        <div>
          {console.log('Current question:', questions[currentQuestionIndex])}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Question {currentQuestionIndex + 1} of {questions.length}
              </h2>
              <span className="text-gray-500">{selectedDomain}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <p className="text-lg text-gray-900 mb-6">{questions[currentQuestionIndex].text}</p>
            <div className="space-y-3">
              {questions[currentQuestionIndex].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option, index)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    userAnswers[questions[currentQuestionIndex].id] === String.fromCharCode(65 + index)
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      userAnswers[questions[currentQuestionIndex].id] === String.fromCharCode(65 + index)
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-100'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={nextQuestion}
              disabled={!userAnswers[questions[currentQuestionIndex].id]}
              className={`px-6 py-2 rounded-lg flex items-center space-x-2 ${
                userAnswers[questions[currentQuestionIndex].id]
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>{currentQuestionIndex === questions.length - 1 ? 'Submit' : 'Next'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {stage === 'result' && result && (
        <div>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Assessment Complete!</h2>
            <p className="text-gray-600">Here's your detailed performance analysis</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex justify-center mb-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-indigo-600 mb-2">
                  {Math.round(result.score)}%
                </div>
                <div className="text-gray-500">Overall Score</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="font-semibold text-green-700">{result.correctAnswers}</div>
                <div className="text-green-600">Correct</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <div className="font-semibold text-red-700">{result.incorrectAnswers}</div>
                <div className="text-red-600">Incorrect</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Book className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="font-semibold text-blue-700">{result.totalQuestions}</div>
                <div className="text-blue-600">Total Questions</div>
              </div>
            </div>

            <div className="space-y-6">
              {result.detailedFeedback && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Detailed Feedback</h3>
                  <p className="text-gray-600">{result.detailedFeedback}</p>
                </div>
              )}

              {result.strengthAreas && result.strengthAreas.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Strength Areas</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {result.strengthAreas.map((area, index) => (
                      <li key={index} className="text-gray-600">{area}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.improvementAreas && result.improvementAreas.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Areas for Improvement</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {result.improvementAreas.map((area, index) => (
                      <li key={index} className="text-gray-600">{area}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.recommendedTopics && result.recommendedTopics.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Recommended Topics</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {result.recommendedTopics.map((topic, index) => (
                      <li key={index} className="text-gray-600">{topic}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={resetAssessment}
              className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Start New Assessment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeAssessmentPage;
