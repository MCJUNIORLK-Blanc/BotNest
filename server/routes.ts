import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import path from "path";
import { promises as fs } from "fs";
import { storage } from "./storage";
import { botManager } from "./services/botManager";
import { systemMonitor } from "./services/systemMonitor";
import { insertBotSchema } from "@shared/schema";

const upload = multer({ 
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

interface WebSocketClient extends WebSocket {
  isAlive?: boolean;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Start system monitoring
  systemMonitor.start();

  // WebSocket setup for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients = new Set<WebSocketClient>();

  wss.on('connection', (ws: WebSocketClient) => {
    console.log('WebSocket client connected');
    ws.isAlive = true;
    clients.add(ws);

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      clients.delete(ws);
    });
  });

  // Ping clients every 30 seconds
  const heartbeat = setInterval(() => {
    clients.forEach((ws) => {
      if (!ws.isAlive) {
        clients.delete(ws);
        return ws.terminate();
      }

      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(heartbeat);
  });

  // Broadcast function for real-time updates
  const broadcast = (data: any) => {
    const message = JSON.stringify(data);
    clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  };

  // Bot management APIs
  app.get("/api/bots", async (req, res) => {
    try {
      const bots = await storage.getBots();
      res.json(bots);
    } catch (error) {
      console.error("Error fetching bots:", error);
      res.status(500).json({ message: "Failed to fetch bots" });
    }
  });

  app.get("/api/bots/:id", async (req, res) => {
    try {
      const bot = await storage.getBot(req.params.id);
      if (!bot) {
        return res.status(404).json({ message: "Bot not found" });
      }
      res.json(bot);
    } catch (error) {
      console.error("Error fetching bot:", error);
      res.status(500).json({ message: "Failed to fetch bot" });
    }
  });

  app.post("/api/bots", async (req, res) => {
    try {
      const botData = insertBotSchema.parse(req.body);
      const bot = await storage.createBot(botData);
      
      // Create bot directory and files
      await botManager.createBotDirectory(bot);
      
      await storage.createActivity({
        type: "bot_start",
        botId: bot.id,
        message: `Created new bot: ${bot.name}`
      });

      broadcast({ type: "bot_created", data: bot });
      res.status(201).json(bot);
    } catch (error) {
      console.error("Error creating bot:", error);
      res.status(500).json({ message: "Failed to create bot" });
    }
  });

  app.put("/api/bots/:id", async (req, res) => {
    try {
      const bot = await storage.updateBot(req.params.id, req.body);
      if (!bot) {
        return res.status(404).json({ message: "Bot not found" });
      }

      await storage.createActivity({
        type: "config_update",
        botId: bot.id,
        message: `Updated configuration for ${bot.name}`
      });

      broadcast({ type: "bot_updated", data: bot });
      res.json(bot);
    } catch (error) {
      console.error("Error updating bot:", error);
      res.status(500).json({ message: "Failed to update bot" });
    }
  });

  app.delete("/api/bots/:id", async (req, res) => {
    try {
      const bot = await storage.getBot(req.params.id);
      if (!bot) {
        return res.status(404).json({ message: "Bot not found" });
      }

      // Stop bot if running
      await botManager.stopBot(req.params.id);
      
      const deleted = await storage.deleteBot(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Bot not found" });
      }

      await storage.createActivity({
        type: "bot_stop",
        botId: req.params.id,
        message: `Deleted bot: ${bot.name}`
      });

      broadcast({ type: "bot_deleted", data: { id: req.params.id } });
      res.json({ message: "Bot deleted successfully" });
    } catch (error) {
      console.error("Error deleting bot:", error);
      res.status(500).json({ message: "Failed to delete bot" });
    }
  });

  // Bot control APIs
  app.post("/api/bots/:id/start", async (req, res) => {
    try {
      await botManager.startBot(req.params.id);
      const bot = await storage.getBot(req.params.id);
      broadcast({ type: "bot_updated", data: bot });
      res.json({ message: "Bot start initiated" });
    } catch (error) {
      console.error("Error starting bot:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to start bot" });
    }
  });

  app.post("/api/bots/:id/stop", async (req, res) => {
    try {
      await botManager.stopBot(req.params.id);
      const bot = await storage.getBot(req.params.id);
      broadcast({ type: "bot_updated", data: bot });
      res.json({ message: "Bot stop initiated" });
    } catch (error) {
      console.error("Error stopping bot:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to stop bot" });
    }
  });

  app.post("/api/bots/:id/restart", async (req, res) => {
    try {
      await botManager.restartBot(req.params.id);
      const bot = await storage.getBot(req.params.id);
      broadcast({ type: "bot_updated", data: bot });
      res.json({ message: "Bot restart initiated" });
    } catch (error) {
      console.error("Error restarting bot:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to restart bot" });
    }
  });

  // File management APIs
  app.get("/api/bots/:id/files", async (req, res) => {
    try {
      const files = await storage.getBotFiles(req.params.id);
      res.json(files);
    } catch (error) {
      console.error("Error fetching bot files:", error);
      res.status(500).json({ message: "Failed to fetch bot files" });
    }
  });

  app.post("/api/bots/:id/files", upload.single('file'), async (req, res) => {
    try {
      const { path: filePath, fileName } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Read uploaded file content
      const content = await fs.readFile(file.path, 'utf-8');
      
      // Clean up uploaded file
      await fs.unlink(file.path);

      const botFile = await storage.createBotFile({
        botId: req.params.id,
        fileName: fileName || file.originalname,
        filePath: filePath || file.originalname,
        content,
        size: file.size,
        isDirectory: false
      });

      res.status(201).json(botFile);
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  app.get("/api/bots/:botId/files/:fileId", async (req, res) => {
    try {
      const file = await storage.getBotFile(req.params.fileId);
      if (!file || file.botId !== req.params.botId) {
        return res.status(404).json({ message: "File not found" });
      }
      res.json(file);
    } catch (error) {
      console.error("Error fetching file:", error);
      res.status(500).json({ message: "Failed to fetch file" });
    }
  });

  app.put("/api/bots/:botId/files/:fileId", async (req, res) => {
    try {
      const { content } = req.body;
      const file = await storage.updateBotFile(req.params.fileId, { content });
      if (!file || file.botId !== req.params.botId) {
        return res.status(404).json({ message: "File not found" });
      }
      res.json(file);
    } catch (error) {
      console.error("Error updating file:", error);
      res.status(500).json({ message: "Failed to update file" });
    }
  });

  app.delete("/api/bots/:botId/files/:fileId", async (req, res) => {
    try {
      const file = await storage.getBotFile(req.params.fileId);
      if (!file || file.botId !== req.params.botId) {
        return res.status(404).json({ message: "File not found" });
      }

      const deleted = await storage.deleteBotFile(req.params.fileId);
      if (!deleted) {
        return res.status(404).json({ message: "File not found" });
      }

      res.json({ message: "File deleted successfully" });
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ message: "Failed to delete file" });
    }
  });

  // Logs APIs
  app.get("/api/bots/:id/logs", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await storage.getBotLogs(req.params.id, limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching logs:", error);
      res.status(500).json({ message: "Failed to fetch logs" });
    }
  });

  app.delete("/api/bots/:id/logs", async (req, res) => {
    try {
      await storage.deleteBotLogs(req.params.id);
      res.json({ message: "Logs cleared successfully" });
    } catch (error) {
      console.error("Error clearing logs:", error);
      res.status(500).json({ message: "Failed to clear logs" });
    }
  });

  // System stats APIs
  app.get("/api/system/stats", async (req, res) => {
    try {
      const stats = await storage.getLatestSystemStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching system stats:", error);
      res.status(500).json({ message: "Failed to fetch system stats" });
    }
  });

  // Activities API
  app.get("/api/activities", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const activities = await storage.getActivities(limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Broadcast system stats every 5 seconds
  setInterval(async () => {
    try {
      const stats = await storage.getLatestSystemStats();
      if (stats) {
        broadcast({ type: "system_stats", data: stats });
      }
    } catch (error) {
      console.error("Error broadcasting system stats:", error);
    }
  }, 5000);

  return httpServer;
}
