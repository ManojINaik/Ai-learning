import OpenAI from "openai";

const client = new OpenAI({
  apiKey: import.meta.env.VITE_GLHF_API_KEY,
  baseURL: "https://glhf.chat/api/openai/v1",
  dangerouslyAllowBrowser: true, // Required for browser usage
});

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface AssessmentResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
}

// API response types
interface AICompletionResponse {
  choices?: Array<{
    text?: string;
    message?: {
      content: string;
    };
  }>;
  generated_text?: string;
}

// API error types
interface APIError extends Error {
  status?: number;
  code?: string;
}

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const generateSystemPrompt = (domain: string): string => {
  return `You are an expert assessment generator for ${domain}. Generate 5 high-quality multiple-choice questions that test understanding of key concepts in ${domain}.

Requirements for each question:
1. Test conceptual understanding rather than just factual recall
2. Include 4 options labeled as A), B), C), D)
3. Have exactly one correct answer
4. Ensure distractors (wrong options) are plausible but clearly incorrect
5. Cover different aspects or subtopics within ${domain}
6. Use clear, unambiguous language

Format each question as a JSON object with:
- "text": Clear question statement
- "options": Array of 4 options starting with A), B), C), D)
- "correctAnswer": Single letter A/B/C/D
- "explanation": Brief explanation of the correct answer

Return an array of 5 such questions in valid JSON format.`;
};

export const generateQuestions = async (domain: string): Promise<Question[]> => {
  let retries = 0;
  
  while (retries < MAX_RETRIES) {
    try {
      const response = await fetch("https://glhf.chat/api/openai/v1/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_GLHF_API_KEY}`,
        },
        body: JSON.stringify({
          model: "hf:xingyaoww/Qwen2.5-Coder-32B-Instruct-AWQ-128k",
          prompt: generateSystemPrompt(domain),
          temperature: 0.7,
          max_tokens: 2000,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        throw Object.assign(new Error(errorData.message || `API error: ${response.status}`), {
          status: response.status,
          code: errorData.code,
        });
      }

      const data: AICompletionResponse = await response.json();
      
      // Extract content from various possible response formats
      const aiResponse = data.choices?.[0]?.text || 
                        data.choices?.[0]?.message?.content ||
                        data.generated_text;

      if (!aiResponse) {
        throw new Error("No response content from AI");
      }

      // Extract JSON array from response
      const jsonMatch = aiResponse.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (!jsonMatch) {
        throw new Error("Could not find valid JSON array in response");
      }

      const cleanedResponse = jsonMatch[0]
        .replace(/\\n/g, "")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')
        .trim();

      const parsedQuestions = JSON.parse(cleanedResponse);

      if (!Array.isArray(parsedQuestions)) {
        throw new Error("Parsed AI response is not an array");
      }

      // Validate and transform questions
      return parsedQuestions.map((q, index) => {
        // Validate question structure
        if (!q || typeof q !== 'object') {
          throw new Error(`Invalid question object at index ${index}`);
        }

        // Validate required fields
        if (!q.text || !q.options || !q.correctAnswer) {
          throw new Error(`Missing required fields in question ${index + 1}`);
        }

        // Validate options
        if (!Array.isArray(q.options) || q.options.length !== 4) {
          throw new Error(`Question ${index + 1} must have exactly 4 options`);
        }

        // Clean and validate options format
        const cleanOptions = q.options.map((opt: string, optIndex: number) => {
          const option = opt.trim();
          const prefix = String.fromCharCode(65 + optIndex) + ')';
          if (!option.startsWith(prefix)) {
            return `${prefix} ${option}`;
          }
          return option;
        });

        // Validate correct answer
        if (!['A', 'B', 'C', 'D'].includes(q.correctAnswer)) {
          throw new Error(`Invalid correct answer "${q.correctAnswer}" for question ${index + 1}`);
        }

        return {
          id: `q${index + 1}`,
          text: q.text.trim(),
          options: cleanOptions,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || '',
        };
      });

    } catch (error) {
      console.error(`Attempt ${retries + 1} failed:, error`);
      
      if (retries === MAX_RETRIES - 1) {
        throw error instanceof Error ? error : new Error(String(error));
      }

      // Exponential backoff
      await delay(RETRY_DELAY * Math.pow(2, retries));
      retries++;
    }
  }

  throw new Error("Max retries exceeded");
};

export const evaluateAnswers = (
  questions: Question[],
  userAnswers: Record<string, string>
): AssessmentResult => {
  let correctAnswers = 0;
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  questions.forEach((question) => {
    const userAnswer = userAnswers[question.id];
    if (userAnswer === question.correctAnswer) {
      correctAnswers++;
      strengths.push(question.text);
    } else {
      weaknesses.push(question.text);
    }
  });

  const score = (correctAnswers / questions.length) * 100;
  const incorrectAnswers = questions.length - correctAnswers;

  let feedback = "";
  if (score >= 90) {
    feedback = "Excellent! You have a strong understanding of this domain.";
  } else if (score >= 70) {
    feedback = "Good job! You have a solid grasp of the basics with room for improvement.";
  } else if (score >= 50) {
    feedback = "You're on the right track, but there's room for improvement.";
  } else {
    feedback = "Consider reviewing the fundamentals of this domain.";
  }

  return {
    score,
    totalQuestions: questions.length,
    correctAnswers,
    incorrectAnswers,
    feedback,
    strengths,
    weaknesses,
  };
};
