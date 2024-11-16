import axios, { AxiosError } from 'axios';

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

const GLHF_API_KEY = "glhf_18e74141e8dbbf0609d964a189fc33b0";
const BASE_URL = "https://glhf.chat/api/openai/v1";
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

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
      max_tokens: 2000
    };

    const data = await makeAPIRequest(payload);
    
    if (!data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid API response format');
    }

    const content = data.choices[0].message.content.trim();
    const result = JSON.parse(content);

    // Validate and normalize the result
    const normalizedResult: SkillAssessmentResult = {
      overallScore: Math.max(0, Math.min(10, Number(result.overallScore) || 0)),
      strengths: Array.isArray(result.strengths) ? result.strengths.map(String) : [],
      weaknesses: Array.isArray(result.weaknesses) ? result.weaknesses.map(String) : [],
      recommendations: Array.isArray(result.recommendations) ? result.recommendations.map(String) : [],
      detailedAnalysis: {
        codeQuality: result.detailedAnalysis?.codeQuality || { score: 0, feedback: [] },
        bestPractices: result.detailedAnalysis?.bestPractices || { score: 0, feedback: [] },
        performance: result.detailedAnalysis?.performance || { score: 0, feedback: [] },
        security: result.detailedAnalysis?.security || { score: 0, feedback: [] }
      },
      skillLevel: {
        current: result.skillLevel?.current || skillLevel,
        next: result.skillLevel?.next || 'advanced',
        requirements: Array.isArray(result.skillLevel?.requirements) 
          ? result.skillLevel.requirements.map(String)
          : []
      }
    };

    return normalizedResult;
  } catch (error: any) {
    console.error('Code analysis error:', error);
    if (error.message.includes('INTERNAL_ERROR') || error.message.includes('stream error')) {
      throw new Error('The AI service is temporarily unavailable. Please try again in a few moments.');
    }
    throw error;
  }
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

    const data = await makeAPIRequest(payload);
    
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
