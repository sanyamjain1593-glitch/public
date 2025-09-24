import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Task, InsertTask, UpdateTask } from "@shared/schema";
import { useOfflineStorage } from "./use-offline-storage";

export function useTasks() {
  const queryClient = useQueryClient();
  const { saveTasks, getTasks: getOfflineTasks } = useOfflineStorage();

  const tasksQuery = useQuery({
    queryKey: ["/api/tasks"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/tasks");
        if (!response.ok) throw new Error("Failed to fetch tasks");
        return await response.json();
      } catch (error) {
        // Fallback to offline storage
        console.log("Using offline storage for tasks");
        return await getOfflineTasks();
      }
    },
  });

  const createTask = useMutation({
    mutationFn: async (task: InsertTask) => {
      try {
        const response = await apiRequest("POST", "/api/tasks", task);
        return await response.json();
      } catch (error) {
        // Save to offline storage if API fails
        const offlineTask: Task = {
          ...task,
          id: `offline-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          isArchived: false,
          completedAt: null,
          sharepointId: null,
          lastSynced: null,
        };
        await saveTasks([...tasksQuery.data || [], offlineTask]);
        return offlineTask;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateTask }) => {
      try {
        const response = await apiRequest("PATCH", `/api/tasks/${id}`, updates);
        return await response.json();
      } catch (error) {
        // Update in offline storage if API fails
        const currentTasks = tasksQuery.data || [];
        const taskIndex = currentTasks.findIndex((t: Task) => t.id === id);
        if (taskIndex !== -1) {
          const updatedTasks = [...currentTasks];
          updatedTasks[taskIndex] = { 
            ...updatedTasks[taskIndex], 
            ...updates,
            updatedAt: new Date(),
            ...(updates.status === "done" && { completedAt: new Date() })
          };
          await saveTasks(updatedTasks);
          return updatedTasks[taskIndex];
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      try {
        await apiRequest("DELETE", `/api/tasks/${id}`);
      } catch (error) {
        // Remove from offline storage if API fails
        const currentTasks = tasksQuery.data || [];
        const filteredTasks = currentTasks.filter((t: Task) => t.id !== id);
        await saveTasks(filteredTasks);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });

  return {
    tasks: tasksQuery.data,
    isLoading: tasksQuery.isLoading,
    error: tasksQuery.error,
    createTask,
    updateTask,
    deleteTask,
  };
}
