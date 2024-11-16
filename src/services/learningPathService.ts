import axios from 'axios';

export interface LearningStep {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  modules: string[];
  prerequisites: string[];
  learningOutcomes: string[];
  relevanceScore?: number;
}

export interface LearningProfile {
  completedCourses: string[];
  interests: string[];
  currentSkillLevel: string;
  preferredLearningStyle: string;
  learningGoals: string[];
}

const calculateRelevanceScore = (step: Partial<LearningStep>, profile: LearningProfile): number => {
  let score = 0;
  const weights = {
    skillLevel: 0.3,
    interests: 0.25,
    goals: 0.25,
    prerequisites: 0.2
  };

  // Skill level alignment
  const skillLevels = ['beginner', 'intermediate', 'advanced'];
  const profileSkillIndex = skillLevels.indexOf(profile.currentSkillLevel.toLowerCase());
  const stepSkillIndex = skillLevels.indexOf(step.difficulty || '');
  if (profileSkillIndex !== -1 && stepSkillIndex !== -1) {
    const skillDiff = Math.abs(profileSkillIndex - stepSkillIndex);
    score += weights.skillLevel * (1 - skillDiff * 0.3);
  }

  // Interest alignment
  const interestScore = profile.interests.reduce((acc, interest) => {
    const matchesTitle = (step.title || '').toLowerCase().includes(interest.toLowerCase());
    const matchesDescription = (step.description || '').toLowerCase().includes(interest.toLowerCase());
    return acc + (matchesTitle ? 0.6 : 0) + (matchesDescription ? 0.4 : 0);
  }, 0) / Math.max(1, profile.interests.length);
  score += weights.interests * interestScore;

  // Learning goals alignment
  const goalScore = profile.learningGoals.reduce((acc, goal) => {
    const matchesOutcomes = step.learningOutcomes?.some(outcome => 
      outcome.toLowerCase().includes(goal.toLowerCase())
    ) || false;
    const matchesDescription = (step.description || '').toLowerCase().includes(goal.toLowerCase());
    return acc + (matchesOutcomes ? 0.7 : 0) + (matchesDescription ? 0.3 : 0);
  }, 0) / Math.max(1, profile.learningGoals.length);
  score += weights.goals * goalScore;

  // Prerequisites completion
  if (step.prerequisites && step.prerequisites.length > 0) {
    const completedPrereqs = step.prerequisites.filter(prereq =>
      profile.completedCourses.some(course => 
        course.toLowerCase().includes(prereq.toLowerCase())
      )
    ).length;
    score += weights.prerequisites * (completedPrereqs / step.prerequisites.length);
  } else {
    score += weights.prerequisites;
  }

  return Math.min(10, Math.max(0, score * 10));
};

const parseAIResponse = (response: string): LearningStep[] => {
  try {
    const steps: LearningStep[] = [];
    const sections = response.split(/Step \d+:/i).filter(Boolean);

    sections.forEach((section, index) => {
      const titleMatch = section.match(/Title:\s*([^\n]+)/);
      const descriptionMatch = section.match(/Description:\s*([^\n]+)/);
      const difficultyMatch = section.match(/Difficulty:\s*(beginner|intermediate|advanced)/i);
      const durationMatch = section.match(/Duration:\s*([^\n]+)/);
      const modulesMatch = section.match(/Key Modules:\s*([\s\S]*?)(?=Prerequisites:|Learning Outcomes:|$)/);
      const prerequisitesMatch = section.match(/Prerequisites:\s*([\s\S]*?)(?=Learning Outcomes:|$)/);
      const outcomesMatch = section.match(/Learning Outcomes:\s*([\s\S]*?)(?=$)/);

      if (titleMatch) {
        const step: LearningStep = {
          id: `step-${index + 1}`,
          title: titleMatch[1].trim(),
          description: descriptionMatch ? descriptionMatch[1].trim() : '',
          difficulty: (difficultyMatch ? difficultyMatch[1].toLowerCase() : 'beginner') as 'beginner' | 'intermediate' | 'advanced',
          duration: durationMatch ? durationMatch[1].trim() : '2-3 weeks',
          modules: modulesMatch 
            ? modulesMatch[1].split('\n').map(m => m.replace(/^-\s*/, '').trim()).filter(Boolean)
            : [],
          prerequisites: prerequisitesMatch
            ? prerequisitesMatch[1].split('\n').map(p => p.replace(/^-\s*/, '').trim()).filter(Boolean)
            : [],
          learningOutcomes: outcomesMatch
            ? outcomesMatch[1].split('\n').map(o => o.replace(/^-\s*/, '').trim()).filter(Boolean)
            : []
        };
        steps.push(step);
      }
    });

    return steps;
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return [];
  }
};

export const generateLearningPath = async (profile: LearningProfile): Promise<LearningStep[]> => {
  try {
    const API_ENDPOINT = 'https://glhf.chat/api/openai/v1';
    const prompt = `
      Generate a personalized learning path for a student with the following profile:
      - Current Skill Level: ${profile.currentSkillLevel}
      - Learning Style: ${profile.preferredLearningStyle}
      - Interests: ${profile.interests.join(', ')}
      - Learning Goals: ${profile.learningGoals.join(', ')}
      - Completed Courses: ${profile.completedCourses.join(', ')}

      Create a detailed, step-by-step learning path that:
      1. Matches their current skill level and gradually progresses
      2. Aligns with their preferred learning style (${profile.preferredLearningStyle})
      3. Incorporates their specific interests and goals
      4. Builds upon their completed courses
      5. Includes practical exercises and assessments
      6. Provides clear learning outcomes for each step

      Format each step as follows:
      Step [number]:
      Title: [concise title]
      Description: [detailed description]
      Difficulty: [beginner/intermediate/advanced]
      Duration: [estimated time]
      Key Modules:
      - [module 1]
      - [module 2]
      Prerequisites:
      - [prerequisite 1]
      - [prerequisite 2]
      Learning Outcomes:
      - [outcome 1]
      - [outcome 2]
    `;

    const response = await axios.post(API_ENDPOINT, {
      model: 'Qwen2.5-Coder-32B-Instruct-AWQ-128k',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educational AI that creates personalized learning paths.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.REACT_APP_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    let steps = parseAIResponse(response.data.choices[0].message.content);
    
    // Calculate relevance scores for each step
    steps = steps.map(step => ({
      ...step,
      relevanceScore: calculateRelevanceScore(step, profile)
    }));

    // Ensure step diversity and optimize order
    steps = ensureStepDiversity(steps);
    steps = optimizeStepOrder(steps, profile);

    return steps;
  } catch (error) {
    console.error('Error generating learning path:', error);
    throw new Error('Failed to generate learning path. Please try again.');
  }
};

// Helper function to ensure step diversity
const ensureStepDiversity = (steps: LearningStep[]): LearningStep[] => {
  const uniqueSteps: LearningStep[] = [];
  const titleSimilarityThreshold = 0.6;
  const descSimilarityThreshold = 0.7;

  for (const step of steps) {
    const isDuplicate = uniqueSteps.some(existingStep => {
      const titleSimilarity = calculateStringSimilarity(step.title, existingStep.title);
      const descSimilarity = calculateStringSimilarity(step.description, existingStep.description);
      return titleSimilarity > titleSimilarityThreshold || descSimilarity > descSimilarityThreshold;
    });

    if (!isDuplicate) {
      uniqueSteps.push(step);
    }
  }

  return uniqueSteps;
};

// Helper function to calculate string similarity (Levenshtein distance based)
const calculateStringSimilarity = (str1: string, str2: string): number => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer.toLowerCase(), shorter.toLowerCase());
  return (longer.length - editDistance) / longer.length;
};

// Levenshtein distance calculation
const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix: number[][] = [];

  for (let i = 0; i <= str1.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str2.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str1.length; i++) {
    for (let j = 1; j <= str2.length; j++) {
      if (str1[i-1] === str2[j-1]) {
        matrix[i][j] = matrix[i-1][j-1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i-1][j-1] + 1,  // substitution
          matrix[i][j-1] + 1,    // insertion
          matrix[i-1][j] + 1     // deletion
        );
      }
    }
  }

  return matrix[str1.length][str2.length];
};

// Optimize step order based on progression logic and relevance
const optimizeStepOrder = (steps: LearningStep[], profile: LearningProfile): LearningStep[] => {
  const skillLevels = ['beginner', 'intermediate', 'advanced'];
  const currentLevelIndex = skillLevels.indexOf(profile.currentSkillLevel.toLowerCase());

  return steps.sort((a, b) => {
    // First, consider the difficulty progression
    const aDifficultyIndex = skillLevels.indexOf(a.difficulty);
    const bDifficultyIndex = skillLevels.indexOf(b.difficulty);
    
    // Ensure proper difficulty progression based on current level
    const aDifficultyScore = Math.abs(aDifficultyIndex - currentLevelIndex);
    const bDifficultyScore = Math.abs(bDifficultyIndex - currentLevelIndex);
    
    if (aDifficultyScore !== bDifficultyScore) {
      return aDifficultyScore - bDifficultyScore;
    }
    
    // If difficulty is the same, consider relevance score
    return (b.relevanceScore || 0) - (a.relevanceScore || 0);
  });
};