import { db } from '../config/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc, 
  onSnapshot 
} from 'firebase/firestore';
import type { Resource } from './firebase.service';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: Date;
  lastLogin: Date;
}

export interface Analytics {
  totalUsers: number;
  activeCourses: number;
  completionRate: number;
  userGrowth: number;
  popularResources: Array<{
    title: string;
    views: number;
  }>;
}

// User Management
export const getAllUsers = (callback: (users: AdminUser[]) => void) => {
  return onSnapshot(collection(db, 'users'), (snapshot) => {
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      lastLogin: doc.data().lastLogin?.toDate()
    })) as AdminUser[];
    callback(users);
  });
};

export const updateUserRole = async (userId: string, role: string) => {
  const userRef = doc(db, 'users', userId);
  return updateDoc(userRef, { role });
};

export const grantAdminPrivileges = async (email: string) => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('email', '==', email));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    throw new Error('User not found');
  }

  const userDoc = querySnapshot.docs[0];
  const userRef = doc(db, 'users', userDoc.id);
  
  await updateDoc(userRef, { 
    role: 'admin',
    updatedAt: new Date()
  });

  return userDoc.id;
};

export const deleteUser = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  return deleteDoc(userRef);
};

// Content Management
export const getResources = (callback: (resources: Resource[]) => void) => {
  return onSnapshot(collection(db, 'resources'), (snapshot) => {
    const resources = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Resource[];
    callback(resources);
  });
};

export const addResource = async (resource: Omit<Resource, 'id'>) => {
  return addDoc(collection(db, 'resources'), resource);
};

export const updateResource = async (resourceId: string, data: Partial<Resource>) => {
  const resourceRef = doc(db, 'resources', resourceId);
  return updateDoc(resourceRef, data);
};

export const deleteResource = async (resourceId: string) => {
  const resourceRef = doc(db, 'resources', resourceId);
  return deleteDoc(resourceRef);
};

// Analytics
export const getAnalytics = async (): Promise<Analytics> => {
  // In a real application, you would aggregate this data from various collections
  const usersSnapshot = await getDocs(collection(db, 'users'));
  const coursesSnapshot = await getDocs(collection(db, 'resources'));
  
  return {
    totalUsers: usersSnapshot.size,
    activeCourses: coursesSnapshot.size,
    completionRate: 78,
    userGrowth: 25,
    popularResources: [
      { title: 'JavaScript Fundamentals', views: 1250 },
      { title: 'React Basics', views: 980 },
      { title: 'Node.js Essentials', views: 750 },
      { title: 'TypeScript Introduction', views: 620 }
    ]
  };
};