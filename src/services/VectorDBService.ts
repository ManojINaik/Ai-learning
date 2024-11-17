import { getEmbeddingModel } from '../utils/modelConfig';
import { db } from '../config/firebase';
import { collection, getDocs, query, where, orderBy, limit, addDoc, deleteDoc } from 'firebase/firestore';

interface UserData {
  createdAt: any;
  email: string;
  lastLogin: any;
  name: string;
  notificationSettings: {
    email: {
      courseUpdates: boolean;
      newFeatures: boolean;
      progressReports: boolean;
    };
    push: {
      achievements: boolean;
      assessmentResults: boolean;
      lessonReminders: boolean;
    };
  };
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
  role: string;
  updatedAt: any;
}

interface UserEmbedding {
  id: string;
  name: string;
  email: string;
  role: string;
  metadata: {
    joinDate: string;
    lastActive: string;
    notifications: {
      email: {
        courseUpdates: boolean;
        newFeatures: boolean;
        progressReports: boolean;
      };
      push: {
        achievements: boolean;
        assessmentResults: boolean;
        lessonReminders: boolean;
      };
    };
    preferences: {
      emailNotifications: boolean;
      pushNotifications: boolean;
    };
  };
  embedding?: number[];
}

interface DomainData {
  description: string;
  name: string;
}

interface AssessmentData {
  completedAt: any;
  createdAt: any;
  improvement: string;
  score: number;
  type: string;
  userId: string;
}

interface AssessmentResultData {
  answers: Record<string, any>;
  assessmentId: string;
  completedAt: any;
  language: string;
  questionId: string;
  score: number;
  userId: string;
}

class VectorDBService {
  private users: any[] = [];
  private static instance: VectorDBService;
  private embeddingModel: any;
  private modelLoading: Promise<void>;

  private constructor() {
    // Initialize model first
    this.modelLoading = this.initializeModel().catch(error => {
      console.error('Failed to initialize model:', error);
      return Promise.reject(error);
    });

    // Only initialize data after model is ready
    this.modelLoading.then(() => {
      return this.initializeData().catch(error => {
        console.error('Failed to initialize data:', error);
      });
    });
  }

  public static getInstance(): VectorDBService {
    if (!VectorDBService.instance) {
      VectorDBService.instance = new VectorDBService();
    }
    return VectorDBService.instance;
  }

  private async initializeModel() {
    try {
      console.log('Starting model initialization...');
      this.embeddingModel = await getEmbeddingModel();
      const testEmbedding = await this.generateEmbedding('test');
      if (!testEmbedding || testEmbedding.length === 0) {
        throw new Error('Model validation failed');
      }
      console.log('Embedding model loaded and validated successfully');
    } catch (error) {
      console.error('Error loading embedding model:', error);
      throw error;
    }
  }

  private async initializeData() {
    try {
      // Wait for model to be ready before initializing data
      await this.modelLoading;
      
      // Fetch real data from Firestore
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      
      const users = querySnapshot.docs.map(doc => {
        const data = doc.data() as UserData;
        return {
          id: doc.id,
          name: data.name || data.email?.split('@')[0] || 'Anonymous',
          email: data.email || 'No email provided',
          role: data.role?.toLowerCase() || 'user',
          metadata: {
            notifications: {
              email: data.notificationSettings?.email || {},
              push: data.notificationSettings?.push || {}
            },
            preferences: data.preferences || {},
            joinDate: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown',
            lastActive: data.lastLogin ? new Date(data.lastLogin.seconds * 1000).toLocaleDateString() : 'Never'
          }
        };
      });

      // Generate embeddings for the fetched users
      for (const user of users) {
        const userText = `${user.name} ${user.email} ${user.role}`;
        const embedding = await this.generateEmbedding(userText);
        this.addToIndex(user, embedding);
      }

      console.log('Sample data initialized successfully');
    } catch (error) {
      console.error('Error initializing sample data:', error);
    }
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      if (!this.embeddingModel) {
        await this.modelLoading;
        if (!this.embeddingModel) {
          throw new Error('Model not initialized');
        }
      }

      console.log('Generating embedding for:', text);
      const result = await this.embeddingModel.__call__(text);
      
      if (!result || !result.data) {
        throw new Error('Invalid model output');
      }

      // Convert Float32Array to regular array
      const embedding = Array.from(result.data);
      console.log('Generated embedding length:', embedding.length);
      
      return embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (!a || !b || a.length !== b.length) {
      console.warn('Invalid vectors for similarity calculation');
      return 0;
    }

    try {
      let dotProduct = 0;
      let normA = 0;
      let normB = 0;
      
      for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
      }
      
      const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
      return isNaN(similarity) ? 0 : similarity;
    } catch (error) {
      console.error('Error calculating similarity:', error);
      return 0;
    }
  }

  async addUser(user: UserEmbedding): Promise<void> {
    try {
      const text = `${user.name} ${user.email} ${user.role}`;
      const embedding = await this.generateEmbedding(text);
      this.users.push({ ...user, embedding });
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  }

  async getUserCount(): Promise<number> {
    return this.users.length;
  }

  async getActiveUsers(daysAgo: number = 30): Promise<number> {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return this.users.filter(user => 
      new Date(user.metadata.lastActive) >= date
    ).length;
  }

  async getUsersByRole(role: string): Promise<any[]> {
    try {
      const usersRef = collection(db, 'users');
      // Don't filter by role initially, get all users
      const querySnapshot = await getDocs(usersRef);
      
      console.log('Raw Firestore data:', 
        querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );

      const users = querySnapshot.docs
        .map(doc => {
          const data = doc.data() as UserData;
          return {
            id: doc.id,
            name: data.name || data.email?.split('@')[0] || 'Anonymous',
            email: data.email || 'No email provided',
            role: data.role?.toLowerCase() || 'user',
            metadata: {
              notifications: {
                email: data.notificationSettings?.email || {},
                push: data.notificationSettings?.push || {}
              },
              preferences: data.preferences || {},
              joinDate: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown',
              lastActive: data.lastLogin ? new Date(data.lastLogin.seconds * 1000).toLocaleDateString() : 'Never'
            }
          };
        })
        .filter(user => user.role === role.toLowerCase());

      console.log(`Filtered users for role ${role}:`, users);
      return users;
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<any[]> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef);
      const querySnapshot = await getDocs(q);
      
      console.log('Raw query snapshot:', querySnapshot);
      console.log('Number of documents:', querySnapshot.size);
      console.log('All users raw data:', 
        querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );

      if (querySnapshot.empty) {
        console.log('No users found in Firestore');
        return [];
      }

      const users = querySnapshot.docs.map(doc => {
        const data = doc.data() as UserData;
        console.log('Processing user document:', { id: doc.id, data });
        return {
          id: doc.id,
          name: data.name || data.email?.split('@')[0] || 'Anonymous',
          email: data.email || 'No email provided',
          role: data.role?.toLowerCase() || 'user',
          metadata: {
            notifications: {
              email: data.notificationSettings?.email || {},
              push: data.notificationSettings?.push || {}
            },
            preferences: data.preferences || {},
            joinDate: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown',
            lastActive: data.lastLogin ? new Date(data.lastLogin.seconds * 1000).toLocaleDateString() : 'Never'
          }
        };
      });

      console.log('Processed users:', users);
      return users;
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  }

  async searchSimilar(query: string, limit: number = 3): Promise<any[]> {
    try {
      // Use the getAllUsers method to get consistent data
      const users = await this.getAllUsers();
      
      if (query.trim() === '') {
        // If no query, return all users up to limit
        return users.slice(0, limit);
      }

      // Generate embeddings and add to index
      this.users = []; // Clear previous index
      for (const user of users) {
        const userText = `${user.name} ${user.email} ${user.role}`;
        const embedding = await this.generateEmbedding(userText);
        this.addToIndex(user, embedding);
      }

      // Perform similarity search
      const queryEmbedding = await this.generateEmbedding(query);
      return this.searchIndex(queryEmbedding, limit);
    } catch (error) {
      console.error('Error performing similarity search:', error);
      throw error;
    }
  }

  async getUserStatistics(): Promise<any> {
    try {
      const users = await this.getAllUsers();
      console.log('Users for statistics:', users);
      
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const stats = {
        total: users.length,
        active: users.filter(user => {
          const lastActive = user.metadata.lastActive !== 'Never' 
            ? new Date(user.metadata.lastActive) 
            : null;
          return lastActive && lastActive > thirtyDaysAgo;
        }).length,
        students: users.filter(user => user.role === 'student').length,
        teachers: users.filter(user => user.role === 'teacher').length,
        admins: users.filter(user => user.role === 'admin').length,
        users: users.filter(user => user.role === 'user').length
      };

      console.log('Calculated statistics:', stats);
      return stats;
    } catch (error) {
      console.error('Error getting user statistics:', error);
      throw error;
    }
  }

  async getDomains(): Promise<DomainData[]> {
    try {
      const domainsRef = collection(db, 'domains');
      const querySnapshot = await getDocs(domainsRef);
      
      console.log('Raw domains data:', 
        querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );

      const domains = querySnapshot.docs.map(doc => {
        const data = doc.data() as DomainData;
        return {
          id: doc.id,
          name: data.name || 'Unnamed Domain',
          description: data.description?.trim() || 'No description available'
        };
      });

      console.log('Processed domains:', domains);
      return domains;
    } catch (error) {
      console.error('Error fetching domains:', error);
      throw error;
    }
  }

  async addDomain(name: string, description: string = ''): Promise<boolean> {
    try {
      const domainsRef = collection(db, 'domains');
      await addDoc(domainsRef, {
        name: name.toLowerCase(),
        description
      });
      return true;
    } catch (error) {
      console.error('Error adding domain:', error);
      return false;
    }
  }

  async deleteDomain(name: string): Promise<boolean> {
    try {
      const domainsRef = collection(db, 'domains');
      const q = query(domainsRef, where('name', '==', name.toLowerCase()));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return false;
      }

      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      return true;
    } catch (error) {
      console.error('Error deleting domain:', error);
      return false;
    }
  }

  async deleteUser(email: string): Promise<boolean> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email.toLowerCase()));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return false;
      }

      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  async getAssessments(userId?: string): Promise<AssessmentData[]> {
    try {
      const assessmentsRef = collection(db, 'assessments');
      let q = assessmentsRef;
      
      if (userId) {
        q = query(assessmentsRef, where('userId', '==', userId));
      }
      
      const querySnapshot = await getDocs(q);
      
      console.log('Raw assessments data:', 
        querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );

      const assessments = querySnapshot.docs.map(doc => {
        const data = doc.data() as AssessmentData;
        return {
          id: doc.id,
          type: data.type || 'Unknown Assessment',
          score: data.score || 0,
          improvement: data.improvement || 'N/A',
          completedAt: data.completedAt ? new Date(data.completedAt.seconds * 1000).toLocaleDateString() : 'Not completed',
          createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown',
          userId: data.userId
        };
      });

      console.log('Processed assessments:', assessments);
      return assessments;
    } catch (error) {
      console.error('Error fetching assessments:', error);
      throw error;
    }
  }

  async getAssessmentStatistics(): Promise<any> {
    try {
      const assessments = await this.getAssessments();
      
      const stats = {
        total: assessments.length,
        completed: assessments.filter(a => a.completedAt !== 'Not completed').length,
        averageScore: 0,
        byType: {} as Record<string, { count: number; avgScore: number }>,
        improvements: {
          positive: 0,
          negative: 0,
          noChange: 0
        }
      };

      // Calculate statistics
      assessments.forEach(assessment => {
        // Track by type
        if (!stats.byType[assessment.type]) {
          stats.byType[assessment.type] = { count: 0, avgScore: 0 };
        }
        stats.byType[assessment.type].count++;
        stats.byType[assessment.type].avgScore += assessment.score;

        // Track improvements
        if (assessment.improvement) {
          const improvement = parseFloat(assessment.improvement);
          if (improvement > 0) stats.improvements.positive++;
          else if (improvement < 0) stats.improvements.negative++;
          else stats.improvements.noChange++;
        }

        // Add to average score
        stats.averageScore += assessment.score;
      });

      // Calculate averages
      if (assessments.length > 0) {
        stats.averageScore /= assessments.length;
        Object.keys(stats.byType).forEach(type => {
          stats.byType[type].avgScore /= stats.byType[type].count;
        });
      }

      console.log('Assessment statistics:', stats);
      return stats;
    } catch (error) {
      console.error('Error getting assessment statistics:', error);
      throw error;
    }
  }

  async getUserAssessments(userId: string): Promise<any> {
    try {
      const assessments = await this.getAssessments(userId);
      const stats = {
        total: assessments.length,
        completed: assessments.filter(a => a.completedAt !== 'Not completed').length,
        averageScore: 0,
        latestImprovement: 'N/A',
        assessments: assessments.sort((a, b) => 
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        )
      };

      if (assessments.length > 0) {
        stats.averageScore = assessments.reduce((acc, curr) => acc + curr.score, 0) / assessments.length;
        stats.latestImprovement = assessments[0].improvement;
      }

      return stats;
    } catch (error) {
      console.error('Error getting user assessments:', error);
      throw error;
    }
  }

  async getAssessmentResults(userId?: string, assessmentId?: string): Promise<AssessmentResultData[]> {
    try {
      const resultsRef = collection(db, 'assessment_results');
      let q = resultsRef;
      
      if (userId && assessmentId) {
        q = query(resultsRef, 
          where('userId', '==', userId),
          where('assessmentId', '==', assessmentId)
        );
      } else if (userId) {
        q = query(resultsRef, where('userId', '==', userId));
      } else if (assessmentId) {
        q = query(resultsRef, where('assessmentId', '==', assessmentId));
      }
      
      const querySnapshot = await getDocs(q);
      
      console.log('Raw assessment results:', 
        querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );

      const results = querySnapshot.docs.map(doc => {
        const data = doc.data() as AssessmentResultData;
        return {
          id: doc.id,
          assessmentId: data.assessmentId,
          questionId: data.questionId,
          language: data.language || 'unknown',
          score: data.score || 0,
          answers: data.answers || {},
          completedAt: data.completedAt ? new Date(data.completedAt.seconds * 1000).toLocaleDateString() : 'Not completed',
          userId: data.userId
        };
      });

      console.log('Processed assessment results:', results);
      return results;
    } catch (error) {
      console.error('Error fetching assessment results:', error);
      throw error;
    }
  }

  async getUserAssessmentSummary(userId: string): Promise<any> {
    try {
      const results = await this.getAssessmentResults(userId);
      const summary = {
        totalAssessments: results.length,
        totalScore: 0,
        averageScore: 0,
        byLanguage: {} as Record<string, {
          count: number;
          totalScore: number;
          averageScore: number;
        }>,
        recentResults: results
          .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
          .slice(0, 5)
      };

      results.forEach(result => {
        summary.totalScore += result.score;
        
        if (!summary.byLanguage[result.language]) {
          summary.byLanguage[result.language] = {
            count: 0,
            totalScore: 0,
            averageScore: 0
          };
        }
        
        summary.byLanguage[result.language].count++;
        summary.byLanguage[result.language].totalScore += result.score;
      });

      if (results.length > 0) {
        summary.averageScore = summary.totalScore / results.length;
        
        Object.keys(summary.byLanguage).forEach(lang => {
          const langStats = summary.byLanguage[lang];
          langStats.averageScore = langStats.totalScore / langStats.count;
        });
      }

      return summary;
    } catch (error) {
      console.error('Error getting user assessment summary:', error);
      throw error;
    }
  }

  async getAssessmentResultStatistics(): Promise<any> {
    try {
      const results = await this.getAssessmentResults();
      
      const stats = {
        total: results.length,
        averageScore: 0,
        byLanguage: {} as Record<string, {
          count: number;
          averageScore: number;
          highestScore: number;
        }>,
        scoreDistribution: {
          excellent: 0,  // > 90%
          good: 0,      // 70-90%
          average: 0,   // 50-70%
          poor: 0       // < 50%
        }
      };

      results.forEach(result => {
        // Language stats
        if (!stats.byLanguage[result.language]) {
          stats.byLanguage[result.language] = {
            count: 0,
            averageScore: 0,
            highestScore: 0
          };
        }
        
        const langStats = stats.byLanguage[result.language];
        langStats.count++;
        langStats.averageScore += result.score;
        langStats.highestScore = Math.max(langStats.highestScore, result.score);

        // Score distribution
        const scorePercentage = (result.score / 100) * 100;
        if (scorePercentage > 90) stats.scoreDistribution.excellent++;
        else if (scorePercentage > 70) stats.scoreDistribution.good++;
        else if (scorePercentage > 50) stats.scoreDistribution.average++;
        else stats.scoreDistribution.poor++;

        // Overall average
        stats.averageScore += result.score;
      });

      // Calculate final averages
      if (results.length > 0) {
        stats.averageScore /= results.length;
        Object.keys(stats.byLanguage).forEach(lang => {
          stats.byLanguage[lang].averageScore /= stats.byLanguage[lang].count;
        });
      }

      return stats;
    } catch (error) {
      console.error('Error getting assessment result statistics:', error);
      throw error;
    }
  }

  private addToIndex(user: any, embedding: number[]) {
    // Add user to index with generated embedding
    this.users.push({ ...user, embedding });
  }

  private searchIndex(queryEmbedding: number[], k: number): any[] {
    // Perform similarity search on index
    return this.users
      .map(user => ({
        ...user,
        similarity: this.cosineSimilarity(queryEmbedding, user.embedding!)
      }))
      .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
      .slice(0, k)
      .map(({ similarity, ...user }) => user);
  }
}

export const vectorDB = VectorDBService.getInstance();
