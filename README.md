# 🎮 BotCommander - Discord Bot Management Panel

> **Professional Discord bot management made simple**

BotCommander is a comprehensive web-based management panel for Discord bots, designed with a gaming-themed interface. Built for developers who need professional bot hosting, monitoring, and management capabilities on Linux systems.

**🚀 Features:**
- Real-time bot monitoring and control
- Support for Node.js and Python Discord bots
- Built-in file manager and code editor
- System resource monitoring
- Apache reverse proxy integration
- SSL/TLS support with Let's Encrypt

[![GitHub Stars](https://img.shields.io/github/stars/MCJUNIORLK-Blanc/TestDCBotPanel?style=for-the-badge)](https://github.com/MCJUNIORLK-Blanc/TestDCBotPanel/stargazers)
[![License](https://img.shields.io/github/license/MCJUNIORLK-Blanc/TestDCBotPanel?style=for-the-badge)](LICENSE)
[![GitHub Release](https://img.shields.io/github/v/release/MCJUNIORLK-Blanc/TestDCBotPanel?style=for-the-badge)](https://github.com/MCJUNIORLK-Blanc/TestDCBotPanel/releases)

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎮 **Gaming Interface**
- Dark theme with purple/blue accents
- Intuitive dashboard design
- Real-time WebSocket updates
- Mobile-responsive layout

### 🤖 **Multi-Language Support**
- **Node.js** Discord bots
- **Python** Discord bots  
- Pre-built templates available
- Custom bot deployment

</td>
<td width="50%">

### 📊 **Live Monitoring**
- Real-time system metrics
- Bot performance tracking
- Resource usage graphs
- Activity logging

### 🔧 **Professional Tools**
- Built-in code editor
- File manager interface
- Process control (PM2)
- Apache integration

</td>
</tr>
</table>

### 🚀 **One-Click Installation**
- Automated Linux installation
- Apache reverse proxy setup
- SSL/TLS with Let's Encrypt
- Firewall configuration

## Quick Installation

### One-Command Installation

The easiest way to install BotCommander on your Linux system is using our automated installation script:

```bash
# Basic installation (localhost access only)
curl -fsSL https://raw.githubusercontent.com/MCJUNIORLK-Blanc/TestDCBotPanel/main/install.sh | sudo bash

# Or use wget if curl is not available
wget -qO- https://raw.githubusercontent.com/MCJUNIORLK-Blanc/TestDCBotPanel/main/install.sh | sudo bash

# Installation with custom domain and SSL certificate

# Option A: Direct pipe
curl -fsSL https://raw.githubusercontent.com/MCJUNIORLK-Blanc/TestDCBotPanel/main/install.sh | sudo bash -s -- \
  --domain your-domain.com \
  --email your-email@domain.com \
  --ssl

# Option B: Download first (recommended if pipe fails)
curl -fsSL https://raw.githubusercontent.com/MCJUNIORLK-Blanc/TestDCBotPanel/main/install.sh -o install.sh
chmod +x install.sh
sudo ./install.sh --domain your-domain.com --email your-email@domain.com --ssl
```

---

## 📸 Screenshots

<details>
<summary>🎮 Click to view interface screenshots</summary>

### Dashboard Overview
*Real-time monitoring of all your Discord bots with system metrics*

### Bot Management  
*Intuitive controls for starting, stopping, and configuring bots*

### File Manager
*Built-in code editor with syntax highlighting for bot development*

### Settings Panel
*Comprehensive configuration options and system information*

</details>

---

### Installation Options

| Parameter | Description | Example | Required |
|-----------|-------------|---------|----------|
| `--domain` | Custom domain name | `--domain bot.example.com` | For SSL |
| `--email` | Email for SSL certificate | `--email admin@example.com` | For SSL |
| `--ssl` | Enable Let's Encrypt SSL | `--ssl` | Optional |
| `--help` | Show help information | `--help` | - |

### Supported Systems

- ✅ Ubuntu 18.04, 20.04, 22.04, 24.04
- ✅ Debian 10, 11, 12
- ✅ CentOS 7, 8, 9
- ✅ RHEL 7, 8, 9
- ✅ Rocky Linux 8, 9
- ✅ AlmaLinux 8, 9
- ✅ Raspberry Pi OS (Debian-based)

---

## 🎯 Quick Start

### **Method 1: One-Command Installation (Recommended)**

Perfect for production deployment with Apache and SSL:

```bash
# Option A: Direct pipe (most systems)
curl -fsSL https://raw.githubusercontent.com/MCJUNIORLK-Blanc/TestDCBotPanel/main/install.sh | sudo bash

# Option B: Download first, then execute (more reliable)
curl -fsSL https://raw.githubusercontent.com/MCJUNIORLK-Blanc/TestDCBotPanel/main/install.sh -o install.sh && chmod +x install.sh && sudo ./install.sh

# Option C: Using wget instead of curl
wget -qO- https://raw.githubusercontent.com/MCJUNIORLK-Blanc/TestDCBotPanel/main/install.sh | sudo bash
```

### **Method 2: Development Setup**

For development and testing:

```bash
git clone https://github.com/MCJUNIORLK-Blanc/TestDCBotPanel.git
cd TestDCBotPanel
npm install
npm run dev
```

---
