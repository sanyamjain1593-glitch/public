import { useState, useEffect } from "react";
import { openDB, DBSchema } from "idb";
import { Task, UserSettings } from "@shared/schema";

interface FutureBoardDB extends DBSchema {
  tasks: {
    key: string;
    value: Task;
  };
  settings: {
    key: string;
    value: UserSettings;
  };
  syncQueue: {
    key: string;
    value: {
      id: string;
      type: "create" | "update" | "delete";
      data: any;
      timestamp: Date;
    };
  };
}

export function useOfflineStorage() {
  const [db, setDb] = useState<any>(null);

  useEffect(() => {
    const initDB = async () => {
      const database = await openDB<FutureBoardDB>("FutureBoardDB", 1, {
        upgrade(db) {
          // Tasks store
          if (!db.objectStoreNames.contains("tasks")) {
            db.createObjectStore("tasks", { keyPath: "id" });
          }
          
          // Settings store
          if (!db.objectStoreNames.contains("settings")) {
            db.createObjectStore("settings", { keyPath: "id" });
          }
          
          // Sync queue store
          if (!db.objectStoreNames.contains("syncQueue")) {
            const syncStore = db.createObjectStore("syncQueue", { keyPath: "id" });
            syncStore.createIndex("timestamp", "timestamp");
          }
        },
      });
      setDb(database);
    };

    initDB();
  }, []);

  const saveTasks = async (tasks: Task[]) => {
    if (!db) return;
    
    const tx = db.transaction("tasks", "readwrite");
    const store = tx.objectStore("tasks");
    
    // Clear existing tasks and save new ones
    await store.clear();
    for (const task of tasks) {
      await store.add(task);
    }
    await tx.complete;
  };

  const getTasks = async (): Promise<Task[]> => {
    if (!db) return [];
    
    const tx = db.transaction("tasks", "readonly");
    const store = tx.objectStore("tasks");
    return await store.getAll();
  };

  const saveTask = async (task: Task) => {
    if (!db) return;
    
    const tx = db.transaction("tasks", "readwrite");
    const store = tx.objectStore("tasks");
    await store.put(task);
    await tx.complete;
  };

  const deleteTask = async (taskId: string) => {
    if (!db) return;
    
    const tx = db.transaction("tasks", "readwrite");
    const store = tx.objectStore("tasks");
    await store.delete(taskId);
    await tx.complete;
  };

  const saveSettings = async (settings: UserSettings) => {
    if (!db) return;
    
    const tx = db.transaction("settings", "readwrite");
    const store = tx.objectStore("settings");
    await store.put(settings);
    await tx.complete;
  };

  const getSettings = async (): Promise<UserSettings | undefined> => {
    if (!db) return undefined;
    
    const tx = db.transaction("settings", "readonly");
    const store = tx.objectStore("settings");
    const allSettings = await store.getAll();
    return allSettings[0];
  };

  const addToSyncQueue = async (item: {
    type: "create" | "update" | "delete";
    data: any;
  }) => {
    if (!db) return;
    
    const tx = db.transaction("syncQueue", "readwrite");
    const store = tx.objectStore("syncQueue");
    await store.add({
      id: `sync-${Date.now()}`,
      ...item,
      timestamp: new Date(),
    });
    await tx.complete;
  };

  const getSyncQueue = async () => {
    if (!db) return [];
    
    const tx = db.transaction("syncQueue", "readonly");
    const store = tx.objectStore("syncQueue");
    return await store.getAll();
  };

  const clearSyncQueue = async () => {
    if (!db) return;
    
    const tx = db.transaction("syncQueue", "readwrite");
    const store = tx.objectStore("syncQueue");
    await store.clear();
    await tx.complete;
  };

  const syncWithServer = async () => {
    if (!navigator.onLine) return;
    
    const queue = await getSyncQueue();
    
    for (const item of queue) {
      try {
        switch (item.type) {
          case "create":
            await fetch("/api/tasks", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(item.data),
            });
            break;
          case "update":
            await fetch(`/api/tasks/${item.data.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(item.data),
            });
            break;
          case "delete":
            await fetch(`/api/tasks/${item.data.id}`, {
              method: "DELETE",
            });
            break;
        }
      } catch (error) {
        console.error("Sync failed for item:", item, error);
        // Stop syncing on first failure to maintain order
        break;
      }
    }
    
    // Clear queue after successful sync
    await clearSyncQueue();
  };

  // Auto-sync when online
  useEffect(() => {
    const handleOnline = () => {
      syncWithServer();
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [db]);

  return {
    saveTasks,
    getTasks,
    saveTask,
    deleteTask,
    saveSettings,
    getSettings,
    addToSyncQueue,
    syncWithServer,
  };
}
