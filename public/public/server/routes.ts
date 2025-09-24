import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sharePointService } from "./services/sharepointClient";
import { taskScheduler } from "./services/taskScheduler";
import { insertTaskSchema, updateTaskSchema, insertUserSettingsSchema, updateUserSettingsSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Start task scheduler
  await taskScheduler.startDailyRollover();

  // Task routes
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.get("/api/tasks/:id", async (req, res) => {
    try {
      const task = await storage.getTask(req.params.id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch task" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      
      // Sync to SharePoint if enabled
      try {
        const settings = await storage.getUserSettings();
        if (settings?.enableOfflineSync) {
          const sharepointId = await sharePointService.syncTaskToSharePoint(task);
          if (sharepointId) {
            await storage.updateTask(task.id, { 
              sharepointId: sharepointId.toString(),
              lastSynced: new Date() 
            });
          }
        }
      } catch (syncError) {
        console.error("SharePoint sync failed:", syncError);
        // Continue with local creation even if sync fails
      }
      
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid task data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const taskData = updateTaskSchema.parse(req.body);
      const task = await storage.updateTask(req.params.id, taskData);
      
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      // Sync to SharePoint if enabled
      try {
        const settings = await storage.getUserSettings();
        if (settings?.enableOfflineSync) {
          await sharePointService.syncTaskToSharePoint(task);
          await storage.updateTask(task.id, { lastSynced: new Date() });
        }
      } catch (syncError) {
        console.error("SharePoint sync failed:", syncError);
      }
      
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid task data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const task = await storage.getTask(req.params.id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      // Delete from SharePoint if synced
      try {
        if (task.sharepointId) {
          await sharePointService.deleteTaskFromSharePoint(task.sharepointId);
        }
      } catch (syncError) {
        console.error("SharePoint deletion failed:", syncError);
      }

      const deleted = await storage.deleteTask(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Task not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  app.post("/api/tasks/:id/archive", async (req, res) => {
    try {
      const task = await storage.archiveTask(req.params.id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: "Failed to archive task" });
    }
  });

  // Task history routes
  app.get("/api/tasks/:id/history", async (req, res) => {
    try {
      const history = await storage.getTaskHistory(req.params.id);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch task history" });
    }
  });

  // Completed tasks / history routes
  app.get("/api/history", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      
      const completedTasks = await storage.getCompletedTasks(start, end);
      res.json(completedTasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch completed tasks" });
    }
  });

  // Board routes
  app.get("/api/boards", async (req, res) => {
    try {
      const boards = await storage.getBoards();
      res.json(boards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch boards" });
    }
  });

  // User settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      let settings = await storage.getUserSettings();
      if (!settings) {
        settings = await storage.createUserSettings({
          theme: "nebula-purple",
          dailyRolloverTime: "00:00",
          enableNotifications: true,
          enableOfflineSync: true,
        });
      }
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.patch("/api/settings", async (req, res) => {
    try {
      const settingsData = updateUserSettingsSchema.parse(req.body);
      const settings = await storage.updateUserSettings(settingsData);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid settings data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // Sync routes
  app.post("/api/sync/sharepoint", async (req, res) => {
    try {
      await taskScheduler.syncWithSharePoint();
      res.json({ message: "SharePoint sync completed" });
    } catch (error) {
      res.status(500).json({ error: "SharePoint sync failed" });
    }
  });

  // Rollover routes
  app.post("/api/rollover", async (req, res) => {
    try {
      const result = await storage.performDailyRollover();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to perform rollover" });
    }
  });

  // Stats routes
  app.get("/api/stats", async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayCompleted = await storage.getCompletedTasks(today, tomorrow);
      
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekCompleted = await storage.getCompletedTasks(weekAgo, today);

      const allTasks = await storage.getTasks();
      const tasksByStatus = {
        backlog: allTasks.filter(t => t.status === "backlog").length,
        inProgress: allTasks.filter(t => t.status === "in-progress").length,
        review: allTasks.filter(t => t.status === "review").length,
        done: allTasks.filter(t => t.status === "done").length,
      };

      const stats = {
        todayCompleted: todayCompleted.length,
        weeklyAverage: Math.round(weekCompleted.length / 7 * 10) / 10,
        tasksByStatus,
        totalTasks: allTasks.length,
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
