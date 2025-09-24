import { storage } from "../storage";
import { sharePointService } from "./sharepointClient";

export class TaskScheduler {
  private rolloverInterval: NodeJS.Timeout | null = null;

  async startDailyRollover() {
    // Check every hour if it's time for rollover
    this.rolloverInterval = setInterval(async () => {
      await this.checkAndPerformRollover();
    }, 60 * 60 * 1000); // Check every hour

    // Perform initial check
    await this.checkAndPerformRollover();
  }

  async checkAndPerformRollover() {
    try {
      const settings = await storage.getUserSettings();
      if (!settings) return;

      const now = new Date();
      const rolloverTime = settings.dailyRolloverTime || "00:00";
      const [hours, minutes] = rolloverTime.split(':').map(Number);
      
      const targetTime = new Date();
      targetTime.setHours(hours, minutes, 0, 0);
      
      // If target time has passed today and we haven't rolled over yet
      const lastRollover = settings.lastRollover;
      const shouldRollover = now >= targetTime && 
        (!lastRollover || lastRollover < targetTime);

      if (shouldRollover) {
        console.log('Performing daily task rollover...');
        const result = await storage.performDailyRollover();
        console.log(`Rollover complete: ${result.rolledOver} tasks rolled over, ${result.archived} tasks archived`);
        
        // Sync with SharePoint if enabled
        if (settings.enableOfflineSync) {
          await this.syncWithSharePoint();
        }
      }
    } catch (error) {
      console.error('Error during daily rollover:', error);
    }
  }

  async syncWithSharePoint() {
    try {
      console.log('Syncing with SharePoint...');
      
      // Get tasks that need syncing
      const tasks = await storage.getTasks();
      const tasksToSync = tasks.filter(task => 
        !task.lastSynced || task.updatedAt > task.lastSynced
      );

      for (const task of tasksToSync) {
        try {
          const sharepointId = await sharePointService.syncTaskToSharePoint(task);
          if (sharepointId && !task.sharepointId) {
            await storage.updateTask(task.id, { 
              sharepointId: sharepointId.toString(),
              lastSynced: new Date() 
            });
          }
        } catch (error) {
          console.error(`Error syncing task ${task.id}:`, error);
        }
      }

      // Sync tasks from SharePoint
      const sharePointTasks = await sharePointService.syncTasksFromSharePoint();
      
      for (const spTask of sharePointTasks) {
        const existingTask = spTask.localTaskId ? 
          await storage.getTask(spTask.localTaskId) : null;

        if (existingTask) {
          // Update existing task with SharePoint data
          await storage.updateTask(existingTask.id, {
            title: spTask.title,
            description: spTask.description,
            status: spTask.status as any,
            priority: spTask.priority as any,
            dueDate: spTask.dueDate,
            completedAt: spTask.completedAt,
            progress: spTask.progress,
            assigneeInitials: spTask.assigneeInitials,
            category: spTask.category,
            sharepointId: spTask.sharepointId,
            lastSynced: spTask.lastSynced,
          });
        } else if (!spTask.localTaskId) {
          // Create new task from SharePoint
          const newTask = await storage.createTask({
            title: spTask.title,
            description: spTask.description,
            status: spTask.status as any,
            priority: spTask.priority as any,
            dueDate: spTask.dueDate,
            progress: spTask.progress,
            assigneeInitials: spTask.assigneeInitials,
            category: spTask.category,
          });
          
          // Update with SharePoint ID
          await storage.updateTask(newTask.id, {
            sharepointId: spTask.sharepointId,
            lastSynced: spTask.lastSynced,
          });
        }
      }

      console.log('SharePoint sync completed');
    } catch (error) {
      console.error('Error syncing with SharePoint:', error);
    }
  }

  stopDailyRollover() {
    if (this.rolloverInterval) {
      clearInterval(this.rolloverInterval);
      this.rolloverInterval = null;
    }
  }
}

export const taskScheduler = new TaskScheduler();
