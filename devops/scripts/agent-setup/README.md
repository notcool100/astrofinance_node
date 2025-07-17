# Azure DevOps Agent Setup for Contabo Ubuntu Server

This directory contains scripts to help you set up an Azure DevOps self-hosted agent on a Contabo Ubuntu server.

## Available Scripts

### 1. Setup Agent (`setup-agent.sh`)

This script automates the installation and configuration of an Azure DevOps agent on your Contabo Ubuntu server.

**Features:**
- Updates the system
- Installs required dependencies (Node.js, Git, Docker, Azure CLI)
- Creates a dedicated user for the agent
- Downloads and configures the latest Azure DevOps agent
- Sets up the agent as a service
- Configures basic firewall rules

**Usage:**
```bash
# Copy the script to your Contabo server
scp setup-agent.sh username@your-contabo-server-ip:~/

# SSH into your server
ssh username@your-contabo-server-ip

# Make the script executable
chmod +x setup-agent.sh

# Run the script as root or with sudo
sudo ./setup-agent.sh
```

**Required Information:**
- Azure DevOps Organization URL (e.g., https://dev.azure.com/your-organization)
- Personal Access Token (PAT)
- Agent Pool Name (default: ContaboAgentPool)
- Agent Name (default: ContaboAgent)

## Manual Setup

If you prefer to set up the agent manually, follow these steps:

1. **Update the system**:
   ```bash
   sudo apt update
   sudo apt upgrade -y
   ```

2. **Install required dependencies**:
   ```bash
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt install -y nodejs

   # Install Git
   sudo apt install -y git

   # Install Docker (optional)
   sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
   sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
   sudo apt update
   sudo apt install -y docker-ce
   sudo usermod -aG docker $USER

   # Install Azure CLI
   curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
   ```

3. **Create a dedicated user for the agent**:
   ```bash
   sudo adduser azagent
   sudo usermod -aG docker azagent  # If you installed Docker
   ```

4. **Create a directory for the agent**:
   ```bash
   sudo mkdir -p /opt/azure-pipelines-agent
   sudo chown azagent:azagent /opt/azure-pipelines-agent
   ```

5. **Download and configure the agent**:
   ```bash
   sudo su - azagent
   cd /opt/azure-pipelines-agent
   curl -O https://vstsagentpackage.azureedge.net/agent/2.214.1/vsts-agent-linux-x64-2.214.1.tar.gz
   tar zxvf vsts-agent-linux-x64-2.214.1.tar.gz
   ./config.sh
   ```

6. **Install and start the agent service**:
   ```bash
   sudo ./svc.sh install
   sudo ./svc.sh start
   ```

For more detailed instructions, refer to the [CONTABO_AGENT_SETUP.md](../../CONTABO_AGENT_SETUP.md) guide.