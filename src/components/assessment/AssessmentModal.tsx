import React, { useState, useEffect } from 'react';
import { X, Brain, ArrowRight, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { addAssessment, getAssessmentQuestions } from '../../services/firebase.service';
import type { AssessmentQuestion } from '../../services/firebase.service';

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AssessmentModal = ({ isOpen, onClose }: AssessmentModalProps) => {
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [completed, setCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = getAssessmentQuestions((data) => {
      const filteredQuestions = data.filter(q => q.difficulty === difficulty);
      setQuestions(filteredQuestions);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen, difficulty]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && !completed && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, completed, timeLeft]);

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Questions Available</h3>
            <p className="text-gray-600 mb-4">There are no questions available for this difficulty level.</p>
            <button
              onClick={onClose}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestionData = questions[currentQuestion];
  if (!currentQuestionData) return null;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswer = async (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    // Adapt difficulty based on correct answers
    const correctCount = newAnswers.filter(
      (a, i) => questions[i] && a === questions[i].correctAnswer
    ).length;
    const accuracy = correctCount / newAnswers.length;

    if (accuracy > 0.7) {
      setDifficulty('hard');
    } else if (accuracy < 0.4) {
      setDifficulty('easy');
    } else {
      setDifficulty('medium');
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setCompleted(true);
      
      if (user) {
        setIsSubmitting(true);
        try {
          const score = Math.round((correctCount / newAnswers.length) * 100);
          await addAssessment({
            userId: user.id,
            type: currentQuestionData.category === 'knowledge' ? 'Knowledge Assessment' :
                  currentQuestionData.category === 'skills' ? 'Skills Assessment' : 
                  'Learning Style Assessment',
            score,
            improvement: '+12%',
            completedAt: new Date()
          });
        } catch (error) {
          console.error('Error saving assessment:', error);
          setError('Failed to save assessment results');
        } finally {
          setIsSubmitting(false);
        }
      }
    }
  };

  const score = answers.filter(
    (answer, index) => questions[index] && answer === questions[index].correctAnswer
  ).length;

  const scorePercentage = Math.round((score / questions.length) * 100);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {!completed ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Brain className="h-6 w-6 text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Smart Assessment
                </h2>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="h-5 w-5 mr-2" />
                {formatTime(timeLeft)}
              </div>
            </div>

            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm text-gray-600">
                <span>Question {currentQuestion + 1} of {questions.length}</span>
                <span>Difficulty: {difficulty}</span>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {currentQuestionData.question}
              </h3>
              <div className="space-y-3">
                {currentQuestionData.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                  >
                    <span className="font-medium text-gray-700">{option}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Assessment Complete!
            </h2>
            <p className="text-gray-600 mb-6">
              You scored {scorePercentage}% ({score} out of {questions.length} correct)
            </p>
            
            <div className="bg-indigo-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-indigo-900 mb-2">Performance Analysis</h3>
              <ul className="space-y-2 text-indigo-700">
                <li className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Strong performance in: {currentQuestionData.category}
                </li>
                <li className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Areas for improvement: Time management
                </li>
              </ul>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setCurrentQuestion(0);
                  setAnswers([]);
                  setCompleted(false);
                  setTimeLeft(30 * 60);
                  setError(null);
                }}
                className="flex-1 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center justify-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : (
                  <>
                    Retake Assessment
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentModal;