import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  setDoc,
  getDoc,
  Timestamp
} from 'firebase/firestore';

// Interfaces
export interface Assessment {
  id: string;
  type: string;
  score: number;
  completedAt: Date;
  userId: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer?: string;
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'video' | 'article' | 'tutorial' | 'course';
  level: string;
  duration: string;
  tags: string[];
}

export interface AssessmentResult {
  userId: string;
  assessmentId: string;
  score: number;
  answers: Record<string, string>;
  completedAt: Date;
}

// Resource Management
export const addResource = async (resource: Partial<Resource>) => {
  try {
    const docRef = await addDoc(collection(db, 'resources'), resource);
    return { id: docRef.id };
  } catch (error) {
    console.error('Error adding resource:', error);
    throw error;
  }
};

export const updateResource = async (id: string, data: Partial<Resource>) => {
  try {
    const resourceRef = doc(db, 'resources', id);
    await updateDoc(resourceRef, data);
  } catch (error) {
    console.error('Error updating resource:', error);
    throw error;
  }
};

export const deleteResource = async (id: string) => {
  try {
    const resourceRef = doc(db, 'resources', id);
    await deleteDoc(resourceRef);
  } catch (error) {
    console.error('Error deleting resource:', error);
    throw error;
  }
};

// Assessment Management
export const addAssessment = async (assessment: Partial<Assessment>) => {
  try {
    const docRef = await addDoc(collection(db, 'assessments'), {
      ...assessment,
      completedAt: new Date(),
    });
    return { id: docRef.id };
  } catch (error) {
    console.error('Error adding assessment:', error);
    throw error;
  }
};

// User Management
export const createUserDocument = async (userId: string, userData: any) => {
  try {
    const userRef = doc(db, 'users', userId);
    const now = Timestamp.now();
    
    // Check if the user should be an admin
    const isAdminEmail = userData.email === 'naik97059@gmail.com';
    const role = isAdminEmail ? 'admin' : (userData.role || 'user');

    const userDocData = {
      ...userData,
      role,
      createdAt: now,
      updatedAt: now,
      assessments: [],
      preferences: {}
    };

    await setDoc(userRef, userDocData);
    console.log('User document created/updated:', { userId, role, email: userData.email });
    return { id: userId, ...userDocData };
  } catch (error) {
    console.error('Error creating user document:', error);
    throw error;
  }
};

export const getUserDocument = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      // Double-check admin status
      if (userData.email === 'naik97059@gmail.com' && userData.role !== 'admin') {
        // Update to admin if needed
        await setDoc(userRef, { ...userData, role: 'admin', updatedAt: Timestamp.now() }, { merge: true });
        return { ...userData, role: 'admin' };
      }
      return userData;
    }
    return null;
  } catch (error) {
    console.error('Error getting user document:', error);
    throw error;
  }
};

// Mock data functions
export const getUserAssessments = (userId: string, callback: (assessments: Assessment[]) => void) => {
  const mockAssessments: Assessment[] = [
    {
      id: '1',
      type: 'Knowledge Assessment',
      score: 85,
      completedAt: new Date(),
      userId
    },
    {
      id: '2',
      type: 'Skills Assessment',
      score: 92,
      completedAt: new Date(),
      userId
    }
  ];

  callback(mockAssessments);
  return () => {};
};

export const getAssessmentQuestions = async (domain: string): Promise<Question[]> => {
  const mockQuestions: Question[] = [
    {
      id: '1',
      text: 'What is the primary purpose of React hooks?',
      options: [
        'To add state to functional components',
        'To create class components',
        'To style components',
        'To handle routing'
      ],
      correctAnswer: 'To add state to functional components'
    },
    {
      id: '2',
      text: 'What does TypeScript add to JavaScript?',
      options: [
        'Static typing',
        'New runtime features',
        'Database integration',
        'Server-side rendering'
      ],
      correctAnswer: 'Static typing'
    }
  ];

  return mockQuestions;
};

export const getResources = (callback: (resources: Resource[]) => void) => {
  const mockResources: Resource[] = [
    {
      id: '1',
      title: 'Introduction to React',
      description: 'Learn the basics of React development',
      url: 'https://example.com/react-intro',
      type: 'tutorial',
      level: 'beginner',
      duration: '2 hours',
      tags: ['react', 'frontend', 'beginner']
    },
    {
      id: '2',
      title: 'TypeScript Best Practices',
      description: 'Master TypeScript development',
      url: 'https://example.com/typescript-best-practices',
      type: 'article',
      level: 'intermediate',
      duration: '1 hour',
      tags: ['typescript', 'javascript', 'intermediate']
    }
  ];

  callback(mockResources);
  return () => {};
};

export const saveAssessmentResult = async (userId: string, result: Partial<AssessmentResult>) => {
  try {
    // First check if user document exists
    const userDoc = await getUserDocument(userId);
    if (!userDoc) {
      // Create user document if it doesn't exist
      await createUserDocument(userId, {
        assessments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Create assessment result document
    const assessmentRef = await addDoc(collection(db, 'assessmentResults'), {
      ...result,
      userId,
      completedAt: new Date()
    });

    // Update user's assessments array
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      assessments: userDoc ? [...(userDoc.assessments || []), assessmentRef.id] : [assessmentRef.id],
      updatedAt: new Date()
    });

    return { id: assessmentRef.id };
  } catch (error) {
    console.error('Error saving assessment result:', error);
    throw error;
  }
};
