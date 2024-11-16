import React, { useState } from 'react';
import { Brain, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Question {
  id: string;
  text: string;
  options: string[];
  styles: ('visual' | 'auditory' | 'kinesthetic' | 'reading')[];
}

const questions: Question[] = [
  {
    id: '1',
    text: 'When learning something new, I prefer to:',
    options: [
      'Read detailed written instructions',
      'Watch a video demonstration',
      'Try it hands-on immediately',
      'Listen to verbal explanations'
    ],
    styles: ['reading', 'visual', 'kinesthetic', 'auditory']
  },
  {
    id: '2',
    text: 'I learn best when:',
    options: [
      'I can see diagrams and visual aids',
      'I can listen to explanations',
      'I can physically practice the skill',
      'I can read and take notes'
    ],
    styles: ['visual', 'auditory', 'kinesthetic', 'reading']
  },
  {
    id: '3',
    text: 'When solving problems, I tend to:',
    options: [
      'Draw diagrams or sketches',
      'Talk through the solutions',
      'Use a hands-on approach',
      'Write down the steps'
    ],
    styles: ['visual', 'auditory', 'kinesthetic', 'reading']
  },
  {
    id: '4',
    text: 'I remember information best by:',
    options: [
      'Creating visual images in my mind',
      'Repeating it out loud',
      'Moving or using my hands',
      'Writing it down multiple times'
    ],
    styles: ['visual', 'auditory', 'kinesthetic', 'reading']
  },
  {
    id: '5',
    text: 'When working on a new project, I prefer to:',
    options: [
      'Look at examples and diagrams',
      'Discuss ideas with others',
      'Build a prototype or model',
      'Read documentation and guides'
    ],
    styles: ['visual', 'auditory', 'kinesthetic', 'reading']
  }
];

interface LearningStyle {
  visual: number;
  auditory: number;
  kinesthetic: number;
  reading: number;
}

const LearningStyleAssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<string>('');
  const [styles, setStyles] = useState<LearningStyle>({
    visual: 0,
    auditory: 0,
    kinesthetic: 0,
    reading: 0
  });

  const handleAnswer = (optionIndex: number) => {
    const question = questions[currentQuestion];
    const selectedStyle = question.styles[optionIndex];
    
    setAnswers(prev => ({
      ...prev,
      [question.id]: optionIndex
    }));

    setStyles(prev => ({
      ...prev,
      [selectedStyle]: prev[selectedStyle] + 1
    }));

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      calculateResult();
    }
  };

  const calculateResult = () => {
    const totalResponses = Object.values(styles).reduce((a, b) => a + b, 0);
    const percentages = Object.entries(styles).reduce((acc, [style, count]) => {
      acc[style] = Math.round((count / totalResponses) * 100);
      return acc;
    }, {} as Record<string, number>);

    const dominantStyle = Object.entries(percentages).reduce((a, b) => 
      a[1] > b[1] ? a : b
    )[0];

    const resultDescriptions = {
      visual: 'You are a Visual Learner! You learn best through seeing and observing. Use diagrams, charts, and visual aids to enhance your learning.',
      auditory: 'You are an Auditory Learner! You learn best through listening and discussion. Try recording lectures and participating in group discussions.',
      kinesthetic: 'You are a Kinesthetic Learner! You learn best through hands-on experience. Focus on practical exercises and real-world applications.',
      reading: 'You are a Reading/Writing Learner! You learn best through written words. Take detailed notes and read comprehensive materials.'
    };

    setResult(resultDescriptions[dominantStyle as keyof typeof resultDescriptions]);
    setShowResult(true);
  };

  const resetAssessment = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResult(false);
    setResult('');
    setStyles({
      visual: 0,
      auditory: 0,
      kinesthetic: 0,
      reading: 0
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fadeIn">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <div className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Learning Style Assessment
            </h2>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {!showResult ? (
            <div className="space-y-6">
              <div className="mb-8">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Question {currentQuestion + 1} of {questions.length}</span>
                  <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 rounded-full h-2 transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                {questions[currentQuestion].text}
              </h3>

              <div className="grid gap-4">
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    <div className="flex items-center">
                      <span className="flex-1">{option}</span>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Your Learning Style Results
                </h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  {result}
                </p>
              </div>

              <div className="max-w-md mx-auto">
                {Object.entries(styles).map(([style, count]) => {
                  const percentage = Math.round((count / Object.values(styles).reduce((a, b) => a + b, 0)) * 100);
                  return (
                    <div key={style} className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span className="capitalize">{style}</span>
                        <span>{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 rounded-full h-2 transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={resetAssessment}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                Take Assessment Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningStyleAssessmentPage;