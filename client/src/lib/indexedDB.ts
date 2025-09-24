import { openDB, DBSchema } from 'idb';
import { Task, UserSettings } from '@shared/schema';

interface FutureBoardDB extends DBSchema {
  tasks: {
    key: string;
    value: Task & { _syncStatus?: 'pending' | 'synced' };
  };
  settings: {
    key: string;
    value: UserSettings;
  };
  metadata: {
    key: string;
    value: {
      id: string;
      lastSync: Date;
      version: number;
    };
  };
}

class IndexedDBManager {
  private db: any = null;
  private readonly DB_NAME = 'FutureBoardDB';
  private readonly DB_VERSION = 1;

  async init() {
    if (this.db) return this.db;

    this.db = await openDB<FutureBoardDB>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        // Tasks store
        if (!db.objectStoreNames.contains('tasks')) {
          const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
          taskStore.createIndex('status', 'status');
          taskStore.createIndex('createdAt', 'createdAt');
          taskStore.createIndex('updatedAt', 'updatedAt');
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }

        // Metadata store
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'id' });
        }
      },
    });

    return this.db;
  }

  async getAllTasks(): Promise<Task[]> {
    const db = await this.init();
    const tx = db.transaction('tasks', 'readonly');
    const store = tx.objectStore('tasks');
    return await store.getAll();
  }

  async getTask(id: string): Promise<Task | undefined> {
    const db = await this.init();
    const tx = db.transaction('tasks', 'readonly');
    const store = tx.objectStore('tasks');
    return await store.get(id);
  }

  async saveTask(task: Task): Promise<void> {
    const db = await this.init();
    const tx = db.transaction('tasks', 'readwrite');
    const store = tx.objectStore('tasks');
    await store.put({ ...task, _syncStatus: 'pending' });
    await tx.complete;
  }

  async saveTasks(tasks: Task[]): Promise<void> {
    const db = await this.init();
    const tx = db.transaction('tasks', 'readwrite');
    const store = tx.objectStore('tasks');
    
    for (const task of tasks) {
      await store.put({ ...task, _syncStatus: 'synced' });
    }
    
    await tx.complete;
  }

  async deleteTask(id: string): Promise<void> {
    const db = await this.init();
    const tx = db.transaction('tasks', 'readwrite');
    const store = tx.objectStore('tasks');
    await store.delete(id);
    await tx.complete;
  }

  async getTasksByStatus(status: string): Promise<Task[]> {
    const db = await this.init();
    const tx = db.transaction('tasks', 'readonly');
    const store = tx.objectStore('tasks');
    const index = store.index('status');
    return await index.getAll(status);
  }

  async getPendingSyncTasks(): Promise<Task[]> {
    const db = await this.init();
    const tx = db.transaction('tasks', 'readonly');
    const store = tx.objectStore('tasks');
    const allTasks = await store.getAll();
    return allTasks.filter(task => task._syncStatus === 'pending');
  }

  async markTaskSynced(id: string): Promise<void> {
    const db = await this.init();
    const task = await this.getTask(id);
    if (task) {
      const tx = db.transaction('tasks', 'readwrite');
      const store = tx.objectStore('tasks');
      await store.put({ ...task, _syncStatus: 'synced' });
      await tx.complete;
    }
  }

  async saveSettings(settings: UserSettings): Promise<void> {
    const db = await this.init();
    const tx = db.transaction('settings', 'readwrite');
    const store = tx.objectStore('settings');
    await store.put(settings);
    await tx.complete;
  }

  async getSettings(): Promise<UserSettings | undefined> {
    const db = await this.init();
    const tx = db.transaction('settings', 'readonly');
    const store = tx.objectStore('settings');
    const allSettings = await store.getAll();
    return allSettings[0];
  }

  async updateLastSync(): Promise<void> {
    const db = await this.init();
    const tx = db.transaction('metadata', 'readwrite');
    const store = tx.objectStore('metadata');
    await store.put({
      id: 'lastSync',
      lastSync: new Date(),
      version: this.DB_VERSION,
    });
    await tx.complete;
  }

  async getLastSync(): Promise<Date | null> {
    const db = await this.init();
    const tx = db.transaction('metadata', 'readonly');
    const store = tx.objectStore('metadata');
    const metadata = await store.get('lastSync');
    return metadata?.lastSync || null;
  }

  async clear(): Promise<void> {
    const db = await this.init();
    const tx = db.transaction(['tasks', 'settings', 'metadata'], 'readwrite');
    
    await tx.objectStore('tasks').clear();
    await tx.objectStore('settings').clear();
    await tx.objectStore('metadata').clear();
    
    await tx.complete;
  }
}

export const indexedDB = new IndexedDBManager();
