import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  lastLogin: Date;
}

export class DatabaseService {
  static async getUserCount(): Promise<number> {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting user count:', error);
      throw error;
    }
  }

  static async getActiveUserCount(): Promise<number> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('lastLogin', '>=', thirtyDaysAgo));
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting active user count:', error);
      throw error;
    }
  }

  static async getUsersByRole(role: string): Promise<UserData[]> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', role));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserData[];
    } catch (error) {
      console.error('Error getting users by role:', error);
      throw error;
    }
  }

  static async getRecentUsers(limit: number = 5): Promise<UserData[]> {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(query(usersRef));
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserData[];
      
      return users
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting recent users:', error);
      throw error;
    }
  }

  static async getUserStatistics(): Promise<{
    total: number;
    active: number;
    students: number;
    teachers: number;
  }> {
    try {
      const total = await this.getUserCount();
      const active = await this.getActiveUserCount();
      const students = (await this.getUsersByRole('student')).length;
      const teachers = (await this.getUsersByRole('teacher')).length;

      return {
        total,
        active,
        students,
        teachers
      };
    } catch (error) {
      console.error('Error getting user statistics:', error);
      throw error;
    }
  }
}
