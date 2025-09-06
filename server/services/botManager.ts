import { spawn, ChildProcess } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { storage } from "../storage";
import type { Bot } from "@shared/schema";

export class BotManager {
  private processes: Map<string, ChildProcess> = new Map();
  private baseDir = process.env.BOTS_DIR || path.join(process.cwd(), "bots");

  constructor() {
    this.ensureBaseDir();
  }

  private async ensureBaseDir() {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
    } catch (error) {
      console.error("Failed to create bots directory:", error);
    }
  }

  private getBotDir(botId: string): string {
    return path.join(this.baseDir, botId);
  }

  async createBotDirectory(bot: Bot): Promise<void> {
    const botDir = this.getBotDir(bot.id);
    await fs.mkdir(botDir, { recursive: true });

    // Create basic bot template based on language
    if (bot.language === "nodejs") {
      await this.createNodeJSTemplate(bot, botDir);
    } else if (bot.language === "python") {
      await this.createPythonTemplate(bot, botDir);
    }
  }

  private async createNodeJSTemplate(bot: Bot, botDir: string): Promise<void> {
    const packageJson = {
      name: bot.name.toLowerCase().replace(/\s+/g, "-"),
      version: "1.0.0",
      description: bot.description || "",
      main: bot.mainFile,
      scripts: {
        start: `node ${bot.mainFile}`,
        dev: `node ${bot.mainFile}`
      },
      dependencies: {
        "discord.js": "^14.14.1"
      }
    };

    await fs.writeFile(
      path.join(botDir, "package.json"),
      JSON.stringify(packageJson, null, 2)
    );

    let templateCode = "";
    switch (bot.template) {
      case "basic":
        templateCode = this.getBasicNodeJSTemplate();
        break;
      case "music":
        templateCode = this.getMusicNodeJSTemplate();
        break;
      case "moderation":
        templateCode = this.getModerationNodeJSTemplate();
        break;
      case "economy":
        templateCode = this.getEconomyNodeJSTemplate();
        break;
      default:
        templateCode = this.getBasicNodeJSTemplate();
    }

    await fs.writeFile(path.join(botDir, bot.mainFile), templateCode);

    // Create .env file
    await fs.writeFile(
      path.join(botDir, ".env"),
      `DISCORD_TOKEN=${bot.token || "YOUR_BOT_TOKEN_HERE"}\n`
    );
  }

  private async createPythonTemplate(bot: Bot, botDir: string): Promise<void> {
    // Create requirements.txt
    await fs.writeFile(
      path.join(botDir, "requirements.txt"),
      "discord.py>=2.3.2\npython-dotenv>=1.0.0\n"
    );

    let templateCode = "";
    switch (bot.template) {
      case "basic":
        templateCode = this.getBasicPythonTemplate();
        break;
      case "music":
        templateCode = this.getMusicPythonTemplate();
        break;
      case "moderation":
        templateCode = this.getModerationPythonTemplate();
        break;
      case "economy":
        templateCode = this.getEconomyPythonTemplate();
        break;
      default:
        templateCode = this.getBasicPythonTemplate();
    }

    await fs.writeFile(path.join(botDir, bot.mainFile), templateCode);

    // Create .env file
    await fs.writeFile(
      path.join(botDir, ".env"),
      `DISCORD_TOKEN=${bot.token || "YOUR_BOT_TOKEN_HERE"}\n`
    );
  }

  async startBot(botId: string): Promise<boolean> {
    try {
      const bot = await storage.getBot(botId);
      if (!bot) throw new Error("Bot not found");

      if (this.processes.has(botId)) {
        throw new Error("Bot is already running");
      }

      await storage.updateBot(botId, { status: "starting" });

      const botDir = this.getBotDir(botId);
      let process: ChildProcess;

      if (bot.language === "nodejs") {
        // Install dependencies first
        await this.runCommand("npm", ["install"], botDir);
        process = spawn("node", [bot.mainFile], {
          cwd: botDir,
          env: { ...process.env, ...bot.environment },
          stdio: ["pipe", "pipe", "pipe"]
        });
      } else if (bot.language === "python") {
        // Install dependencies first
        await this.runCommand("pip", ["install", "-r", "requirements.txt"], botDir);
        process = spawn("python", [bot.mainFile], {
          cwd: botDir,
          env: { ...process.env, ...bot.environment },
          stdio: ["pipe", "pipe", "pipe"]
        });
      } else {
        throw new Error("Unsupported language");
      }

      this.processes.set(botId, process);

      // Handle process events
      process.on("error", async (error) => {
        console.error(`Bot ${botId} error:`, error);
        await storage.createBotLog({
          botId,
          level: "error",
          message: `Process error: ${error.message}`
        });
        await this.stopBot(botId);
      });

      process.on("exit", async (code) => {
        console.log(`Bot ${botId} exited with code ${code}`);
        await storage.createBotLog({
          botId,
          level: "info",
          message: `Process exited with code ${code}`
        });
        this.processes.delete(botId);
        await storage.updateBot(botId, { 
          status: "offline", 
          pid: null,
          lastStopped: new Date()
        });
        await storage.createActivity({
          type: "bot_stop",
          botId,
          message: `${bot.name} stopped`
        });
      });

      // Capture stdout and stderr
      process.stdout?.on("data", async (data) => {
        const message = data.toString().trim();
        await storage.createBotLog({
          botId,
          level: "info",
          message
        });
      });

      process.stderr?.on("data", async (data) => {
        const message = data.toString().trim();
        await storage.createBotLog({
          botId,
          level: "error",
          message
        });
      });

      // Update bot status after a delay
      setTimeout(async () => {
        if (this.processes.has(botId)) {
          await storage.updateBot(botId, { 
            status: "online", 
            pid: process.pid || null,
            lastStarted: new Date()
          });
          await storage.createActivity({
            type: "bot_start",
            botId,
            message: `${bot.name} started successfully`
          });
        }
      }, 2000);

      return true;
    } catch (error) {
      console.error(`Failed to start bot ${botId}:`, error);
      await storage.updateBot(botId, { status: "error" });
      throw error;
    }
  }

  async stopBot(botId: string): Promise<boolean> {
    try {
      const process = this.processes.get(botId);
      if (!process) {
        await storage.updateBot(botId, { status: "offline", pid: null });
        return true;
      }

      await storage.updateBot(botId, { status: "stopping" });

      process.kill("SIGTERM");

      // Force kill after 5 seconds if not terminated
      setTimeout(() => {
        if (this.processes.has(botId)) {
          process.kill("SIGKILL");
        }
      }, 5000);

      this.processes.delete(botId);
      return true;
    } catch (error) {
      console.error(`Failed to stop bot ${botId}:`, error);
      throw error;
    }
  }

  async restartBot(botId: string): Promise<boolean> {
    await this.stopBot(botId);
    // Wait a bit before restarting
    await new Promise(resolve => setTimeout(resolve, 1000));
    return this.startBot(botId);
  }

  private async runCommand(command: string, args: string[], cwd: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, { cwd });
      process.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Command failed with code ${code}`));
        }
      });
      process.on("error", reject);
    });
  }

  // Bot template methods
  private getBasicNodeJSTemplate(): string {
    return `const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent
  ] 
});

client.once('ready', () => {
  console.log(\`Logged in as \${client.user.tag}!\`);
});

client.on('messageCreate', message => {
  if (message.author.bot) return;
  
  if (message.content === '!ping') {
    message.reply('Pong!');
  }
});

client.login(process.env.DISCORD_TOKEN);
`;
  }

  private getMusicNodeJSTemplate(): string {
    return `const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ] 
});

client.once('ready', () => {
  console.log(\`Music Bot \${client.user.tag} is ready!\`);
});

client.on('messageCreate', message => {
  if (message.author.bot) return;
  
  if (message.content.startsWith('!play')) {
    message.reply('Music functionality coming soon!');
  }
  
  if (message.content === '!queue') {
    message.reply('Queue is empty.');
  }
});

client.login(process.env.DISCORD_TOKEN);
`;
  }

  private getModerationNodeJSTemplate(): string {
    return `const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ] 
});

client.once('ready', () => {
  console.log(\`Moderation Bot \${client.user.tag} is ready!\`);
});

client.on('messageCreate', message => {
  if (message.author.bot) return;
  
  if (message.content.startsWith('!kick')) {
    if (!message.member.permissions.has('KICK_MEMBERS')) {
      return message.reply('You do not have permission to kick members.');
    }
    message.reply('Kick functionality coming soon!');
  }
  
  if (message.content.startsWith('!ban')) {
    if (!message.member.permissions.has('BAN_MEMBERS')) {
      return message.reply('You do not have permission to ban members.');
    }
    message.reply('Ban functionality coming soon!');
  }
});

client.login(process.env.DISCORD_TOKEN);
`;
  }

  private getEconomyNodeJSTemplate(): string {
    return `const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent
  ] 
});

// Simple in-memory economy (use database in production)
const userBalances = new Map();

client.once('ready', () => {
  console.log(\`Economy Bot \${client.user.tag} is ready!\`);
});

client.on('messageCreate', message => {
  if (message.author.bot) return;
  
  const userId = message.author.id;
  
  if (message.content === '!balance') {
    const balance = userBalances.get(userId) || 0;
    message.reply(\`Your balance: \${balance} coins\`);
  }
  
  if (message.content === '!daily') {
    const currentBalance = userBalances.get(userId) || 0;
    userBalances.set(userId, currentBalance + 100);
    message.reply('You received 100 daily coins!');
  }
});

client.login(process.env.DISCORD_TOKEN);
`;
  }

  private getBasicPythonTemplate(): string {
    return `import discord
from discord.ext import commands
import os
from dotenv import load_dotenv

load_dotenv()

intents = discord.Intents.default()
intents.message_content = True

bot = commands.Bot(command_prefix='!', intents=intents)

@bot.event
async def on_ready():
    print(f'{bot.user} has connected to Discord!')

@bot.command(name='ping')
async def ping(ctx):
    await ctx.send('Pong!')

bot.run(os.getenv('DISCORD_TOKEN'))
`;
  }

  private getMusicPythonTemplate(): string {
    return `import discord
from discord.ext import commands
import os
from dotenv import load_dotenv

load_dotenv()

intents = discord.Intents.default()
intents.message_content = True

bot = commands.Bot(command_prefix='!', intents=intents)

@bot.event
async def on_ready():
    print(f'Music Bot {bot.user} is ready!')

@bot.command(name='play')
async def play(ctx, *, song):
    await ctx.send('Music functionality coming soon!')

@bot.command(name='queue')
async def queue(ctx):
    await ctx.send('Queue is empty.')

bot.run(os.getenv('DISCORD_TOKEN'))
`;
  }

  private getModerationPythonTemplate(): string {
    return `import discord
from discord.ext import commands
import os
from dotenv import load_dotenv

load_dotenv()

intents = discord.Intents.default()
intents.message_content = True
intents.members = True

bot = commands.Bot(command_prefix='!', intents=intents)

@bot.event
async def on_ready():
    print(f'Moderation Bot {bot.user} is ready!')

@bot.command(name='kick')
@commands.has_permissions(kick_members=True)
async def kick(ctx, member: discord.Member, *, reason=None):
    await ctx.send('Kick functionality coming soon!')

@bot.command(name='ban')
@commands.has_permissions(ban_members=True)
async def ban(ctx, member: discord.Member, *, reason=None):
    await ctx.send('Ban functionality coming soon!')

bot.run(os.getenv('DISCORD_TOKEN'))
`;
  }

  private getEconomyPythonTemplate(): string {
    return `import discord
from discord.ext import commands
import os
from dotenv import load_dotenv

load_dotenv()

intents = discord.Intents.default()
intents.message_content = True

bot = commands.Bot(command_prefix='!', intents=intents)

# Simple in-memory economy (use database in production)
user_balances = {}

@bot.event
async def on_ready():
    print(f'Economy Bot {bot.user} is ready!')

@bot.command(name='balance')
async def balance(ctx):
    user_id = ctx.author.id
    balance = user_balances.get(user_id, 0)
    await ctx.send(f'Your balance: {balance} coins')

@bot.command(name='daily')
async def daily(ctx):
    user_id = ctx.author.id
    current_balance = user_balances.get(user_id, 0)
    user_balances[user_id] = current_balance + 100
    await ctx.send('You received 100 daily coins!')

bot.run(os.getenv('DISCORD_TOKEN'))
`;
  }
}

export const botManager = new BotManager();
