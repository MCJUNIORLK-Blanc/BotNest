import { 
  bots, 
  botFiles, 
  botLogs, 
  systemStats, 
  activities,
  type Bot, 
  type InsertBot,
  type BotFile,
  type InsertBotFile,
  type BotLog,
  type InsertBotLog,
  type SystemStats,
  type Activity,
  type InsertActivity
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Bot operations
  getBots(): Promise<Bot[]>;
  getBot(id: string): Promise<Bot | undefined>;
  createBot(bot: InsertBot): Promise<Bot>;
  updateBot(id: string, updates: Partial<Bot>): Promise<Bot | undefined>;
  deleteBot(id: string): Promise<boolean>;

  // Bot file operations
  getBotFiles(botId: string): Promise<BotFile[]>;
  getBotFile(id: string): Promise<BotFile | undefined>;
  createBotFile(file: InsertBotFile): Promise<BotFile>;
  updateBotFile(id: string, updates: Partial<BotFile>): Promise<BotFile | undefined>;
  deleteBotFile(id: string): Promise<boolean>;

  // Bot log operations
  getBotLogs(botId: string, limit?: number): Promise<BotLog[]>;
  createBotLog(log: InsertBotLog): Promise<BotLog>;
  deleteBotLogs(botId: string): Promise<boolean>;

  // System stats operations
  getLatestSystemStats(): Promise<SystemStats | undefined>;
  createSystemStats(stats: Omit<SystemStats, 'id' | 'timestamp'>): Promise<SystemStats>;
  
  // Activity operations
  getActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
}

export class MemStorage implements IStorage {
  private bots: Map<string, Bot> = new Map();
  private botFiles: Map<string, BotFile> = new Map();
  private botLogs: Map<string, BotLog> = new Map();
  private systemStats: SystemStats[] = [];
  private activities: Activity[] = [];

  constructor() {
    // Initialize with some sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample bots
    const sampleBots: Bot[] = [
      {
        id: "bot-1",
        name: "MusicBot Pro",
        description: "Advanced music bot with queue management",
        language: "nodejs",
        template: "music",
        status: "online",
        token: "",
        mainFile: "index.js",
        pid: 1234,
        port: 3001,
        memoryUsage: 256,
        cpuUsage: 15,
        uptime: 3600 * 24 * 2 + 3600 * 14, // 2 days 14 hours
        lastStarted: new Date(Date.now() - 3600 * 24 * 2 * 1000),
        lastStopped: null,
        autoRestart: true,
        environment: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "bot-2",
        name: "Moderation Helper",
        description: "Auto-moderation and server management",
        language: "python",
        template: "moderation",
        status: "starting",
        token: "",
        mainFile: "main.py",
        pid: null,
        port: 3002,
        memoryUsage: 128,
        cpuUsage: 8,
        uptime: 3600 * 24 + 3600 * 3, // 1 day 3 hours
        lastStarted: new Date(Date.now() - 3600 * 24 * 1000),
        lastStopped: null,
        autoRestart: true,
        environment: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "bot-3",
        name: "Economy Bot",
        description: "Virtual economy and gaming system",
        language: "nodejs",
        template: "economy",
        status: "offline",
        token: "",
        mainFile: "index.js",
        pid: null,
        port: 3003,
        memoryUsage: 0,
        cpuUsage: 0,
        uptime: 0,
        lastStarted: null,
        lastStopped: new Date(Date.now() - 3600 * 1000),
        autoRestart: false,
        environment: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    sampleBots.forEach(bot => this.bots.set(bot.id, bot));

    // Create sample activities
    const sampleActivities: Activity[] = [
      {
        id: "activity-1",
        type: "bot_start",
        botId: "bot-1",
        message: "MusicBot Pro started successfully",
        metadata: {},
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
      },
      {
        id: "activity-2",
        type: "config_update",
        botId: "bot-2",
        message: "Updated bot configuration for Moderation Helper",
        metadata: {},
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
      },
      {
        id: "activity-3",
        type: "bot_crash",
        botId: "bot-3",
        message: "Economy Bot crashed and restarted",
        metadata: {},
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
      }
    ];

    this.activities = sampleActivities;

    // Create sample system stats
    const sampleStats: SystemStats = {
      id: "stats-1",
      cpuUsage: 34,
      memoryUsage: 2400,
      memoryTotal: 8000,
      diskUsage: 15200,
      diskTotal: 50000,
      networkIn: 8,
      networkOut: 12,
      timestamp: new Date(),
    };

    this.systemStats = [sampleStats];
  }

  // Bot operations
  async getBots(): Promise<Bot[]> {
    return Array.from(this.bots.values());
  }

  async getBot(id: string): Promise<Bot | undefined> {
    return this.bots.get(id);
  }

  async createBot(bot: InsertBot): Promise<Bot> {
    const id = randomUUID();
    const newBot: Bot = {
      ...bot,
      id,
      pid: null,
      memoryUsage: 0,
      cpuUsage: 0,
      uptime: 0,
      lastStarted: null,
      lastStopped: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.bots.set(id, newBot);
    return newBot;
  }

  async updateBot(id: string, updates: Partial<Bot>): Promise<Bot | undefined> {
    const bot = this.bots.get(id);
    if (!bot) return undefined;
    
    const updatedBot = { ...bot, ...updates, updatedAt: new Date() };
    this.bots.set(id, updatedBot);
    return updatedBot;
  }

  async deleteBot(id: string): Promise<boolean> {
    return this.bots.delete(id);
  }

  // Bot file operations
  async getBotFiles(botId: string): Promise<BotFile[]> {
    return Array.from(this.botFiles.values()).filter(file => file.botId === botId);
  }

  async getBotFile(id: string): Promise<BotFile | undefined> {
    return this.botFiles.get(id);
  }

  async createBotFile(file: InsertBotFile): Promise<BotFile> {
    const id = randomUUID();
    const newFile: BotFile = {
      ...file,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.botFiles.set(id, newFile);
    return newFile;
  }

  async updateBotFile(id: string, updates: Partial<BotFile>): Promise<BotFile | undefined> {
    const file = this.botFiles.get(id);
    if (!file) return undefined;
    
    const updatedFile = { ...file, ...updates, updatedAt: new Date() };
    this.botFiles.set(id, updatedFile);
    return updatedFile;
  }

  async deleteBotFile(id: string): Promise<boolean> {
    return this.botFiles.delete(id);
  }

  // Bot log operations
  async getBotLogs(botId: string, limit = 100): Promise<BotLog[]> {
    return Array.from(this.botLogs.values())
      .filter(log => log.botId === botId)
      .sort((a, b) => b.timestamp!.getTime() - a.timestamp!.getTime())
      .slice(0, limit);
  }

  async createBotLog(log: InsertBotLog): Promise<BotLog> {
    const id = randomUUID();
    const newLog: BotLog = {
      ...log,
      id,
      timestamp: new Date(),
    };
    this.botLogs.set(id, newLog);
    return newLog;
  }

  async deleteBotLogs(botId: string): Promise<boolean> {
    const logsToDelete = Array.from(this.botLogs.entries())
      .filter(([, log]) => log.botId === botId)
      .map(([id]) => id);
    
    logsToDelete.forEach(id => this.botLogs.delete(id));
    return true;
  }

  // System stats operations
  async getLatestSystemStats(): Promise<SystemStats | undefined> {
    return this.systemStats[this.systemStats.length - 1];
  }

  async createSystemStats(stats: Omit<SystemStats, 'id' | 'timestamp'>): Promise<SystemStats> {
    const newStats: SystemStats = {
      ...stats,
      id: randomUUID(),
      timestamp: new Date(),
    };
    this.systemStats.push(newStats);
    
    // Keep only last 100 entries
    if (this.systemStats.length > 100) {
      this.systemStats = this.systemStats.slice(-100);
    }
    
    return newStats;
  }

  // Activity operations
  async getActivities(limit = 50): Promise<Activity[]> {
    return this.activities
      .sort((a, b) => b.timestamp!.getTime() - a.timestamp!.getTime())
      .slice(0, limit);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const newActivity: Activity = {
      ...activity,
      id: randomUUID(),
      timestamp: new Date(),
    };
    this.activities.unshift(newActivity);
    
    // Keep only last 100 activities
    if (this.activities.length > 100) {
      this.activities = this.activities.slice(0, 100);
    }
    
    return newActivity;
  }
}

export const storage = new MemStorage();
