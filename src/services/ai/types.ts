export interface AIResponse {
  response: string;
}

export interface SkillAssessmentParams {
  strengths: string[];
  weaknesses: string[];
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface CodeAnalysisResult {
  isCorrect: boolean;
  feedback: string;
  suggestions?: string[];
  score?: number;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'coding';
  language: string;
  testCases: {
    input: string;
    expectedOutput: string;
  }[];
  sampleInput?: string;
  sampleOutput?: string;
  timeLimit?: number;
  difficulty: 'easy' | 'medium' | 'hard';
  hints?: string[];
}