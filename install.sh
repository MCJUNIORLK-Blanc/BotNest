#!/bin/bash

# BotCommander - Discord Bot Management Panel Installation Script
# Compatible with Ubuntu, Debian, CentOS, RHEL, Rocky Linux, AlmaLinux, and Raspberry Pi OS
# 
# Usage:
# curl -fsSL https://install.botcommander.dev/install.sh | sudo bash
# 
# With options:
# curl -fsSL https://install.botcommander.dev/install.sh | sudo bash -s -- --domain your-domain.com --email your-email@domain.com --ssl

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
GITHUB_REPO="https://github.com/yourusername/botcommander"
RELEASE_URL="https://api.github.com/repos/yourusername/botcommander/releases/latest"

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
        
        # Install PostgreSQL client for database support
        apt-get install -y postgresql-client
        
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]] || [[ "$OS" == *"Rocky"* ]] || [[ "$OS" == *"AlmaLinux"* ]]; then
        if command -v dnf >/dev/null 2>&1; then
            dnf update -y
            dnf install -y curl wget gnupg2 git httpd jq unzip postgresql
        else
            yum update -y
            yum install -y curl wget gnupg2 git httpd jq unzip postgresql
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

# Function to download and setup application
download_application() {
    print_status "Downloading BotCommander application..."
    
    # Create temporary directory
    TEMP_DIR=$(mktemp -d)
    cd "$TEMP_DIR"
    
    # Try to get latest release
    if command -v jq >/dev/null 2>&1; then
        print_status "Fetching latest release information..."
        DOWNLOAD_URL=$(curl -s "$RELEASE_URL" | jq -r '.tarball_url')
        if [[ "$DOWNLOAD_URL" != "null" ]] && [[ -n "$DOWNLOAD_URL" ]]; then
            print_status "Downloading from release..."
            curl -L "$DOWNLOAD_URL" | tar xz --strip-components=1
        else
            print_status "Release not found, cloning repository..."
            git clone "$GITHUB_REPO" .
        fi
    else
        print_status "Cloning repository (jq not available)..."
        git clone "$GITHUB_REPO" .
    fi
    
    print_success "Application downloaded successfully"
    return 0
}

# Function to setup application directory
setup_app_directory() {
    print_status "Setting up application directory..."
    
    # Create directory structure
    mkdir -p "$APP_DIR"
    mkdir -p "$APP_DIR/bots"
    mkdir -p "$APP_DIR/logs"
    mkdir -p "$APP_DIR/uploads"
    mkdir -p "/var/log/$APP_NAME"
    
    # Download and setup application files
    download_application
    
    # Copy application files to installation directory
    print_status "Installing application files..."
    cp -r * "$APP_DIR/"
    
    # Set ownership
    chown -R "$APP_USER:$APP_USER" "$APP_DIR"
    chown -R "$APP_USER:$APP_USER" "/var/log/$APP_NAME"
    
    # Clean up temporary directory
    cd /
    rm -rf "$TEMP_DIR"
    
    print_success "Application directory setup complete"
}

# Function to install Node.js dependencies
install_node_dependencies() {
    print_status "Installing Node.js dependencies..."
    
    cd "$APP_DIR"
    
    # Install dependencies as the app user
    sudo -u "$APP_USER" npm install
    
    # Build the application (if applicable)
    if [[ -f "package.json" ]] && grep -q "build" package.json; then
        sudo -u "$APP_USER" npm run build
    fi
    
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
    script: './dist/index.js',
    cwd: '$APP_DIR',
    user: '$APP_USER',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      BOTS_DIR: '$APP_DIR/bots'
    },
    error_file: '/var/log/$APP_NAME/error.log',
    out_file: '/var/log/$APP_NAME/access.log',
    log_file: '/var/log/$APP_NAME/combined.log',
    time: true
  }]
};
EOF

    chown "$APP_USER:$APP_USER" "$APP_DIR/ecosystem.config.js"
    
    # Setup PM2 startup script
    sudo -u "$APP_USER" pm2 startup
    
    print_success "PM2 setup complete"
}

# Function to configure Apache
configure_apache() {
    print_status "Configuring Apache web server..."
    
    # Enable required Apache modules
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        a2enmod proxy
        a2enmod proxy_http
        a2enmod proxy_wstunnel
        a2enmod rewrite
        a2enmod ssl
        a2enmod headers
    fi
    
    # Create Apache virtual host configuration
    cat > "/etc/apache2/sites-available/$APP_NAME.conf" << EOF
<VirtualHost *:80>
    ServerName ${DOMAIN:-localhost}
    DocumentRoot $APP_DIR/dist/public
    
    # Proxy API requests to Node.js
    ProxyPreserveHost On
    ProxyRequests Off
    
    # Proxy WebSocket connections
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^/?(.*) "ws://localhost:5000/\$1" [P,L]
    
    # Proxy regular HTTP requests
    ProxyPass /api/ http://localhost:5000/api/
    ProxyPassReverse /api/ http://localhost:5000/api/
    
    # Serve static files directly
    <Directory "$APP_DIR/dist/public">
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
    Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
    
    # Logging
    ErrorLog /var/log/$APP_NAME/apache_error.log
    CustomLog /var/log/$APP_NAME/apache_access.log combined
</VirtualHost>
EOF

    # Enable the site
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        a2ensite "$APP_NAME"
        a2dissite 000-default
        systemctl reload apache2
    else
        # For CentOS/RHEL, include the config in main httpd.conf
        echo "Include /etc/apache2/sites-available/$APP_NAME.conf" >> /etc/httpd/conf/httpd.conf
        systemctl reload httpd
    fi
    
    print_success "Apache configuration complete"
}

# Function to setup SSL with Let's Encrypt (optional)
setup_ssl() {
    if [[ "$USE_SSL" == true ]] && [[ -n "$DOMAIN" ]] && [[ -n "$EMAIL" ]]; then
        print_status "Setting up SSL with Let's Encrypt..."
        
        # Install Certbot
        if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
            apt-get install -y certbot python3-certbot-apache
        elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]]; then
            yum install -y certbot python3-certbot-apache
        fi
        
        # Get SSL certificate
        certbot --apache -d "$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive
        
        print_success "SSL certificate installed"
    fi
}

# Function to setup firewall
setup_firewall() {
    print_status "Configuring firewall..."
    
    if command -v ufw >/dev/null 2>&1; then
        # Ubuntu/Debian with UFW
        ufw --force enable
        ufw allow ssh
        ufw allow 80/tcp
        ufw allow 443/tcp
        print_success "UFW firewall configured"
    elif command -v firewall-cmd >/dev/null 2>&1; then
        # CentOS/RHEL with firewalld
        systemctl enable firewalld
        systemctl start firewalld
        firewall-cmd --permanent --add-service=ssh
        firewall-cmd --permanent --add-service=http
        firewall-cmd --permanent --add-service=https
        firewall-cmd --reload
        print_success "Firewalld configured"
    else
        print_warning "No supported firewall found. Please configure manually."
    fi
}

# Function to start services
start_services() {
    print_status "Starting services..."
    
    # Start Apache
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        systemctl enable apache2
        systemctl start apache2
    else
        systemctl enable httpd
        systemctl start httpd
    fi
    
    # Start the application with PM2
    cd "$APP_DIR"
    sudo -u "$APP_USER" pm2 start ecosystem.config.js
    sudo -u "$APP_USER" pm2 save
    
    print_success "Services started successfully"
}

# Function to display final information
show_completion_info() {
    print_success "BotCommander installation completed successfully!"
    echo ""
    echo "======================================"
    echo "INSTALLATION SUMMARY"
    echo "======================================"
    echo "Application Directory: $APP_DIR"
    echo "Application User: $APP_USER"
    echo "Service Name: $SERVICE_NAME"
    echo "Web Interface: http://${DOMAIN:-localhost}"
    if [[ "$USE_SSL" == true ]]; then
        echo "Secure Interface: https://${DOMAIN}"
    fi
    echo ""
    echo "USEFUL COMMANDS:"
    echo "- View application status: sudo -u $APP_USER pm2 status"
    echo "- View application logs: sudo -u $APP_USER pm2 logs $SERVICE_NAME"
    echo "- Restart application: sudo -u $APP_USER pm2 restart $SERVICE_NAME"
    echo "- Stop application: sudo -u $APP_USER pm2 stop $SERVICE_NAME"
    echo ""
    echo "NEXT STEPS:"
    echo "1. Access the web interface at http://${DOMAIN:-localhost}"
    echo "2. Create your first Discord bot"
    echo "3. Configure your bot tokens in the settings"
    echo ""
    print_warning "Remember to keep your Discord bot tokens secure!"
    echo ""
}

# Function to handle script arguments
handle_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -d|--domain)
                DOMAIN="$2"
                shift 2
                ;;
            -e|--email)
                EMAIL="$2"
                shift 2
                ;;
            --ssl)
                USE_SSL=true
                shift
                ;;
            -h|--help)
                echo "BotCommander Installation Script"
                echo ""
                echo "Usage: $0 [options]"
                echo ""
                echo "Options:"
                echo "  -d, --domain DOMAIN    Set domain name for Apache virtual host"
                echo "  -e, --email EMAIL      Set email for Let's Encrypt SSL certificate"
                echo "  --ssl                  Enable SSL with Let's Encrypt"
                echo "  -h, --help            Show this help message"
                echo ""
                echo "Example:"
                echo "  $0 --domain bot.example.com --email admin@example.com --ssl"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                echo "Use -h or --help for usage information"
                exit 1
                ;;
        esac
    done
}

# Main installation function
main() {
    print_status "Starting BotCommander installation..."
    
    handle_arguments "$@"
    check_root
    detect_os
    install_dependencies
    create_user
    setup_app_directory
    install_node_dependencies
    setup_pm2
    configure_apache
    setup_ssl
    setup_firewall
    start_services
    show_completion_info
}

# Run the main function with all arguments
main "$@"
