#!/bin/bash

# BotCommander Direct Installation Script
# This script downloads and installs BotCommander without requiring GitHub

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="botcommander"
APP_USER="botcommander"
APP_DIR="/opt/botcommander"
SERVICE_NAME="botcommander"
DOMAIN=""
EMAIL=""
USE_SSL=false

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to detect OS
detect_os() {
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    elif type lsb_release >/dev/null 2>&1; then
        OS=$(lsb_release -si)
        VER=$(lsb_release -sr)
    elif [[ -f /etc/redhat-release ]]; then
        OS="Red Hat Enterprise Linux"
        VER=$(cat /etc/redhat-release | grep -oE '[0-9]+\.[0-9]+')
    else
        OS=$(uname -s)
        VER=$(uname -r)
    fi
    
    print_status "Detected OS: $OS $VER"
}

# Function to check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "This script must be run as root (use sudo)"
        exit 1
    fi
}

# Function to install dependencies based on OS
install_dependencies() {
    print_status "Installing system dependencies..."
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]] || [[ "$OS" == *"Raspbian"* ]]; then
        export DEBIAN_FRONTEND=noninteractive
        apt-get update
        apt-get install -y curl wget gnupg2 software-properties-common apt-transport-https ca-certificates git apache2 jq unzip
        
        # Install Node.js 20.x (latest LTS)
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
        
        # Install Python 3 and pip
        apt-get install -y python3 python3-pip python3-venv
        
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]] || [[ "$OS" == *"Rocky"* ]] || [[ "$OS" == *"AlmaLinux"* ]]; then
        if command -v dnf >/dev/null 2>&1; then
            dnf update -y
            dnf install -y curl wget gnupg2 git httpd jq unzip
        else
            yum update -y
            yum install -y curl wget gnupg2 git httpd jq unzip
        fi
        
        # Install Node.js 20.x
        curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
        if command -v dnf >/dev/null 2>&1; then
            dnf install -y nodejs
        else
            yum install -y nodejs
        fi
        
        # Install Python 3 and pip
        if command -v dnf >/dev/null 2>&1; then
            dnf install -y python3 python3-pip
        else
            yum install -y python3 python3-pip
        fi
        
    else
        print_error "Unsupported operating system: $OS"
        print_error "Supported systems: Ubuntu, Debian, CentOS, RHEL, Rocky Linux, AlmaLinux, Raspberry Pi OS"
        exit 1
    fi
    
    # Install PM2 globally
    npm install -g pm2
    
    print_success "Dependencies installed successfully"
}

# Function to create application user
create_user() {
    print_status "Creating application user..."
    
    if ! id "$APP_USER" &>/dev/null; then
        useradd -r -s /bin/bash -d "$APP_DIR" "$APP_USER"
        print_success "User $APP_USER created"
    else
        print_warning "User $APP_USER already exists"
    fi
}

# Function to create basic application structure
create_app_structure() {
    print_status "Creating application structure..."
    
    # Create directory structure
    mkdir -p "$APP_DIR"
    mkdir -p "$APP_DIR/bots"
    mkdir -p "$APP_DIR/logs"
    mkdir -p "$APP_DIR/uploads"
    mkdir -p "/var/log/$APP_NAME"
    
    # Create a basic package.json
    cat > "$APP_DIR/package.json" << 'EOF'
{
  "name": "botcommander",
  "version": "1.0.0",
  "description": "Discord Bot Management Panel",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "node index.js"
  },
  "dependencies": {
    "express": "^4.18.0",
    "ws": "^8.18.0",
    "multer": "^1.4.5"
  }
}
EOF

    # Create basic index.js
    cat > "$APP_DIR/index.js" << 'EOF'
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>BotCommander Installation Success</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #1a1a1a; color: #fff; }
                    .container { max-width: 600px; margin: 0 auto; }
                    .logo { font-size: 3rem; color: #9f7aea; margin-bottom: 20px; }
                    .success { color: #48bb78; margin-bottom: 20px; }
                    .info { background: #2d3748; padding: 20px; border-radius: 10px; margin: 20px 0; }
                    .code { background: #1a202c; padding: 10px; border-radius: 5px; font-family: monospace; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="logo">🎮 BotCommander</div>
                    <div class="success">✅ Installation Successful!</div>
                    <p>BotCommander has been installed successfully on your system.</p>
                    
                    <div class="info">
                        <h3>Next Steps:</h3>
                        <p>1. Upload your Discord bot files to <code>/opt/botcommander/bots/</code></p>
                        <p>2. Configure your bot tokens</p>
                        <p>3. Start managing your Discord bots!</p>
                    </div>
                    
                    <div class="info">
                        <h3>Quick Commands:</h3>
                        <div class="code">sudo -u botcommander pm2 status</div>
                        <div class="code">sudo -u botcommander pm2 logs botcommander</div>
                    </div>
                    
                    <p><strong>The full BotCommander interface will be available once you clone the complete repository.</strong></p>
                </div>
            </body>
        </html>
    `);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`BotCommander installation server running on port ${PORT}`);
    console.log(`Access at: http://localhost:${PORT}`);
});
EOF

    # Set ownership
    chown -R "$APP_USER:$APP_USER" "$APP_DIR"
    chown -R "$APP_USER:$APP_USER" "/var/log/$APP_NAME"
    
    print_success "Application structure created"
}

# Function to install Node.js dependencies
install_node_dependencies() {
    print_status "Installing Node.js dependencies..."
    
    cd "$APP_DIR"
    sudo -u "$APP_USER" npm install
    
    print_success "Node.js dependencies installed"
}

# Function to setup PM2
setup_pm2() {
    print_status "Setting up PM2 process manager..."
    
    # Create PM2 ecosystem file
    cat > "$APP_DIR/ecosystem.config.js" << EOF
module.exports = {
  apps: [{
    name: '$SERVICE_NAME',
    script: './index.js',
    cwd: '$APP_DIR',
    user: '$APP_USER',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/$APP_NAME/error.log',
    out_file: '/var/log/$APP_NAME/access.log',
    log_file: '/var/log/$APP_NAME/combined.log',
    time: true
  }]
};
EOF

    chown "$APP_USER:$APP_USER" "$APP_DIR/ecosystem.config.js"
    
    print_success "PM2 setup complete"
}

# Function to start services
start_services() {
    print_status "Starting services..."
    
    # Start the application with PM2
    cd "$APP_DIR"
    sudo -u "$APP_USER" pm2 start ecosystem.config.js
    sudo -u "$APP_USER" pm2 save
    
    print_success "Services started successfully"
}

# Function to display completion info
show_completion_info() {
    print_success "BotCommander basic installation completed!"
    echo ""
    echo "======================================"
    echo "INSTALLATION SUMMARY"
    echo "======================================"
    echo "Application Directory: $APP_DIR"
    echo "Application User: $APP_USER"
    echo "Service Name: $SERVICE_NAME"
    echo "Web Interface: http://localhost:5000"
    echo ""
    echo "USEFUL COMMANDS:"
    echo "- View application status: sudo -u $APP_USER pm2 status"
    echo "- View application logs: sudo -u $APP_USER pm2 logs $SERVICE_NAME"
    echo "- Restart application: sudo -u $APP_USER pm2 restart $SERVICE_NAME"
    echo "- Stop application: sudo -u $APP_USER pm2 stop $SERVICE_NAME"
    echo ""
    echo "NEXT STEPS:"
    echo "1. Access the web interface at http://localhost:5000"
    echo "2. Clone the full BotCommander repository for complete functionality"
    echo "3. Replace this basic installation with the full version"
    echo ""
    print_warning "This is a basic installation. For full features, clone the complete repository!"
}

# Main installation function
main() {
    print_status "Starting BotCommander basic installation..."
    
    check_root
    detect_os
    install_dependencies
    create_user
    create_app_structure
    install_node_dependencies
    setup_pm2
    start_services
    show_completion_info
}

# Run the main function
main "$@"