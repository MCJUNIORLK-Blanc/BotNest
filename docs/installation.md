# BotCommander Installation Guide

This guide will help you install BotCommander on your Linux system using our automated installation script.

## One-Command Installation

The fastest way to install BotCommander is using our automated script:

### Basic Installation
```bash
curl -fsSL https://raw.githubusercontent.com/MCJUNIORLK-Blanc/TestDCBotPanel/main/install.sh | sudo bash
```

This will install BotCommander with default settings accessible at `http://localhost`.

### Advanced Installation with SSL
```bash
curl -fsSL https://raw.githubusercontent.com/MCJUNIORLK-Blanc/TestDCBotPanel/main/install.sh | sudo bash -s -- \
  --domain your-domain.com \
  --email your-email@domain.com \
  --ssl
```

## Installation Options

| Option | Description | Required for SSL |
|--------|-------------|------------------|
| `--domain` | Your domain name (e.g., `bot.example.com`) | Yes |
| `--email` | Your email for SSL certificate | Yes |
| `--ssl` | Enable Let's Encrypt SSL certificate | No |
| `--help` | Show help information | No |

## System Requirements

### Minimum Requirements
- **OS**: Linux (Ubuntu, Debian, CentOS, RHEL, etc.)
- **RAM**: 1GB (2GB recommended)
- **Storage**: 2GB free space
- **Network**: Internet connection for downloading packages

### Supported Operating Systems
- Ubuntu 18.04, 20.04, 22.04, 24.04
- Debian 10, 11, 12
- CentOS 7, 8, 9 (Stream)
- RHEL 7, 8, 9
- Rocky Linux 8, 9
- AlmaLinux 8, 9
- Raspberry Pi OS (Debian-based)

## What Gets Installed

The installation script will:

1. **Install Dependencies**:
   - Node.js 20.x (LTS)
   - Python 3 with pip
   - Apache Web Server
   - PM2 Process Manager
   - PostgreSQL Client
   - Git and other utilities

2. **Create System User**:
   - User: `botcommander`
   - Home Directory: `/opt/botcommander`

3. **Setup Application**:
   - Download latest BotCommander release
   - Install Node.js dependencies
   - Build production assets
   - Configure PM2 for process management

4. **Configure Apache**:
   - Virtual host configuration
   - Reverse proxy for API requests
   - WebSocket proxy support
   - Static file serving

5. **Setup SSL (Optional)**:
   - Install Certbot
   - Generate Let's Encrypt certificate
   - Configure HTTPS redirect

6. **Configure Firewall**:
   - Open ports 80 (HTTP) and 443 (HTTPS)
   - Keep SSH access open

## Post-Installation

After installation completes, you can:

### Access the Web Interface
- **HTTP**: `http://your-server-ip` or `http://your-domain.com`
- **HTTPS**: `https://your-domain.com` (if SSL enabled)

### Manage the Service
```bash
# View status
sudo -u botcommander pm2 status

# View logs
sudo -u botcommander pm2 logs botcommander

# Restart service
sudo -u botcommander pm2 restart botcommander

# Stop service
sudo -u botcommander pm2 stop botcommander
```

### Directory Structure
```
/opt/botcommander/           # Main application directory
├── bots/                    # Discord bot files
├── logs/                    # Application logs
├── uploads/                 # File uploads
├── dist/                    # Built application
└── ecosystem.config.js      # PM2 configuration

/var/log/botcommander/       # System logs
├── apache_access.log        # Apache access logs
├── apache_error.log         # Apache error logs
├── access.log              # Application access logs
├── error.log               # Application error logs
└── combined.log            # Combined logs
```

## Troubleshooting

### Installation Fails
1. Make sure you're running as root: `sudo bash`
2. Check internet connectivity
3. Verify your OS is supported
4. Check the installation logs

### Can't Access Web Interface
1. Check if Apache is running: `systemctl status apache2`
2. Check if BotCommander is running: `sudo -u botcommander pm2 status`
3. Check firewall settings: `ufw status` or `firewall-cmd --list-all`
4. Check Apache logs: `tail -f /var/log/botcommander/apache_error.log`

### SSL Issues
1. Make sure your domain points to your server
2. Check if ports 80 and 443 are open
3. Verify email address is correct
4. Check Certbot logs: `journalctl -u certbot`

## Manual Installation

If the automated script doesn't work for your system, see our [Manual Installation Guide](manual-installation.md).

## Updating BotCommander

To update to the latest version:

```bash
# Stop the application
sudo -u botcommander pm2 stop botcommander

# Navigate to application directory
cd /opt/botcommander

# Pull latest changes
sudo -u botcommander git pull

# Install dependencies
sudo -u botcommander npm install

# Build application
sudo -u botcommander npm run build

# Start the application
sudo -u botcommander pm2 start ecosystem.config.js
```

## Uninstallation

To completely remove BotCommander:

```bash
# Stop and remove PM2 process
sudo -u botcommander pm2 stop botcommander
sudo -u botcommander pm2 delete botcommander

# Remove Apache configuration
sudo a2dissite botcommander
sudo rm /etc/apache2/sites-available/botcommander.conf

# Remove SSL certificate (if installed)
sudo certbot delete --cert-name your-domain.com

# Remove application files
sudo rm -rf /opt/botcommander
sudo rm -rf /var/log/botcommander

# Remove user account
sudo userdel botcommander

# Remove PM2
sudo npm uninstall -g pm2

# Restart Apache
sudo systemctl restart apache2
```