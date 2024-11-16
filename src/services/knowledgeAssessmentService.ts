import axios from 'axios';

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  domain: string;
  topic: string;
}

export interface AssessmentResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  detailedFeedback: string;
  recommendedTopics: string[];
  strengthAreas: string[];
  improvementAreas: string[];
}

const MAX_RETRIES = 5; // Increased retries
const RETRY_DELAY = 2000; // Increased initial delay to 2 seconds
const TIMEOUT = 60000; // Increased to 60 seconds
const API_KEY = 'glhf_18e74141e8dbbf0609d964a189fc33b0';
const API_URL = 'https://glhf.chat/api/openai/v1/chat/completions';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const topics: Record<string, string[]> = {
  'Web Development': ['React', 'JavaScript', 'HTML/CSS', 'State Management', 'API Integration', 'Performance Optimization', 'Security', 'Testing', 'Frameworks', 'Build Tools'],
  'Machine Learning': ['Neural Networks', 'Deep Learning', 'Natural Language Processing', 'Computer Vision', 'Reinforcement Learning', 'Model Optimization', 'Feature Engineering', 'Model Evaluation', 'Data Preprocessing', 'Model Deployment'],
  'Data Structures': ['Arrays', 'Trees', 'Graphs', 'Sorting', 'Searching', 'Dynamic Programming', 'Hashing', 'Heaps', 'Linked Lists', 'Stacks and Queues'],
  'DevOps': ['Containers', 'CI/CD', 'Infrastructure', 'Monitoring', 'Security', 'Scalability', 'Networking', 'Cloud Computing', 'Serverless Architecture']
};

const generatePrompt = (domain: string, difficulty: string, count: number) => {
  const domainTopics = topics[domain as keyof typeof topics] || [];
  
  return `Generate ${count} multiple-choice questions for a ${difficulty} level assessment in ${domain}.

Requirements:
1. Questions should test practical knowledge and understanding
2. Each question should have exactly 4 options
3. Include a clear explanation for the correct answer
4. Cover different topics from: ${domainTopics.join(', ')}
5. Return response in this exact JSON format:
{
  "questions": [
    {
      "question": "question text",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": "exact text of correct option",
      "explanation": "detailed explanation",
      "topic": "specific topic from the list"
    }
  ]
}`;
};

export const generateQuestions = async (domain: string, difficulty: string = 'intermediate', count: number = 10): Promise<Question[]> => {
  let retries = 0;
  let lastError: Error | null = null;

  while (retries < MAX_RETRIES) {
    try {
      console.log(`Attempt ${retries + 1} to generate questions...`);
      
      const response = await axios.post(
        API_URL,
        {
          model: "hf:xingyaoww/Qwen2.5-Coder-32B-Instruct-AWQ-128k",
          messages: [
            {
              role: "system",
              content: "You are an expert in creating technical assessment questions. Generate questions that test practical knowledge and understanding."
            },
            {
              role: "user",
              content: generatePrompt(domain, difficulty, count)
            }
          ],
          temperature: 0.7,
          max_tokens: 3000
        },
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: TIMEOUT
        }
      );

      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from API');
      }

      const parsedResponse = JSON.parse(content);
      
      if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
        throw new Error('Invalid response format from API');
      }

      const validQuestions = parsedResponse.questions.filter((q: any) => 
        q.question && 
        Array.isArray(q.options) && 
        q.options.length === 4 &&
        q.correctAnswer && 
        q.explanation &&
        q.topic
      );

      if (validQuestions.length < count * 0.8) {
        throw new Error('Insufficient valid questions generated');
      }

      return validQuestions.map((q: any, index: number) => ({
        ...q,
        id: `${domain.toLowerCase()}-${index + 1}`,
        domain,
        difficulty: difficulty
      }));

    } catch (error) {
      console.error(`Attempt ${retries + 1} failed:`, error);
      lastError = error as Error;
      retries++;
      
      if (retries < MAX_RETRIES) {
        const delay = RETRY_DELAY * Math.pow(2, retries - 1); // Exponential backoff
        console.log(`Retrying in ${delay/1000} seconds...`);
        await sleep(delay);
      }
    }
  }

  throw new Error(
    `Failed to generate questions after ${MAX_RETRIES} attempts. ` +
    `Last error: ${lastError?.message || 'Unknown error'}. ` +
    'Please try again later.'
  );
};

export const evaluateAnswers = async (questions: Question[], userAnswers: Record<string, string>): Promise<AssessmentResult> => {
  try {
    const correctAnswers = questions.filter(q => userAnswers[q.id] === q.correctAnswer).length;
    const score = (correctAnswers / questions.length) * 100;

    // Group questions by topic for analysis
    const topicResults = questions.reduce((acc, q) => {
      const isCorrect = userAnswers[q.id] === q.correctAnswer;
      if (!acc[q.topic]) {
        acc[q.topic] = { correct: 0, total: 0 };
      }
      acc[q.topic].total++;
      if (isCorrect) acc[q.topic].correct++;
      return acc;
    }, {} as Record<string, { correct: number; total: number; }>);

    // Calculate strengths and improvement areas
    const strengthAreas = Object.entries(topicResults)
      .filter(([_, stats]) => (stats.correct / stats.total) >= 0.7)
      .map(([topic]) => topic);

    const improvementAreas = Object.entries(topicResults)
      .filter(([_, stats]) => (stats.correct / stats.total) < 0.7)
      .map(([topic]) => topic);

    // Ensure we have at least one area in each category
    if (strengthAreas.length === 0) {
      const bestTopic = Object.entries(topicResults)
        .sort(([, a], [, b]) => (b.correct / b.total) - (a.correct / a.total))[0];
      if (bestTopic) {
        strengthAreas.push(bestTopic[0]);
      }
    }

    if (improvementAreas.length === 0) {
      improvementAreas.push(questions[0].topic);
    }

    try {
      // Try to get AI-generated feedback
      const response = await axios.post(
        API_URL,
        {
          model: "hf:mistralai/Mistral-7B-Instruct-v0.3",
          messages: [
            {
              role: "system",
              content: "You are an expert in evaluating technical assessments and providing constructive feedback. Always respond with valid JSON."
            },
            {
              role: "user",
              content: `
                Analyze these assessment results for ${questions[0].domain}:
                Score: ${score}%
                Questions: ${questions.length}
                Correct: ${correctAnswers}
                
                Topic Performance:
                ${Object.entries(topicResults)
                  .map(([topic, stats]) => 
                    `${topic}: ${stats.correct}/${stats.total} correct (${Math.round((stats.correct/stats.total) * 100)}%)`
                  )
                  .join('\n')}
                
                Provide a JSON response with:
                1. Constructive feedback on performance
                2. Recommended next topics to study
                3. Areas of strength
                4. Areas needing improvement
              `
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: TIMEOUT
        }
      );

      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from API');
      }

      const analysis = JSON.parse(content);
      
      // Validate and ensure all required fields are present
      const result: AssessmentResult = {
        score,
        totalQuestions: questions.length,
        correctAnswers,
        incorrectAnswers: questions.length - correctAnswers,
        detailedFeedback: analysis.detailedFeedback || generateFeedback(score, strengthAreas, improvementAreas, questions[0].domain),
        recommendedTopics: analysis.recommendedTopics || generateRecommendedTopics(questions, strengthAreas, improvementAreas),
        strengthAreas: analysis.strengthAreas || strengthAreas,
        improvementAreas: analysis.improvementAreas || improvementAreas
      };

      return result;

    } catch (aiError) {
      // Fallback to generated feedback if AI fails
      console.log('Using fallback feedback generation due to API failure:', aiError);
      
      return {
        score,
        totalQuestions: questions.length,
        correctAnswers,
        incorrectAnswers: questions.length - correctAnswers,
        detailedFeedback: generateFeedback(score, strengthAreas, improvementAreas, questions[0].domain),
        recommendedTopics: generateRecommendedTopics(questions, strengthAreas, improvementAreas),
        strengthAreas,
        improvementAreas
      };
    }
  } catch (error) {
    console.error('Error evaluating answers:', error);
    throw new Error('Failed to evaluate assessment. Please try again.');
  }
};

// Helper function to generate feedback
const generateFeedback = (
  score: number,
  strengthAreas: string[],
  improvementAreas: string[],
  domain: string
): string => {
  if (score >= 80) {
    return `Excellent performance in ${domain}! You demonstrated strong understanding in ${strengthAreas.join(', ')}. To further advance your skills, consider exploring more advanced topics in ${improvementAreas.length > 0 ? improvementAreas.join(', ') : 'your strong areas'}.`;
  } else if (score >= 60) {
    return `Good progress in ${domain}. You show proficiency in ${strengthAreas.join(', ')}. Focus on strengthening your knowledge in ${improvementAreas.join(', ')} to improve further.`;
  } else {
    return `You're on the right track with ${domain}. ${strengthAreas.length > 0 ? `You're familiar with ${strengthAreas.join(', ')}.` : ''} We recommend focusing on the fundamentals of ${improvementAreas.join(', ')} to build a stronger foundation.`;
  }
};

// Helper function to generate recommended topics
const generateRecommendedTopics = (
  questions: Question[],
  strengthAreas: string[],
  improvementAreas: string[]
): string[] => {
  const recommendedTopics = [
    ...improvementAreas,
    ...questions
      .filter(q => q.difficulty === 'advanced' && !strengthAreas.includes(q.topic))
      .map(q => q.topic)
  ].filter((topic, index, self) => self.indexOf(topic) === index);

  return recommendedTopics.slice(0, 5); // Limit to top 5 recommendations
};
