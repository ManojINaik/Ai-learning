import axios, { AxiosError, AxiosRequestConfig } from 'axios';

interface SkillAssessmentResult {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  detailedAnalysis: {
    codeQuality?: {
      score: number;
      feedback: string[];
    };
    bestPractices?: {
      score: number;
      feedback: string[];
    };
    performance?: {
      score: number;
      feedback: string[];
    };
    security?: {
      score: number;
      feedback: string[];
    };
  };
  skillLevel: {
    current: string;
    next: string;
    requirements: string[];
  };
}

interface ImprovedCodeResponse {
  improvedCode: string;
  changes: string[];
  explanation: string;
}

interface SkillAssessmentInput {
  code: string;
  language: string;
  skillLevel: string;
  focusAreas: string[];
}

const GLHF_API_KEY = import.meta.env.VITE_GLHF_API_KEY;
const BASE_URL = 'https://glhf.chat/api/openai/v1';

const INITIAL_TIMEOUT = 15000;  // 15 seconds
const MAX_TIMEOUT = 45000;     // 45 seconds
const MAX_RETRIES = 4;
const RETRY_DELAY = 1000;      // 1 second

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: INITIAL_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${GLHF_API_KEY}`
  },
  validateStatus: (status) => status < 500 // Only treat 500+ as errors
});

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface APIRequestConfig extends AxiosRequestConfig {
  retryCount?: number;
  maxRetries?: number;
  retryDelay?: number;
}

async function makeAPIRequest(endpoint: string, payload: any, config: APIRequestConfig = {}): Promise<any> {
  const retryCount = config.retryCount || 0;
  const maxRetries = config.maxRetries || MAX_RETRIES;
  const retryDelay = config.retryDelay || RETRY_DELAY;
  const currentTimeout = Math.min(INITIAL_TIMEOUT * Math.pow(1.5, retryCount), MAX_TIMEOUT);

  try {
    console.log(`Making API request (attempt ${retryCount + 1}/${maxRetries + 1})`);
    
    const response = await axiosInstance({
      method: 'POST',
      url: endpoint,
      data: payload,
      timeout: currentTimeout,
      ...config
    });

    // Handle rate limiting
    if (response.status === 429) {
      if (retryCount < maxRetries) {
        const retryAfter = parseInt(response.headers['retry-after']) * 1000 || retryDelay * Math.pow(2, retryCount);
        console.log(`Rate limited, retrying after ${retryAfter}ms...`);
        await delay(retryAfter);
        return makeAPIRequest(endpoint, payload, { ...config, retryCount: retryCount + 1 });
      }
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    // Handle successful response
    if (response.status === 200) {
      return response.data;
    }

    throw new Error(response.data?.error?.message || `Request failed with status ${response.status}`);

  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      // Handle timeouts
      if (axiosError.code === 'ECONNABORTED' || axiosError.message.includes('timeout')) {
        if (retryCount < maxRetries) {
          console.log(`Request timed out after ${currentTimeout}ms, retrying...`);
          await delay(retryDelay * Math.pow(1.5, retryCount));
          return makeAPIRequest(endpoint, payload, { ...config, retryCount: retryCount + 1 });
        }
        throw new Error('The server is taking too long to respond. Please try again later.');
      }

      // Handle network errors
      if (axiosError.code === 'ERR_NETWORK') {
        if (retryCount < maxRetries) {
          console.log('Network error, retrying...');
          await delay(retryDelay * Math.pow(1.5, retryCount));
          return makeAPIRequest(endpoint, payload, { ...config, retryCount: retryCount + 1 });
        }
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      }

      // Handle HTTP errors
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
            if (retryCount < maxRetries) {
              console.log(`Server error (${status}), retrying...`);
              await delay(retryDelay * Math.pow(2, retryCount));
              return makeAPIRequest(endpoint, payload, { ...config, retryCount: retryCount + 1 });
            }
            throw new Error('The server is experiencing issues. Please try again later.');
          default:
            throw new Error(`Request failed with status ${status}`);
        }
      }
    }
    
    throw new Error('An unexpected error occurred. Please try again.');
  }
}

export async function analyzeCode(
  code: string,
  language: string,
  skillLevel: string,
  focusAreas: string[]
): Promise<SkillAssessmentResult> {
  try {
    console.log('Analyzing code with params:', { language, skillLevel, focusAreas });

    const systemPrompt = `You are an expert code analyzer. Analyze this code and return a JSON object with comprehensive feedback.
The analysis should focus on: ${focusAreas.join(', ')}.
Current skill level: ${skillLevel}

Return ONLY a JSON object with these exact fields:
{
  "overallScore": number (0-10),
  "strengths": ["list of strengths"],
  "weaknesses": ["list of weaknesses"],
  "recommendations": ["specific improvement suggestions"],
  "detailedAnalysis": {
    "codeQuality": {
      "score": number (0-10),
      "feedback": ["specific feedback points"]
    },
    "bestPractices": {
      "score": number (0-10),
      "feedback": ["specific feedback points"]
    },
    "performance": {
      "score": number (0-10),
      "feedback": ["specific feedback points"]
    },
    "security": {
      "score": number (0-10),
      "feedback": ["specific feedback points"]
    }
  },
  "skillLevel": {
    "current": "assessed current level",
    "next": "next skill level to aim for",
    "requirements": ["specific requirements to reach next level"]
  }
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
          content: code
        }
      ],
      temperature: 0.3,
      max_tokens: 1500,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    };

    const data = await makeAPIRequest('/chat/completions', payload, {
      timeout: 30000,
      maxRetries: 3,
      retryDelay: 2000
    });
    
    if (!data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from AI service');
    }

    const content = data.choices[0].message.content.trim();
    let result: SkillAssessmentResult;

    try {
      result = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse the AI service response');
    }

    // Validate and normalize the result
    return {
      overallScore: Math.max(0, Math.min(10, Number(result.overallScore) || 0)),
      strengths: Array.isArray(result.strengths) ? result.strengths.map(String) : [],
      weaknesses: Array.isArray(result.weaknesses) ? result.weaknesses.map(String) : [],
      recommendations: Array.isArray(result.recommendations) ? result.recommendations.map(String) : [],
      detailedAnalysis: {
        codeQuality: normalizeAnalysis(result.detailedAnalysis?.codeQuality),
        bestPractices: normalizeAnalysis(result.detailedAnalysis?.bestPractices),
        performance: normalizeAnalysis(result.detailedAnalysis?.performance),
        security: normalizeAnalysis(result.detailedAnalysis?.security)
      },
      skillLevel: {
        current: result.skillLevel?.current || skillLevel,
        next: result.skillLevel?.next || getNextLevel(skillLevel),
        requirements: Array.isArray(result.skillLevel?.requirements) 
          ? result.skillLevel.requirements.map(String)
          : []
      }
    };
  } catch (error) {
    console.error('Code analysis error:', error);
    throw error instanceof Error ? error : new Error('Failed to analyze code');
  }
}

function normalizeAnalysis(analysis: any) {
  return {
    score: Math.max(0, Math.min(10, Number(analysis?.score) || 0)),
    feedback: Array.isArray(analysis?.feedback) ? analysis.feedback.map(String) : []
  };
}

function getNextLevel(currentLevel: string): string {
  const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
  const currentIndex = levels.indexOf(currentLevel.toLowerCase());
  return currentIndex >= 0 && currentIndex < levels.length - 1 
    ? levels[currentIndex + 1] 
    : 'expert';
}

export async function generateImprovedCode(
  code: string,
  language: string,
  improvements: string[]
): Promise<ImprovedCodeResponse> {
  console.log('Starting code improvement with:', { language, improvements });
  
  try {
    // Input validation
    if (!code?.trim()) {
      console.error('Empty code provided');
      throw new Error('Please provide some code to analyze');
    }

    if (!language?.trim()) {
      console.error('No language specified');
      throw new Error('Programming language must be specified');
    }

    if (!improvements?.length) {
      console.error('No improvements specified');
      throw new Error('Please select at least one improvement area');
    }

    // First try with Mixtral API
    try {
      console.log('Attempting Mixtral API...');
      const mixtralResponse = await axios.post(
        'https://iiced-mixtral-46-7b-fastapi.hf.space/generate/',
        {
          inputs: `You are an expert code improver. Improve the following ${language} code based on these improvements: ${improvements.join(', ')}.

Please provide the response in this exact JSON format:
{
  "description": "A brief description of the improvements made",
  "code": "The complete improved code",
  "explanation": "A detailed explanation of what the code does and why the improvements help"
}

Code to improve:
${code}`,
          parameters: {
            temperature: 0.3,
            max_new_tokens: 2000,
            repetition_penalty: 1.1
          }
        },
        {
          timeout: 30000 // 30 second timeout
        }
      );

      console.log('Mixtral API response received');

      if (mixtralResponse.data && mixtralResponse.data.generated_text) {
        const jsonMatch = mixtralResponse.data.generated_text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const result = JSON.parse(jsonMatch[0]);
            if (result.description && result.code && result.explanation) {
              console.log('Successfully parsed Mixtral response');
              return {
                improvedCode: result.code,
                changes: improvements,
                explanation: result.explanation
              };
            }
          } catch (parseError) {
            console.error('Failed to parse Mixtral response:', parseError);
          }
        }
      }
    } catch (mixtralError) {
      console.error('Mixtral API error:', mixtralError);
    }

    console.log('Falling back to GLHF API...');

    // Fallback to GLHF API
    const systemPrompt = `You are an expert code improver. Your task is to improve the provided code while maintaining its core functionality.

Focus on these specific improvements: ${improvements.join(', ')}.

Respond with a JSON object in this exact format:
{
  "description": "A brief description of the improvements made",
  "code": "The complete improved code with all necessary imports and dependencies",
  "explanation": "A detailed explanation of what the code does and why the improvements help"
}

Important:
1. Keep descriptions clear and concise
2. Include all necessary imports and dependencies in the code
3. Maintain proper code formatting with correct indentation
4. Explain improvements in plain English
5. Focus on readability and best practices
6. Ensure the code is complete and can run immediately`;

    const response = await axios.post(
      `${BASE_URL}/chat/completions`,
      {
        model: "hf:xingyaoww/Qwen2.5-Coder-32B-Instruct-AWQ-128k",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `Please improve this ${language} code:\n\n${code}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${GLHF_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    console.log('GLHF API response received');

    if (!response.data?.choices?.[0]?.message?.content) {
      console.error('Invalid response structure from GLHF API');
      throw new Error('Invalid response from API');
    }

    const content = response.data.choices[0].message.content.trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in GLHF response');
      throw new Error('Invalid response format from API');
    }

    try {
      const result = JSON.parse(jsonMatch[0]);
      
      // Validate the response format
      if (!result.description || !result.code || !result.explanation) {
        console.error('Missing required fields in API response');
        return {
          improvedCode: code,  // Return original code if improvement fails
          changes: improvements,
          explanation: `The code has been analyzed for ${improvements.join(', ')}. 
The core functionality remains the same, with improvements focused on best practices and readability.

Key improvements attempted:
${improvements.map(imp => `- ${imp}`).join('\n')}`
        };
      }

      console.log('Successfully generated improved code');
      return {
        improvedCode: result.code,
        changes: improvements,
        explanation: result.explanation
      };

    } catch (parseError) {
      console.error('Failed to parse GLHF response:', parseError);
      throw new Error('Failed to parse API response');
    }

  } catch (error: any) {
    console.error('Error in generateImprovedCode:', error);
    
    // Return a graceful fallback response
    return {
      improvedCode: code,  // Return original code if improvement fails
      changes: improvements,
      explanation: `We attempted to improve the code focusing on:
${improvements.map(imp => `- ${imp}`).join('\n')}

However, we encountered an issue during the improvement process: ${error.message}
The original code has been preserved to maintain functionality.
You can try again or modify the code manually based on the suggested improvements.`
    };
  }
}

export async function suggestLearningResources(
  weaknesses: string[],
  language: string,
  skillLevel: string
): Promise<string[]> {
  try {
    const systemPrompt = `Based on these code weaknesses, suggest learning resources.
Return ONLY a JSON array of strings, each containing a specific resource suggestion.
Focus on ${language} at ${skillLevel} level.
Example: ["Specific resource 1", "Specific resource 2"]`;

    const payload = {
      model: "hf:xingyaoww/Qwen2.5-Coder-32B-Instruct-AWQ-128k",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: JSON.stringify(weaknesses)
        }
      ],
      temperature: 0.5,
      max_tokens: 1000
    };

    const data = await makeAPIRequest('/chat/completions', payload);
    
    if (!data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid API response format');
    }

    const content = data.choices[0].message.content.trim();
    console.log('Raw resources content:', content);

    try {
      const resources = JSON.parse(content);
      if (!Array.isArray(resources)) {
        throw new Error('Resources must be an array');
      }
      return resources.map(String);
    } catch (parseError) {
      console.error('Error parsing resources:', parseError);
      return ['Error: Could not generate learning resources. Please try again.'];
    }
  } catch (error: any) {
    console.error('Resource suggestion error:', error);
    return ['Error: Could not fetch learning resources. Please try again.'];
  }
}
