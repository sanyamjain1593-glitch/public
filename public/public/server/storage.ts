import { type Task, type InsertTask, type UpdateTask, type TaskHistory, type InsertTaskHistory, type Board, type InsertBoard, type UserSettings, type InsertUserSettings, type UpdateUserSettings } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Task operations
  getTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  getTasksByStatus(status: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: UpdateTask): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;
  archiveTask(id: string): Promise<Task | undefined>;
  getCompletedTasks(startDate?: Date, endDate?: Date): Promise<Task[]>;
  
  // Task history operations
  getTaskHistory(taskId: string): Promise<TaskHistory[]>;
  createTaskHistory(history: InsertTaskHistory): Promise<TaskHistory>;
  
  // Board operations
  getBoards(): Promise<Board[]>;
  getBoard(id: string): Promise<Board | undefined>;
  createBoard(board: InsertBoard): Promise<Board>;
  updateBoard(id: string, board: Partial<InsertBoard>): Promise<Board | undefined>;
  deleteBoard(id: string): Promise<boolean>;
  
  // User settings operations
  getUserSettings(): Promise<UserSettings | undefined>;
  createUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
  updateUserSettings(settings: UpdateUserSettings): Promise<UserSettings | undefined>;
  
  // Daily rollover operations
  getTasksForRollover(): Promise<Task[]>;
  performDailyRollover(): Promise<{ rolledOver: number; archived: number }>;
}

export class MemStorage implements IStorage {
  private tasks: Map<string, Task>;
  private taskHistory: Map<string, TaskHistory>;
  private boards: Map<string, Board>;
  private userSettings: UserSettings | undefined;

  constructor() {
    this.tasks = new Map();
    this.taskHistory = new Map();
    this.boards = new Map();
    this.userSettings = undefined;
    
    // Initialize with default board
    this.initializeDefaultBoard();
  }

  private initializeDefaultBoard() {
    const defaultBoard: Board = {
      id: randomUUID(),
      name: "Main Board",
      description: "Default kanban board",
      columns: {
        backlog: { title: "Backlog", color: "#6b7280" },
        "in-progress": { title: "In Progress", color: "#8b5cf6" },
        review: { title: "Review", color: "#ec4899" },
        done: { title: "Done", color: "#00d9ff" }
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.boards.set(defaultBoard.id, defaultBoard);
  }

  // Task operations
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => !task.isArchived);
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTasksByStatus(status: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      task => task.status === status && !task.isArchived
    );
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const now = new Date();
    const task: Task = {
      ...insertTask,
      id,
      createdAt: now,
      updatedAt: now,
      isArchived: false,
      completedAt: null,
      sharepointId: null,
      lastSynced: null,
      progress: insertTask.progress ?? 0,
      description: insertTask.description ?? null,
      dueDate: insertTask.dueDate ?? null,
      assigneeInitials: insertTask.assigneeInitials ?? null,
      category: insertTask.category ?? null,
    };
    this.tasks.set(id, task);
    
    // Create history entry
    await this.createTaskHistory({
      taskId: id,
      action: "created",
      previousData: null,
      newData: task,
    });
    
    return task;
  }

  async updateTask(id: string, updateTask: UpdateTask): Promise<Task | undefined> {
    const existingTask = this.tasks.get(id);
    if (!existingTask) return undefined;

    const previousData = { ...existingTask };
    const updatedTask: Task = {
      ...existingTask,
      ...updateTask,
      updatedAt: new Date(),
    };

    // Set completion time if status changed to done
    if (updateTask.status === "done" && existingTask.status !== "done") {
      updatedTask.completedAt = new Date();
    }

    this.tasks.set(id, updatedTask);
    
    // Create history entry
    await this.createTaskHistory({
      taskId: id,
      action: "updated",
      previousData,
      newData: updatedTask,
    });

    return updatedTask;
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  async archiveTask(id: string): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    const archivedTask = { ...task, isArchived: true, updatedAt: new Date() };
    this.tasks.set(id, archivedTask);
    
    // Create history entry
    await this.createTaskHistory({
      taskId: id,
      action: "archived",
      previousData: task,
      newData: archivedTask,
    });

    return archivedTask;
  }

  async getCompletedTasks(startDate?: Date, endDate?: Date): Promise<Task[]> {
    const tasks = Array.from(this.tasks.values()).filter(task => 
      task.status === "done" && task.completedAt
    );

    if (startDate || endDate) {
      return tasks.filter(task => {
        if (!task.completedAt) return false;
        const completedDate = task.completedAt;
        if (startDate && completedDate < startDate) return false;
        if (endDate && completedDate > endDate) return false;
        return true;
      });
    }

    return tasks;
  }

  // Task history operations
  async getTaskHistory(taskId: string): Promise<TaskHistory[]> {
    return Array.from(this.taskHistory.values()).filter(
      history => history.taskId === taskId
    );
  }

  async createTaskHistory(insertHistory: InsertTaskHistory): Promise<TaskHistory> {
    const id = randomUUID();
    const history: TaskHistory = {
      ...insertHistory,
      id,
      timestamp: new Date(),
      previousData: insertHistory.previousData ?? null,
      newData: insertHistory.newData ?? null,
    };
    this.taskHistory.set(id, history);
    return history;
  }

  // Board operations
  async getBoards(): Promise<Board[]> {
    return Array.from(this.boards.values());
  }

  async getBoard(id: string): Promise<Board | undefined> {
    return this.boards.get(id);
  }

  async createBoard(insertBoard: InsertBoard): Promise<Board> {
    const id = randomUUID();
    const now = new Date();
    const board: Board = {
      ...insertBoard,
      id,
      createdAt: now,
      updatedAt: now,
      description: insertBoard.description ?? null,
    };
    this.boards.set(id, board);
    return board;
  }

  async updateBoard(id: string, updateBoard: Partial<InsertBoard>): Promise<Board | undefined> {
    const existingBoard = this.boards.get(id);
    if (!existingBoard) return undefined;

    const updatedBoard: Board = {
      ...existingBoard,
      ...updateBoard,
      updatedAt: new Date(),
    };
    this.boards.set(id, updatedBoard);
    return updatedBoard;
  }

  async deleteBoard(id: string): Promise<boolean> {
    return this.boards.delete(id);
  }

  // User settings operations
  async getUserSettings(): Promise<UserSettings | undefined> {
    return this.userSettings;
  }

  async createUserSettings(insertSettings: InsertUserSettings): Promise<UserSettings> {
    const id = randomUUID();
    const now = new Date();
    const settings: UserSettings = {
      ...insertSettings,
      id,
      createdAt: now,
      updatedAt: now,
      theme: insertSettings.theme ?? "nebula-purple",
      dailyRolloverTime: insertSettings.dailyRolloverTime ?? "00:00",
      enableNotifications: insertSettings.enableNotifications ?? true,
      enableOfflineSync: insertSettings.enableOfflineSync ?? true,
      lastRollover: insertSettings.lastRollover ?? null,
    };
    this.userSettings = settings;
    return settings;
  }

  async updateUserSettings(updateSettings: UpdateUserSettings): Promise<UserSettings | undefined> {
    if (!this.userSettings) {
      // Create default settings if none exist
      this.userSettings = await this.createUserSettings({
        theme: "nebula-purple",
        dailyRolloverTime: "00:00",
        enableNotifications: true,
        enableOfflineSync: true,
      });
    }

    this.userSettings = {
      ...this.userSettings,
      ...updateSettings,
      updatedAt: new Date(),
    };
    return this.userSettings;
  }

  // Daily rollover operations
  async getTasksForRollover(): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      task => task.status !== "done" && !task.isArchived
    );
  }

  async performDailyRollover(): Promise<{ rolledOver: number; archived: number }> {
    const completedTasks = Array.from(this.tasks.values()).filter(
      task => task.status === "done" && !task.isArchived
    );
    
    let archived = 0;
    for (const task of completedTasks) {
      await this.archiveTask(task.id);
      archived++;
    }

    const rolledOverTasks = await this.getTasksForRollover();
    
    // Update user settings with last rollover time
    await this.updateUserSettings({ lastRollover: new Date() });

    return { rolledOver: rolledOverTasks.length, archived };
  }
}

export const storage = new MemStorage();
