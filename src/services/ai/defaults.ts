import { AssessmentQuestion } from './types';

const defaultQuestions: Record<string, AssessmentQuestion[]> = {
  JavaScript: [
    {
      id: 'js1',
      type: 'coding',
      language: 'JavaScript',
      question: 'Write a function that reverses a string. The function should take a string as input and return the reversed string.',
      sampleInput: '"hello"',
      sampleOutput: '"olleh"',
      testCases: [
        { input: '"hello"', expectedOutput: '"olleh"' },
        { input: '"world"', expectedOutput: '"dlrow"' }
      ],
      timeLimit: 15,
      difficulty: 'easy',
      hints: ['Try converting the string to an array', 'Use array methods to reverse']
    },
    {
      id: 'js2',
      type: 'coding',
      language: 'JavaScript',
      question: 'Write a function that finds the most frequent element in an array. Return the element that appears the most times.',
      sampleInput: '[1, 2, 3, 2, 4, 2, 5]',
      sampleOutput: '2',
      testCases: [
        { input: '[1, 2, 3, 2, 4, 2, 5]', expectedOutput: '2' },
        { input: '[1, 1, 1, 2, 2, 3]', expectedOutput: '1' }
      ],
      timeLimit: 20,
      difficulty: 'medium',
      hints: ['Use an object to count occurrences', 'Track the maximum count']
    },
    {
      id: 'js3',
      type: 'coding',
      language: 'JavaScript',
      question: 'Write a function that checks if two strings are anagrams. Return true if they are anagrams, false otherwise.',
      sampleInput: '"listen", "silent"',
      sampleOutput: 'true',
      testCases: [
        { input: '"listen", "silent"', expectedOutput: 'true' },
        { input: '"hello", "world"', expectedOutput: 'false' }
      ],
      timeLimit: 15,
      difficulty: 'easy',
      hints: ['Try sorting the characters', 'Consider case sensitivity']
    },
    {
      id: 'js4',
      type: 'coding',
      language: 'JavaScript',
      question: 'Write a function that finds all pairs of numbers in an array that sum to a target value.',
      sampleInput: '[1, 4, 2, 7, 5, 3], target = 7',
      sampleOutput: '[[4,3], [2,5]]',
      testCases: [
        { input: '[1, 4, 2, 7, 5, 3], 7', expectedOutput: '[[4,3], [2,5]]' },
        { input: '[1, 2, 3, 4], 5', expectedOutput: '[[2,3], [1,4]]' }
      ],
      timeLimit: 20,
      difficulty: 'medium',
      hints: ['Consider using a hash map', 'Think about handling duplicates']
    }
  ],
  Python: [
    {
      id: 'py1',
      type: 'coding',
      language: 'Python',
      question: 'Write a function that checks if a string is a palindrome. Return True if the string reads the same forwards and backwards, False otherwise.',
      sampleInput: '"racecar"',
      sampleOutput: 'True',
      testCases: [
        { input: '"racecar"', expectedOutput: 'True' },
        { input: '"hello"', expectedOutput: 'False' }
      ],
      timeLimit: 15,
      difficulty: 'easy',
      hints: ['Compare the string with its reverse', 'Consider using string slicing']
    },
    {
      id: 'py2',
      type: 'coding',
      language: 'Python',
      question: 'Write a function that finds all prime numbers up to a given number n. Return a list of prime numbers.',
      sampleInput: '10',
      sampleOutput: '[2, 3, 5, 7]',
      testCases: [
        { input: '10', expectedOutput: '[2, 3, 5, 7]' },
        { input: '20', expectedOutput: '[2, 3, 5, 7, 11, 13, 17, 19]' }
      ],
      timeLimit: 20,
      difficulty: 'medium',
      hints: ['Consider using the Sieve of Eratosthenes', 'Think about optimization']
    }
  ],
  Java: [
    {
      id: 'java1',
      type: 'coding',
      language: 'Java',
      question: 'Write a function that finds the sum of all even numbers in an array. Return the total sum.',
      sampleInput: '[1, 2, 3, 4, 5, 6]',
      sampleOutput: '12',
      testCases: [
        { input: '[1, 2, 3, 4, 5, 6]', expectedOutput: '12' },
        { input: '[1, 3, 5, 7]', expectedOutput: '0' }
      ],
      timeLimit: 15,
      difficulty: 'easy',
      hints: ['Use modulo operator to check for even numbers', 'Consider using a loop or stream']
    }
  ]
};

// Keep track of recently used questions to avoid repetition
let recentQuestions: string[] = [];

export const getDefaultCodingQuestion = (language: string, difficulty: string): AssessmentQuestion => {
  const questions = defaultQuestions[language] || defaultQuestions.JavaScript;
  
  // Filter questions by difficulty and exclude recently used ones
  const availableQuestions = questions.filter(q => 
    q.difficulty === difficulty && !recentQuestions.includes(q.id)
  );
  
  // If no available questions, clear recent questions and try again
  if (availableQuestions.length === 0) {
    recentQuestions = [];
    return getDefaultCodingQuestion(language, difficulty);
  }
  
  // Get a random question from available ones
  const randomIndex = Math.floor(Math.random() * availableQuestions.length);
  const selectedQuestion = availableQuestions[randomIndex];
  
  // Add to recent questions, keeping only last 3
  recentQuestions.push(selectedQuestion.id);
  if (recentQuestions.length > 3) {
    recentQuestions.shift();
  }
  
  return selectedQuestion;
};

export const defaultHints = [
  'Break down the problem into smaller steps',
  'Consider edge cases in your solution',
  'Think about the time complexity',
  'Test your code with different inputs'
];