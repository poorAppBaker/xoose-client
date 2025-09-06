// services/realtimeService.ts - React Native Firebase version
import database from '@react-native-firebase/database';

class RealtimeService {
  // Generic methods for any collection

  // Create a new document
  async create<T>(path: string, data: T): Promise<string> {
    try {
      const newRef = database().ref(path).push();
      await newRef.set({
        ...data,
        id: newRef.key,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return newRef.key!;
    } catch (error) {
      throw error;
    }
  }

  // Get a single document
  async get<T>(path: string): Promise<T | null> {
    try {
      const snapshot = await database().ref(path).once('value');
      return snapshot.val();
    } catch (error) {
      throw error;
    }
  }

  // Get all documents from a path
  async getAll<T>(path: string): Promise<T[]> {
    try {
      const snapshot = await database().ref(path).once('value');
      const data = snapshot.val();
      
      if (!data) return [];
      
      return Object.values(data) as T[];
    } catch (error) {
      throw error;
    }
  }

  // Update a document
  async update<T>(path: string, updates: Partial<T>): Promise<void> {
    try {
      await database().ref(path).update({
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      throw error;
    }
  }

  // Delete a document
  async delete(path: string): Promise<void> {
    try {
      await database().ref(path).remove();
    } catch (error) {
      throw error;
    }
  }

  // Query documents
  async query<T>(path: string, orderBy: string, value: any): Promise<T[]> {
    try {
      const snapshot = await database()
        .ref(path)
        .orderByChild(orderBy)
        .equalTo(value)
        .once('value');
      const data = snapshot.val();
      
      if (!data) return [];
      
      return Object.values(data) as T[];
    } catch (error) {
      throw error;
    }
  }

  // Listen to real-time updates
  listen<T>(path: string, callback: (data: T | null) => void): () => void {
    const dbRef = database().ref(path);
    
    const unsubscribe = dbRef.on('value', (snapshot) => {
      const data = snapshot.val();
      callback(data);
    });

    // Return unsubscribe function
    return () => dbRef.off('value', unsubscribe);
  }

  // Listen to a collection
  listenToCollection<T>(path: string, callback: (data: T[]) => void): () => void {
    const dbRef = database().ref(path);
    
    const unsubscribe = dbRef.on('value', (snapshot) => {
      const data = snapshot.val();
      const items = data ? Object.values(data) as T[] : [];
      callback(items);
    });

    // Return unsubscribe function
    return () => dbRef.off('value', unsubscribe);
  }

  // Specific methods for your app

  // Worksites
  async createWorksite(worksite: any) {
    return this.create('worksites', worksite);
  }

  async getWorksites() {
    return this.getAll('worksites');
  }

  async getWorksiteById(id: string) {
    return this.get(`worksites/${id}`);
  }

  async updateWorksite(id: string, updates: any) {
    return this.update(`worksites/${id}`, updates);
  }

  async deleteWorksite(id: string) {
    return this.delete(`worksites/${id}`);
  }

  listenToWorksites(callback: (worksites: any[]) => void) {
    return this.listenToCollection('worksites', callback);
  }

  // User worksites (for managers/workers assigned to specific worksites)
  async getUserWorksites(userId: string) {
    return this.query('worksites', 'assignedUsers', userId);
  }

  // Tasks/Jobs
  async createTask(worksiteId: string, task: any) {
    return this.create(`worksites/${worksiteId}/tasks`, task);
  }

  async getWorksiteTasks(worksiteId: string) {
    return this.getAll(`worksites/${worksiteId}/tasks`);
  }

  async updateTask(worksiteId: string, taskId: string, updates: any) {
    return this.update(`worksites/${worksiteId}/tasks/${taskId}`, updates);
  }

  listenToWorksiteTasks(worksiteId: string, callback: (tasks: any[]) => void) {
    return this.listenToCollection(`worksites/${worksiteId}/tasks`, callback);
  }

  // Messages/Chat
  async sendMessage(worksiteId: string, message: any) {
    return this.create(`worksites/${worksiteId}/messages`, message);
  }

  async getMessages(worksiteId: string) {
    return this.getAll(`worksites/${worksiteId}/messages`);
  }

  listenToMessages(worksiteId: string, callback: (messages: any[]) => void) {
    return this.listenToCollection(`worksites/${worksiteId}/messages`, callback);
  }

  // Notifications
  async createNotification(userId: string, notification: any) {
    return this.create(`users/${userId}/notifications`, notification);
  }

  async getUserNotifications(userId: string) {
    return this.getAll(`users/${userId}/notifications`);
  }

  listenToUserNotifications(userId: string, callback: (notifications: any[]) => void) {
    return this.listenToCollection(`users/${userId}/notifications`, callback);
  }

  // Push Token Management
  async updateUserPushToken(userId: string, tokenData: any) {
    return this.update(`users/${userId}`, { pushToken: tokenData });
  }
}

export default new RealtimeService();