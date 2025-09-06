#!/bin/bash

# BotCommander Quick Install Script
# This is a simple wrapper that downloads and executes the main installation script

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════════╗
║                          BotCommander                            ║
║                                                                  ║
║         Discord Bot Management Panel - Quick Installer          ║
║                                                                  ║
║  🎮 Gaming-themed Discord bot management                         ║
║  🤖 Node.js & Python bot support                                ║
║  🔧 Built-in file manager & code editor                         ║
║  📊 Real-time monitoring & logging                              ║
║  🌐 Apache integration with SSL support                         ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${GREEN}Starting BotCommander installation...${NC}"
echo ""

# Download and execute the main installation script
if command -v curl >/dev/null 2>&1; then
    curl -fsSL https://install.botcommander.dev/install.sh | bash "$@"
elif command -v wget >/dev/null 2>&1; then
    wget -qO- https://install.botcommander.dev/install.sh | bash "$@"
else
    echo "Error: Neither curl nor wget is available. Please install one of them first."
    exit 1
fi