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

const generateSystemPrompt = (domain: string): string => {
  return `Generate 5 multiple-choice questions to test knowledge in ${domain}.
Each question must:
1. Be relevant to ${domain}
2. Have exactly 4 options labeled as A, B, C, D
3. Include one correct answer
4. Be challenging but fair

Respond with a JSON array of questions in this exact format:
[
  {
    "text": "Question text here?",
    "options": ["A) First option", "B) Second option", "C) Third option", "D) Fourth option"],
    "correctAnswer": "A"
  }
]

Important:
- Use plain JSON without any markdown formatting or backticks
- Ensure all strings are in double quotes
- Each question must follow the exact format above.`;
};

export const generateQuestions = async (domain: string): Promise<Question[]> => {
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
      console.error("API Error:", errorData);
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Raw API Response:", data);
    
    const aiResponse = data.choices?.[0]?.text || data.generated_text || data[0]?.generated_text;
    console.log("AI Response before cleaning:", aiResponse);

    if (!aiResponse) {
      throw new Error("No response content from AI");
    }

    // Extract the JSON array from the response
    const jsonMatch = aiResponse.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (!jsonMatch) {
      throw new Error("Could not find valid JSON array in response");
    }

    const cleanedResponse = jsonMatch[0]
      .replace(/\\n/g, "") // Remove escaped newlines
      .replace(/\\"/g, '"') // Fix escaped quotes
      .trim();

    console.log("Cleaned Response:", cleanedResponse);

    try {
      const parsedQuestions: any[] = JSON.parse(cleanedResponse);
      console.log("Parsed Questions:", parsedQuestions);

      if (!Array.isArray(parsedQuestions)) {
        throw new Error("Parsed AI response is not an array");
      }

      return parsedQuestions.map((q, index) => {
        // Validate and clean options format
        const cleanOptions = q.options.map(opt => {
          if (!opt.startsWith('A)') && !opt.startsWith('B)') && 
              !opt.startsWith('C)') && !opt.startsWith('D)')) {
            throw new Error(`Invalid option format at question ${index + 1}. Options must start with A), B), C), or D)`);
          }
          return opt.trim();
        });

        if (
          typeof q.text === "string" &&
          Array.isArray(q.options) &&
          q.options.length === 4 &&
          typeof q.correctAnswer === "string" &&
          ["A", "B", "C", "D"].includes(q.correctAnswer)
        ) {
          return {
            id: `q${index + 1}`,
            text: q.text.trim(),
            options: cleanOptions,
            correctAnswer: q.correctAnswer,
          };
        } else {
          console.error("Invalid question format:", q);
          throw new Error(
            `Invalid question format at index ${index}. Expected text, 4 options, and correctAnswer A/B/C/D`
          );
        }
      });
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Failed to parse response:", cleanedResponse);
      throw new Error(`Failed to parse AI response: ${parseError.message}`);
    }
  } catch (error) {
    console.error("Error generating questions:", error);
    throw error;
  }
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
