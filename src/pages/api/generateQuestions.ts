import OpenAI from 'openai';
import { NextApiRequest, NextApiResponse } from 'next';

const openai = new OpenAI({
  apiKey: process.env.VITE_GLHF_API_KEY,
  baseURL: process.env.VITE_GLHF_API_URL,
});

const generateSystemPrompt = (domain: string) => {
  return `You are an expert assessment generator for ${domain}. Create 5 multiple-choice questions to test knowledge in ${domain}. 
  Each question should:
  1. Be relevant to ${domain}
  2. Have 4 options (A, B, C, D)
  3. Include one correct answer
  4. Be challenging but fair
  
  Format your response as a JSON array of questions, where each question has:
  - text: the question text
  - options: array of 4 possible answers
  - correctAnswer: the correct option (A, B, C, or D)`;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.VITE_GLHF_API_KEY) {
    return res.status(500).json({ error: 'GLHF API key not configured' });
  }

  try {
    const { domain } = req.body;

    if (!domain) {
      return res.status(400).json({ error: 'Domain is required' });
    }

    const completion = await openai.chat.completions.create({
      model: "hf:mistralai/Mistral-7B-Instruct-v0.3",
      messages: [
        { 
          role: "system", 
          content: generateSystemPrompt(domain)
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    try {
      const parsedQuestions = JSON.parse(response);
      const questions = parsedQuestions.map((q: any, index: number) => ({
        id: `q${index + 1}`,
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer
      }));
      return res.status(200).json({ questions });
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }
  } catch (error) {
    console.error('Error generating questions:', error);
    return res.status(500).json({ error: 'Failed to generate questions' });
  }
}
