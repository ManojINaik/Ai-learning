import axios, { AxiosError } from 'axios';

const BASE_URL = 'https://glhf.chat/api/openai/v1';
const GLHF_API_KEY = 'glhf_18e74141e8dbbf0609d964a189fc33b0';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

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

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function makeAPIRequest(payload: any, retryCount = 0): Promise<any> {
  try {
    const response = await axios.post(
      `${BASE_URL}/chat/completions`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${GLHF_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error('API request failed:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message
      });

      // Check if we should retry
      if (retryCount < MAX_RETRIES && (
        axiosError.message.includes('INTERNAL_ERROR') ||
        axiosError.message.includes('stream error') ||
        axiosError.code === 'ECONNABORTED' ||
        axiosError.response?.status === 500 ||
        axiosError.response?.status === 503
      )) {
        console.log(`Retrying request (${retryCount + 1}/${MAX_RETRIES})...`);
        await delay(RETRY_DELAY * (retryCount + 1)); // Exponential backoff
        return makeAPIRequest(payload, retryCount + 1);
      }
    }
    throw error;
  }
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
        },
        {
          role: "user",
          content: "Generate a coding question that matches these criteria."
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    };

    const data = await makeAPIRequest(payload);
    
    if (!data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid API response format');
    }

    const content = data.choices[0].message.content.trim();
    console.log('Raw content:', content);

    try {
      const parsedQuestion = JSON.parse(content);
      console.log('Parsed question:', parsedQuestion);

      // Validate required fields
      const requiredFields = ['question', 'expectedOutput', 'difficulty', 'category'];
      for (const field of requiredFields) {
        if (!parsedQuestion[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Ensure hints is an array
      if (!Array.isArray(parsedQuestion.hints)) {
        parsedQuestion.hints = [];
      }

      // Add unique ID
      parsedQuestion.id = Date.now().toString();

      return parsedQuestion as Question;
    } catch (parseError) {
      console.error('Error parsing question JSON:', parseError);
      throw new Error('Failed to parse AI response as valid question format');
    }
  } catch (error: any) {
    console.error('Question generation error:', error);
    if (error.message.includes('INTERNAL_ERROR') || error.message.includes('stream error')) {
      throw new Error('The AI service is temporarily unavailable. Please try again in a few moments.');
    }
    throw error;
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

    const data = await makeAPIRequest(payload);
    
    if (!data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid API response format');
    }

    const content = data.choices[0].message.content.trim();
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
    // Replace this with your actual database saving logic
    // For now, we'll just log it
    console.log('Saving score:', {
      userId,
      questionId,
      score,
      language,
      timestamp: new Date().toISOString()
    });

    // Here you would typically make an API call to your backend
    // Example:
    // await axios.post('/api/scores', {
    //   userId,
    //   questionId,
    //   score,
    //   language,
    //   timestamp: new Date().toISOString()
    // });

  } catch (error) {
    console.error('Error saving score:', error);
    throw new Error('Failed to save score. Please try again.');
  }
}
