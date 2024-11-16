import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface ProfileData {
  strengths: string[];
  weaknesses: string[];
  learningStyle: 'visual' | 'auditory' | 'reading' | 'kinesthetic' | '';
  setupCompleted?: boolean;
}

export const getProfileData = async (userId: string): Promise<ProfileData | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        strengths: data.strengths || [],
        weaknesses: data.weaknesses || [],
        learningStyle: data.learningStyle || '',
        setupCompleted: data.setupCompleted
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching profile data:', error);
    throw error;
  }
};

export const updateProfileData = async (userId: string, data: Partial<ProfileData>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating profile data:', error);
    throw error;
  }
};