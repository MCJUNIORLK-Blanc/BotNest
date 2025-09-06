# Standalone Deployment Guide

This guide explains how to deploy BotCommander as a standalone application without any platform-specific dependencies.

## Prerequisites

- Linux server (Ubuntu, Debian, CentOS, RHEL, Rocky Linux, AlmaLinux, or Raspberry Pi OS)
- Root or sudo access
- Internet connection
- Domain name (optional, for SSL)

## Quick Installation

The fastest way to deploy BotCommander is using our automated installation script:

### Basic Installation
```bash
# Download the installation script
curl -fsSL https://raw.githubusercontent.com/MCJUNIORLK-Blanc/TestDCBotPanel/main/install.sh -o install.sh
chmod +x install.sh

# Run the installation
sudo ./install.sh
```

### Installation with SSL
```bash
# Download and run with domain and SSL
curl -fsSL https://raw.githubusercontent.com/MCJUNIORLK-Blanc/TestDCBotPanel/main/install.sh -o install.sh
chmod +x install.sh

sudo ./install.sh --domain your-domain.com --email your-email@domain.com --ssl
```

## Manual Installation

If you prefer manual installation or need custom configuration:

### 1. Install Dependencies

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install -y curl wget git apache2 nodejs npm python3 python3-pip
```

**CentOS/RHEL/Rocky/AlmaLinux:**
```bash
sudo dnf update -y  # or yum on older systems
sudo dnf install -y curl wget git httpd nodejs npm python3 python3-pip
```

### 2. Install PM2 Process Manager
```bash
sudo npm install -g pm2
```

### 3. Clone and Setup Application
```bash
# Clone the repository
git clone https://github.com/MCJUNIORLK-Blanc/TestDCBotPanel.git
cd TestDCBotPanel

# Install dependencies
npm install

# Build the application
npm run build
```

### 4. Create System User
```bash
sudo useradd -r -s /bin/bash -d /opt/botcommander botcommander
sudo mkdir -p /opt/botcommander
sudo cp -r * /opt/botcommander/
sudo chown -R botcommander:botcommander /opt/botcommander
```

### 5. Configure PM2
```bash
# Create PM2 configuration
sudo -u botcommander pm2 start /opt/botcommander/ecosystem.config.js
sudo -u botcommander pm2 save
sudo -u botcommander pm2 startup
```

### 6. Configure Apache

Create Apache virtual host configuration:

```bash
sudo tee /etc/apache2/sites-available/botcommander.conf << 'EOF'
<VirtualHost *:80>
    ServerName localhost
    DocumentRoot /opt/botcommander/dist/public
    
    # Enable required modules
    LoadModule proxy_module modules/mod_proxy.so
    LoadModule proxy_http_module modules/mod_proxy_http.so
    LoadModule rewrite_module modules/mod_rewrite.so
    
    # Proxy API requests to Node.js
    ProxyPreserveHost On
    ProxyRequests Off
    
    # Proxy WebSocket connections
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^/?(.*) "ws://localhost:5000/$1" [P,L]
    
    # Proxy regular HTTP requests
    ProxyPass /api/ http://localhost:5000/api/
    ProxyPassReverse /api/ http://localhost:5000/api/
    
    # Serve static files directly
    <Directory "/opt/botcommander/dist/public">
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # Handle client-side routing
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    # Security headers
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    
    ErrorLog /var/log/apache2/botcommander_error.log
    CustomLog /var/log/apache2/botcommander_access.log combined
</VirtualHost>
EOF

# Enable site and restart Apache
sudo a2ensite botcommander
sudo a2dissite 000-default  # optional
sudo systemctl restart apache2
```

### 7. Configure Firewall

**Ubuntu/Debian (UFW):**
```bash
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

**CentOS/RHEL/Rocky/AlmaLinux (Firewalld):**
```bash
sudo systemctl enable firewalld
sudo systemctl start firewalld
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## SSL Configuration (Optional)

To enable HTTPS with Let's Encrypt:

### 1. Install Certbot
**Ubuntu/Debian:**
```bash
sudo apt install -y certbot python3-certbot-apache
```

**CentOS/RHEL/Rocky/AlmaLinux:**
```bash
sudo dnf install -y certbot python3-certbot-apache
```

### 2. Obtain SSL Certificate
```bash
sudo certbot --apache -d your-domain.com --email your-email@domain.com --agree-tos --non-interactive
```

## Service Management

Once installed, you can manage BotCommander using these commands:

```bash
# Check application status
sudo -u botcommander pm2 status

# View logs
sudo -u botcommander pm2 logs botcommander

# Restart application
sudo -u botcommander pm2 restart botcommander

# Stop application
sudo -u botcommander pm2 stop botcommander

# Check Apache status
sudo systemctl status apache2  # or httpd on CentOS/RHEL
```

## File Structure

After installation, BotCommander will be organized as follows:

```
/opt/botcommander/
├── dist/              # Built application files
├── bots/              # Discord bot files
├── logs/              # Application logs
├── uploads/           # File uploads
├── ecosystem.config.js # PM2 configuration
└── package.json       # Node.js dependencies

/var/log/
├── apache2/           # Apache logs
└── botcommander/      # Application logs
```

## Troubleshooting

### Application not starting
```bash
# Check PM2 status
sudo -u botcommander pm2 status

# Check logs for errors
sudo -u botcommander pm2 logs botcommander

# Restart if needed
sudo -u botcommander pm2 restart botcommander
```

### Apache not serving files
```bash
# Check Apache status
sudo systemctl status apache2

# Check Apache configuration
sudo apache2ctl configtest

# Check Apache error logs
sudo tail -f /var/log/apache2/error.log
```

### Port conflicts
If port 5000 is already in use, edit the PM2 configuration:

```bash
sudo nano /opt/botcommander/ecosystem.config.js
# Change PORT environment variable to a different port
# Update Apache proxy configuration accordingly
```

## Updating

To update BotCommander to the latest version:

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

# Start application
sudo -u botcommander pm2 start ecosystem.config.js
```

## Backup and Restore

### Create Backup
```bash
# Backup application and bot files
sudo tar -czf botcommander-backup-$(date +%Y%m%d).tar.gz /opt/botcommander

# Backup database (if using PostgreSQL)
# sudo -u postgres pg_dump botcommander > botcommander-db-backup-$(date +%Y%m%d).sql
```

### Restore from Backup
```bash
# Stop application
sudo -u botcommander pm2 stop botcommander

# Restore files
sudo tar -xzf botcommander-backup-YYYYMMDD.tar.gz -C /

# Restore database (if applicable)
# sudo -u postgres psql botcommander < botcommander-db-backup-YYYYMMDD.sql

# Start application
sudo -u botcommander pm2 start botcommander
```

## Security Considerations

1. **Regular Updates**: Keep your system and BotCommander updated
2. **Firewall**: Only open necessary ports (80, 443, SSH)
3. **SSL**: Always use HTTPS in production
4. **File Permissions**: Ensure proper ownership of application files
5. **Bot Tokens**: Keep Discord bot tokens secure and never commit them to repositories
6. **Backups**: Regular automated backups of application and data

## Support

For issues and questions:
- GitHub Issues: [https://github.com/MCJUNIORLK-Blanc/TestDCBotPanel/issues](https://github.com/MCJUNIORLK-Blanc/TestDCBotPanel/issues)
- Documentation: [https://github.com/MCJUNIORLK-Blanc/TestDCBotPanel/tree/main/docs](https://github.com/MCJUNIORLK-Blanc/TestDCBotPanel/tree/main/docs)