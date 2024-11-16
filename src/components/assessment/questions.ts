export interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const questions: Question[] = [
  {
    question: "What is the primary purpose of a variable in programming?",
    options: [
      "To store and manage data",
      "To create visual effects",
      "To connect to the internet",
      "To print text on screen"
    ],
    correctAnswer: "To store and manage data",
    difficulty: "easy"
  },
  {
    question: "Which of these is NOT a common programming data type?",
    options: [
      "Integer",
      "String",
      "Picture",
      "Boolean"
    ],
    correctAnswer: "Picture",
    difficulty: "easy"
  },
  {
    question: "What does HTML stand for?",
    options: [
      "Hyper Text Markup Language",
      "High Tech Modern Language",
      "Hyper Transfer Machine Language",
      "Home Tool Markup Language"
    ],
    correctAnswer: "Hyper Text Markup Language",
    difficulty: "easy"
  },
  {
    question: "What is the difference between '==' and '===' in JavaScript?",
    options: [
      "They are exactly the same",
      "'===' checks both value and type, while '==' only checks value",
      "'==' is used for numbers, '===' for strings",
      "'===' is deprecated and shouldn't be used"
    ],
    correctAnswer: "'===' checks both value and type, while '==' only checks value",
    difficulty: "medium"
  },
  {
    question: "What is a closure in JavaScript?",
    options: [
      "A function that has access to variables in its outer scope",
      "A way to close browser windows",
      "A method to end program execution",
      "A type of loop structure"
    ],
    correctAnswer: "A function that has access to variables in its outer scope",
    difficulty: "medium"
  },
  {
    question: "What is the purpose of the 'async/await' keywords in JavaScript?",
    options: [
      "To handle asynchronous operations more elegantly",
      "To make code run faster",
      "To create loops",
      "To define variables"
    ],
    correctAnswer: "To handle asynchronous operations more elegantly",
    difficulty: "medium"
  },
  {
    question: "What is the time complexity of binary search?",
    options: [
      "O(log n)",
      "O(n)",
      "O(n²)",
      "O(1)"
    ],
    correctAnswer: "O(log n)",
    difficulty: "hard"
  },
  {
    question: "What is the difference between process and thread?",
    options: [
      "Processes share memory space, threads don't",
      "Threads share memory space, processes don't",
      "They are exactly the same",
      "Threads can only run on Windows"
    ],
    correctAnswer: "Threads share memory space, processes don't",
    difficulty: "hard"
  },
  {
    question: "What is a memory leak?",
    options: [
      "When a program fails to release memory that is no longer needed",
      "When a computer runs out of RAM",
      "When data is stolen from memory",
      "When memory chips physically leak"
    ],
    correctAnswer: "When a program fails to release memory that is no longer needed",
    difficulty: "hard"
  }
];