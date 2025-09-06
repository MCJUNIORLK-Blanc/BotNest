# BotCommander - Discord Bot Management Panel

A gaming-themed web panel for managing Discord bots in Node.js and Python with Apache compatibility and one-script installation.

![BotCommander Dashboard](https://via.placeholder.com/800x400/262626/9f7aea?text=BotCommander+Dashboard)

## Features

### 🎮 Gaming-Themed Interface
- Dark gaming aesthetic with purple/blue accents
- Intuitive navigation and controls
- Real-time status updates with WebSocket connectivity
- Responsive design for desktop and mobile

### 🤖 Bot Management
- Support for Node.js and Python Discord bots
- Multiple bot templates (Basic, Music, Moderation, Economy)
- Real-time bot status monitoring
- One-click start, stop, and restart controls
- Process management with automatic restarts
- Resource usage monitoring (CPU, Memory)

### 📁 File Management
- Built-in code editor for bot files
- File upload/download capabilities
- Directory structure management
- Syntax highlighting for code files

### 📊 System Monitoring
- Real-time system resource monitoring
- CPU, Memory, Disk, and Network usage tracking
- Bot performance metrics
- Activity feed with detailed logging

### 🔧 Advanced Features
- WebSocket real-time updates
- Comprehensive logging system
- Settings management
- Apache reverse proxy support
- SSL/TLS support with Let's Encrypt
- PM2 process management
- Automatic backups

## Quick Installation

### One-Command Installation

The easiest way to install BotCommander on your Linux system is using our automated installation script:

```bash
# Basic installation (localhost access only)
curl -fsSL https://raw.githubusercontent.com/MCJUNIORLK-Blanc/TestDCBotPanel/main/install.sh | sudo bash

# Or use wget if curl is not available
wget -qO- https://raw.githubusercontent.com/MCJUNIORLK-Blanc/TestDCBotPanel/main/install.sh | sudo bash

# Installation with custom domain and SSL certificate
curl -fsSL https://raw.githubusercontent.com/MCJUNIORLK-Blanc/TestDCBotPanel/main/install.sh | sudo bash -s -- \
  --domain your-domain.com \
  --email your-email@domain.com \
  --ssl
```

### Installation Options

| Option | Description | Example |
|--------|-------------|---------|
| `--domain` | Set custom domain name | `--domain bot.example.com` |
| `--email` | Email for SSL certificate | `--email admin@example.com` |
| `--ssl` | Enable Let's Encrypt SSL | `--ssl` |
| `--help` | Show help information | `--help` |

### Supported Systems

- ✅ Ubuntu 18.04, 20.04, 22.04, 24.04
- ✅ Debian 10, 11, 12
- ✅ CentOS 7, 8, 9
- ✅ RHEL 7, 8, 9
- ✅ Rocky Linux 8, 9
- ✅ AlmaLinux 8, 9
- ✅ Raspberry Pi OS (Debian-based)
