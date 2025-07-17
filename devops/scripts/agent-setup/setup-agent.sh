#!/bin/bash

# Azure DevOps Agent Setup Script for Contabo Ubuntu Server
# This script automates the setup of an Azure DevOps agent on a Contabo Ubuntu server

# Exit on error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Azure DevOps Agent Setup for Contabo Ubuntu Server ===${NC}"
echo -e "${YELLOW}This script will install and configure an Azure DevOps agent on your Contabo server.${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run this script as root or with sudo.${NC}"
  exit 1
fi

# Collect required information
echo -e "${GREEN}Please provide the following information:${NC}"
read -p "Azure DevOps Organization URL (e.g., https://dev.azure.com/your-organization): " ORG_URL
read -p "Personal Access Token (PAT): " PAT
read -p "Agent Pool Name (default: ContaboAgentPool): " POOL_NAME
POOL_NAME=${POOL_NAME:-ContaboAgentPool}
read -p "Agent Name (default: ContaboAgent): " AGENT_NAME
AGENT_NAME=${AGENT_NAME:-ContaboAgent}
read -p "Create a new user for the agent? (y/n, default: y): " CREATE_USER
CREATE_USER=${CREATE_USER:-y}
read -p "Username for agent (default: azagent): " AGENT_USER
AGENT_USER=${AGENT_USER:-azagent}
read -p "Agent installation directory (default: /opt/azure-pipelines-agent): " AGENT_DIR
AGENT_DIR=${AGENT_DIR:-/opt/azure-pipelines-agent}

echo -e "${GREEN}=== Updating System ===${NC}"
apt update
apt upgrade -y

echo -e "${GREEN}=== Installing Dependencies ===${NC}"
# Install Node.js
echo -e "${YELLOW}Installing Node.js...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
    apt install -y nodejs
    echo -e "${GREEN}Node.js installed: $(node -v)${NC}"
else
    echo -e "${GREEN}Node.js already installed: $(node -v)${NC}"
fi

# Install Git
echo -e "${YELLOW}Installing Git...${NC}"
apt install -y git
echo -e "${GREEN}Git installed: $(git --version)${NC}"

# Install Docker (optional)
echo -e "${YELLOW}Do you want to install Docker? (y/n, default: y): ${NC}"
read INSTALL_DOCKER
INSTALL_DOCKER=${INSTALL_DOCKER:-y}
if [[ $INSTALL_DOCKER == "y" ]]; then
    echo -e "${YELLOW}Installing Docker...${NC}"
    apt install -y apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
    add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
    apt update
    apt install -y docker-ce
    echo -e "${GREEN}Docker installed: $(docker --version)${NC}"
fi

# Install Azure CLI
echo -e "${YELLOW}Installing Azure CLI...${NC}"
if ! command -v az &> /dev/null; then
    curl -sL https://aka.ms/InstallAzureCLIDeb | bash
    echo -e "${GREEN}Azure CLI installed: $(az --version | head -n 1)${NC}"
else
    echo -e "${GREEN}Azure CLI already installed: $(az --version | head -n 1)${NC}"
fi

# Create user for the agent
if [[ $CREATE_USER == "y" ]]; then
    echo -e "${GREEN}=== Creating User for Azure DevOps Agent ===${NC}"
    if id "$AGENT_USER" &>/dev/null; then
        echo -e "${YELLOW}User $AGENT_USER already exists.${NC}"
    else
        useradd -m -s /bin/bash $AGENT_USER
        echo -e "${GREEN}User $AGENT_USER created.${NC}"
    fi
    
    # Add user to docker group if Docker is installed
    if [[ $INSTALL_DOCKER == "y" ]]; then
        usermod -aG docker $AGENT_USER
        echo -e "${GREEN}Added $AGENT_USER to docker group.${NC}"
    fi
fi

# Create directory for the agent
echo -e "${GREEN}=== Creating Agent Directory ===${NC}"
mkdir -p $AGENT_DIR
if [[ $CREATE_USER == "y" ]]; then
    chown $AGENT_USER:$AGENT_USER $AGENT_DIR
fi
echo -e "${GREEN}Directory $AGENT_DIR created.${NC}"

# Download and configure the agent
echo -e "${GREEN}=== Downloading and Configuring Agent ===${NC}"
cd $AGENT_DIR

# Get the latest agent version
echo -e "${YELLOW}Fetching latest agent version...${NC}"
LATEST_VERSION=$(curl -s https://api.github.com/repos/microsoft/azure-pipelines-agent/releases/latest | grep -oP '"tag_name": "v\K(.*)(?=")')
if [ -z "$LATEST_VERSION" ]; then
    echo -e "${YELLOW}Could not determine latest version. Using default version 2.214.1.${NC}"
    LATEST_VERSION="2.214.1"
fi
echo -e "${GREEN}Latest agent version: $LATEST_VERSION${NC}"

# Download the agent
echo -e "${YELLOW}Downloading agent...${NC}"
curl -O https://vstsagentpackage.azureedge.net/agent/$LATEST_VERSION/vsts-agent-linux-x64-$LATEST_VERSION.tar.gz
echo -e "${GREEN}Agent downloaded.${NC}"

# Extract the agent
echo -e "${YELLOW}Extracting agent...${NC}"
tar zxvf vsts-agent-linux-x64-$LATEST_VERSION.tar.gz
echo -e "${GREEN}Agent extracted.${NC}"

# Set permissions
if [[ $CREATE_USER == "y" ]]; then
    chown -R $AGENT_USER:$AGENT_USER $AGENT_DIR
fi

# Configure the agent
echo -e "${GREEN}=== Configuring Agent ===${NC}"
if [[ $CREATE_USER == "y" ]]; then
    # Run as the agent user
    su - $AGENT_USER -c "cd $AGENT_DIR && ./config.sh --unattended --url \"$ORG_URL\" --auth pat --token \"$PAT\" --pool \"$POOL_NAME\" --agent \"$AGENT_NAME\" --acceptTeeEula"
else
    # Run as current user
    cd $AGENT_DIR && ./config.sh --unattended --url "$ORG_URL" --auth pat --token "$PAT" --pool "$POOL_NAME" --agent "$AGENT_NAME" --acceptTeeEula
fi
echo -e "${GREEN}Agent configured.${NC}"

# Install and start the agent service
echo -e "${GREEN}=== Installing and Starting Agent Service ===${NC}"
cd $AGENT_DIR
./svc.sh install
./svc.sh start
echo -e "${GREEN}Agent service installed and started.${NC}"

# Verify the agent is running
echo -e "${GREEN}=== Verifying Agent Status ===${NC}"
./svc.sh status
echo -e "${GREEN}Agent setup complete!${NC}"

# Setup firewall
echo -e "${YELLOW}Do you want to configure the firewall? (y/n, default: y): ${NC}"
read SETUP_FIREWALL
SETUP_FIREWALL=${SETUP_FIREWALL:-y}
if [[ $SETUP_FIREWALL == "y" ]]; then
    echo -e "${GREEN}=== Configuring Firewall ===${NC}"
    apt install -y ufw
    ufw allow ssh
    ufw allow http
    ufw allow https
    ufw --force enable
    echo -e "${GREEN}Firewall configured.${NC}"
fi

echo -e "${GREEN}=== Azure DevOps Agent Setup Complete ===${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Verify the agent is online in Azure DevOps"
echo "2. Create and run your pipeline"
echo "3. Configure environment approvals if needed"
echo ""
echo -e "${GREEN}For more information, refer to the CONTABO_AGENT_SETUP.md guide.${NC}"

exit 0