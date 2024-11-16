import axios from 'axios';
import { AI_API_URL, axiosConfig } from './config';
import { defaultQuestion, defaultHints, getDefaultCodingQuestion } from './defaults';
import { AIResponse, SkillAssessmentParams, AssessmentQuestion, CodeAnalysisResult } from './types';
import { sanitizeResponse, parseArrayResponse, validateQuestion, validateCodingQuestion } from './utils';

export const generateLearningPath = async (topic: string): Promise<string[]> => {
  try {
    const response = await axios.post<AIResponse>(
      AI_API_URL,
      {
        prompt: topic,
        history: [],
        system_prompt: `Generate a learning path for ${topic}. Focus on practical, real-world applications.`
      },
      axiosConfig
    );

    return parseArrayResponse(response.data?.response || '');
  } catch (error) {
    console.error("Error generating learning path:", error);
    return [];
  }
};

export const generateSkillAssessment = async (params: SkillAssessmentParams): Promise<AssessmentQuestion> => {
  const { topic = 'JavaScript', difficulty = 'medium' } = params;

  try {
    // First try to get a random default question
    const defaultQuestion = getDefaultCodingQuestion(topic, difficulty);
    
    // Then try to get an AI-generated question
    try {
      const prompt = `Generate a coding challenge for ${topic} programming. Return response in this exact JSON format:
      {
        "question": "detailed problem statement",
        "sampleInput": "example input",
        "sampleOutput": "example output",
        "testCases": [
          {
            "input": "test input 1",
            "expectedOutput": "expected output 1"
          },
          {
            "input": "test input 2",
            "expectedOutput": "expected output 2"
          }
        ],
        "timeLimit": number (in minutes),
        "difficulty": "${difficulty}",
        "hints": [
          "hint 1",
          "hint 2"
        ]
      }`;

      const response = await axios.post(
        AI_API_URL,
        {
          messages: [{
            role: "system",
            content: prompt
          }]
        },
        axiosConfig
      );

      if (!response.data?.response) {
        return defaultQuestion;
      }

      let aiQuestion;
      try {
        aiQuestion = JSON.parse(response.data.response);
      } catch (e) {
        console.error('Failed to parse AI question:', response.data.response);
        return defaultQuestion;
      }

      // Validate AI question structure
      if (!aiQuestion.question || !aiQuestion.sampleInput || !aiQuestion.sampleOutput || !aiQuestion.testCases) {
        return defaultQuestion;
      }

      // Return AI question with necessary fields
      return {
        id: Math.random().toString(36).substr(2, 9),
        ...aiQuestion,
        language: topic,
        type: 'coding'
      };

    } catch (aiError) {
      console.error("Error generating AI question:", aiError);
      return defaultQuestion;
    }
  } catch (error) {
    console.error("Error in generateSkillAssessment:", error);
    return getDefaultCodingQuestion(topic, difficulty);
  }
};

export const analyzeCode = async (code: string, language: string): Promise<string> => {
  try {
    const response = await axios.post(
      AI_API_URL,
      {
        messages: [{
          role: "system",
          content: `Analyze this ${language} code and tell if it's correct or wrong. Return ONLY "CORRECT" or "WRONG":
          
          ${code}`
        }]
      },
      axiosConfig
    );

    if (!response.data || !response.data.response) {
      throw new Error('Invalid response from AI');
    }

    const result = response.data.response.trim().toUpperCase();
    if (result !== 'CORRECT' && result !== 'WRONG') {
      throw new Error('Invalid analysis result');
    }

    return result;
  } catch (error) {
    console.error('Code analysis error:', error);
    throw new Error('Failed to analyze code');
  }
};

export const generatePersonalizedHints = async (
  topic: string,
  strengths: string[],
  weaknesses: string[]
): Promise<string[]> => {
  try {
    const response = await axios.post<AIResponse>(
      AI_API_URL,
      {
        prompt: "Generate learning hints",
        chat_message_prompts: [{
          role: "system",
          content: `Generate personalized learning hints for ${topic}. Consider student strengths: ${strengths.join(', ')} and areas to improve: ${weaknesses.join(', ')}`
        }],
        history: []
      },
      axiosConfig
    );

    const hints = parseArrayResponse(response.data?.response || '');
    return hints.length > 0 ? hints : defaultHints;
  } catch (error) {
    console.error("Error generating hints:", error);
    return defaultHints;
  }
};