import { 
  doc, 
  getDoc, 
  updateDoc,
  arrayUnion,
  DocumentReference,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  bio?: string;
  age?: string;
  grade?: string;
  interests?: string[];
  strengths?: string[];
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic';
  preferences?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
  notificationSettings?: {
    email: {
      courseUpdates: boolean;
      progressReports: boolean;
      newFeatures: boolean;
    };
    push: {
      lessonReminders: boolean;
      assessmentResults: boolean;
      achievements: boolean;
    };
  };
  setupCompleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date;
}

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid !== uid) {
      throw new Error('Unauthorized access');
    }

    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        lastLogin: data.lastLogin?.toDate(),
      } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (uid: string, userData: Partial<UserProfile>): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid !== uid) {
      throw new Error('Unauthorized access');
    }

    await currentUser.getIdToken(true);
    
    const userRef = doc(db, 'users', uid);
    
    const updateData: Record<string, any> = {
      updatedAt: serverTimestamp()
    };
    
    Object.entries(userData).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[key] = value;
      }
    });

    await updateDoc(userRef, updateData);
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    if (error.code === 'permission-denied') {
      throw new Error('You do not have permission to update this profile');
    }
    throw new Error('Failed to update profile. Please try again.');
  }
};

export const updateUserProgress = async (
  uid: string,
  lessonId: string,
  score: number
): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid !== uid) {
      throw new Error('Unauthorized access');
    }

    await currentUser.getIdToken(true);
    
    const userRef: DocumentReference = doc(db, 'users', uid);
    
    await updateDoc(userRef, {
      'progress.completedLessons': arrayUnion(lessonId),
      [`progress.assessmentScores.${lessonId}`]: score,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user progress:', error);
    throw error;
  }
};