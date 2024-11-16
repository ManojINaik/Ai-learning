import { AssessmentQuestion } from './types';

export const sanitizeResponse = (response: string): string => {
  return response?.trim() || '';
};

export const parseArrayResponse = (response: string): string[] => {
  try {
    const parsed = JSON.parse(response);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return response.split('\n').filter(line => line.trim());
  }
};

export const validateQuestion = (
  parsedData: any,
  defaultData: any
): { isValid: boolean; data: any } => {
  if (!parsedData || typeof parsedData !== 'object') {
    return { isValid: false, data: defaultData };
  }

  const hasRequiredFields = 
    typeof parsedData.question === 'string' &&
    Array.isArray(parsedData.options) &&
    typeof parsedData.correctAnswer === 'string' &&
    typeof parsedData.explanation === 'string';

  if (!hasRequiredFields) {
    return { isValid: false, data: defaultData };
  }

  const hasValidOptions = 
    parsedData.options.length === 4 &&
    parsedData.options.every((opt: any) => typeof opt === 'string');

  if (!hasValidOptions) {
    return { isValid: false, data: defaultData };
  }

  return { isValid: true, data: parsedData };
};

export const validateCodingQuestion = (
  question: any,
  defaultQuestion: AssessmentQuestion
): { isValid: boolean; data: AssessmentQuestion } => {
  if (!question || typeof question !== 'object') {
    return { isValid: false, data: defaultQuestion };
  }

  const requiredFields = [
    'question',
    'testCases',
    'hints',
    'explanation',
    'difficulty'
  ];

  const isValid = requiredFields.every(field => {
    if (field === 'testCases') {
      return Array.isArray(question[field]) && question[field].length > 0 &&
        question[field].every((tc: any) => 
          tc && typeof tc === 'object' && 
          'input' in tc && 'expectedOutput' in tc
        );
    }
    if (field === 'hints') {
      return Array.isArray(question[field]) && question[field].length > 0;
    }
    return field in question && typeof question[field] === 'string' && question[field].trim() !== '';
  });

  if (!isValid) {
    return { isValid: false, data: defaultQuestion };
  }

  return {
    isValid: true,
    data: {
      question: question.question,
      sampleInput: question.sampleInput || '',
      sampleOutput: question.sampleOutput || '',
      testCases: question.testCases,
      hints: question.hints,
      explanation: question.explanation,
      difficulty: question.difficulty,
      timeLimit: question.timeLimit || 30
    }
  };
};