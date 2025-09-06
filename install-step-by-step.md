# BotCommander Installation - Step by Step

If the one-line command doesn't work, follow these steps:

## Method 1: Download and Execute Separately

```bash
# Step 1: Download the installation script
curl -fsSL https://raw.githubusercontent.com/MCJUNIORLK-Blanc/TestDCBotPanel/main/install.sh -o install.sh

# Step 2: Make it executable
chmod +x install.sh

# Step 3: Run the installation
sudo ./install.sh
```

## Method 2: Using wget instead of curl

```bash
# Download with wget
wget -qO install.sh https://raw.githubusercontent.com/MCJUNIORLK-Blanc/TestDCBotPanel/main/install.sh

# Make executable and run
chmod +x install.sh
sudo ./install.sh
```

## Method 3: Direct bash execution

```bash
# Execute directly with bash
sudo bash -c "$(curl -fsSL https://raw.githubusercontent.com/MCJUNIORLK-Blanc/TestDCBotPanel/main/install.sh)"
```

## Method 4: With options (domain and SSL)

```bash
# Download first
curl -fsSL https://raw.githubusercontent.com/MCJUNIORLK-Blanc/TestDCBotPanel/main/install.sh -o install.sh
chmod +x install.sh

# Run with options
sudo ./install.sh --domain your-domain.com --email your-email@domain.com --ssl
```

## Troubleshooting

If you still get DNS resolution errors:
1. Check your internet connection
2. Try using a different DNS server: `sudo echo "nameserver 8.8.8.8" >> /etc/resolv.conf`
3. Use the direct installation method above