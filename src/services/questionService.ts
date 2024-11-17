import axios, { AxiosError } from 'axios';
import { saveAssessmentResult } from './firebase.service';
import { getAuth } from 'firebase/auth';

// API Configuration
const BASE_URL = 'https://glhf.chat/api/openai/v1';
const GLHF_API_KEY = import.meta.env.VITE_GLHF_API_KEY;

// Timeout and retry configuration
const INITIAL_TIMEOUT = 15000;  // Increased initial timeout to 15 seconds
const MAX_TIMEOUT = 45000;     // Increased max timeout to 45 seconds
const MAX_RETRIES = 4;         // Increased max retries
const RETRY_DELAY = 1000;      // Base delay of 1 second

// API Response types
interface APIResponse {
  status: number;
  data?: any;
  message: string;
}

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: INITIAL_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${GLHF_API_KEY}`
  },
  validateStatus: (status) => status < 500 // Only treat 500+ as errors
});

// Utility function for delay with exponential backoff
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Enhanced error handling for API requests
async function makeAPIRequest(endpoint: string, data: any, retryCount = 0): Promise<APIResponse> {
  const currentTimeout = Math.min(INITIAL_TIMEOUT * Math.pow(1.5, retryCount), MAX_TIMEOUT);
  
  try {
    console.log(`Attempt ${retryCount + 1}/${MAX_RETRIES + 1}, timeout: ${currentTimeout}ms`);
    
    const response = await axiosInstance({
      method: 'POST',
      url: endpoint,
      data,
      timeout: currentTimeout
    });

    // Handle rate limiting with automatic retry
    if (response.status === 429) {
      if (retryCount < MAX_RETRIES) {
        const retryAfter = parseInt(response.headers['retry-after']) * 1000 || RETRY_DELAY * Math.pow(2, retryCount);
        console.log(`Rate limited, retrying after ${retryAfter}ms...`);
        await delay(retryAfter);
        return makeAPIRequest(endpoint, data, retryCount + 1);
      }
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    // Handle successful response
    if (response.status === 200) {
      return {
        status: response.status,
        data: response.data,
        message: 'Success'
      };
    }

    // Handle other client errors
    throw new Error(response.data?.error?.message || `Request failed with status ${response.status}`);

  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      // Handle various error scenarios
      if (axiosError.code === 'ECONNABORTED' || axiosError.message.includes('timeout')) {
        if (retryCount < MAX_RETRIES) {
          console.log(`Request timed out after ${currentTimeout}ms, retrying...`);
          await delay(RETRY_DELAY * Math.pow(1.5, retryCount));
          return makeAPIRequest(endpoint, data, retryCount + 1);
        }
        throw new Error('Request timed out. The server is taking too long to respond.');
      }

      if (axiosError.code === 'ERR_NETWORK') {
        if (retryCount < MAX_RETRIES) {
          console.log('Network error, retrying...');
          await delay(RETRY_DELAY * Math.pow(1.5, retryCount));
          return makeAPIRequest(endpoint, data, retryCount + 1);
        }
        throw new Error('Network error. Please check your internet connection.');
      }

      // Handle specific HTTP errors
      if (axiosError.response) {
        const status = axiosError.response.status;
        switch (status) {
          case 401:
            throw new Error('Authentication failed. Please check your API key.');
          case 403:
            throw new Error('Access denied. Please check your permissions.');
          case 400:
            throw new Error('Invalid request. Please check your input parameters.');
          case 404:
            throw new Error('API endpoint not found. Please check the service URL.');
          case 500:
          case 502:
          case 503:
          case 504:
            if (retryCount < MAX_RETRIES) {
              console.log(`Server error (${status}), retrying...`);
              await delay(RETRY_DELAY * Math.pow(2, retryCount));
              return makeAPIRequest(endpoint, data, retryCount + 1);
            }
            throw new Error('Server error. Please try again later.');
          default:
            throw new Error(`Request failed with status ${status}`);
        }
      }
    }
    
    throw new Error('An unexpected error occurred. Please try again.');
  }
}

// Validate required environment variables
if (!GLHF_API_KEY) {
  throw new Error('VITE_GLHF_API_KEY is not set in environment variables');
}

export interface Question {
  id: string;
  question: string;
  expectedOutput: string;
  difficulty: string;
  category: string;
  hints?: string[];
}

export interface SubmissionResult {
  correct: boolean;
  score: number;
  feedback: string;
}

export async function generateQuestion(language: string, skillLevel: string, focusAreas: string[]): Promise<Question> {
  try {
    console.log('Generating question with params:', { language, skillLevel, focusAreas });

    const systemPrompt = `You are a coding instructor. Generate a programming question based on these parameters:
Language: ${language}
Skill Level: ${skillLevel}
Focus Areas: ${focusAreas.join(', ')}

Return ONLY a JSON object with these exact fields:
{
  "question": "A clear problem statement",
  "expectedOutput": "What the solution should produce",
  "difficulty": "${skillLevel}",
  "category": "One of: ${focusAreas.join(', ')}",
  "hints": ["2-3 helpful hints"]
}`;

    const payload = {
      model: "hf:xingyaoww/Qwen2.5-Coder-32B-Instruct-AWQ-128k",
      messages: [
        {
          role: "system",
          content: systemPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    };

    const response = await makeAPIRequest('/chat/completions', payload);
    
    if (!response?.data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from AI service');
    }

    const content = response.data.choices[0].message.content.trim();
    let parsedQuestion: Question;

    try {
      parsedQuestion = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse question format from AI service');
    }

    // Validate required fields
    const requiredFields = ['question', 'expectedOutput', 'difficulty', 'category'];
    for (const field of requiredFields) {
      if (!parsedQuestion[field]) {
        throw new Error(`Missing required field in AI response: ${field}`);
      }
    }

    // Clean and validate the question data
    return {
      id: Date.now().toString(),
      question: parsedQuestion.question.trim(),
      expectedOutput: parsedQuestion.expectedOutput.trim(),
      difficulty: parsedQuestion.difficulty.toLowerCase(),
      category: parsedQuestion.category.trim(),
      hints: Array.isArray(parsedQuestion.hints) ? parsedQuestion.hints.map(h => h.trim()) : []
    };

  } catch (error) {
    console.error('Question generation error:', error);
    throw error instanceof Error ? error : new Error('Failed to generate question');
  }
}

export async function checkAnswer(question: Question, userCode: string, language: string): Promise<SubmissionResult> {
  try {
    const systemPrompt = `Evaluate this code submission:

Question:
${question.question}

Expected Output:
${question.expectedOutput}

User's Code:
${userCode}

Return ONLY a JSON object with these exact fields:
{
  "correct": true/false,
  "score": number between 0-10,
  "feedback": "Detailed explanation of the evaluation"
}`;

    const payload = {
      model: "hf:xingyaoww/Qwen2.5-Coder-32B-Instruct-AWQ-128k",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: "Evaluate this submission"
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    };

    const data = await makeAPIRequest('/chat/completions', payload);
    
    if (!data?.data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid API response format');
    }

    const content = data.data.choices[0].message.content.trim();
    return JSON.parse(content);
  } catch (error: any) {
    console.error('Answer checking error:', error);
    if (error.message.includes('INTERNAL_ERROR') || error.message.includes('stream error')) {
      throw new Error('The AI service is temporarily unavailable. Please try again in a few moments.');
    }
    throw error;
  }
}

// Function to save score to database
export async function saveScore(userId: string, questionId: string, score: number, language: string) {
  try {
    const result = {
      questionId,
      score,
      language,
      completedAt: new Date(),
      answers: {},  // We'll add this for compatibility with our AssessmentResult type
      assessmentId: questionId // Using questionId as assessmentId for now
    };

    // Save to Firebase using our service
    await saveAssessmentResult(userId, result);
    
    console.log('Score saved successfully:', {
      userId,
      questionId,
      score,
      language,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error saving score:', error);
    throw new Error('Failed to save score. Please try again.');
  }
}