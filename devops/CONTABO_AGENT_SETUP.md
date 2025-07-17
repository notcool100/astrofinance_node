# Setting Up Azure DevOps Pipeline with Self-Hosted Agent on Contabo Ubuntu Server

This guide provides step-by-step instructions for setting up an Azure DevOps pipeline with a self-hosted agent on a Contabo Ubuntu server for the AstroFinance application.

## Prerequisites

- A Contabo VPS with Ubuntu installed
- SSH access to your Contabo server
- An Azure DevOps organization and project
- Administrator permissions in Azure DevOps
- A GitHub or Azure Repos repository with your AstroFinance code

## Step 1: Prepare Your Contabo Ubuntu Server

1. **Connect to your Contabo server via SSH**:
   ```bash
   ssh username@your-contabo-server-ip
   ```

2. **Update the system**:
   ```bash
   sudo apt update
   sudo apt upgrade -y
   ```

3. **Install required dependencies**:
   ```bash
   # Install Node.js and npm
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt install -y nodejs

   # Install Git
   sudo apt install -y git

   # Install Docker (optional, if you need containerization)
   sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
   sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
   sudo apt update
   sudo apt install -y docker-ce
   sudo usermod -aG docker $USER

   # Install Azure CLI
   curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
   ```

4. **Create a dedicated user for the Azure DevOps agent**:
   ```bash
   sudo adduser azagent
   sudo usermod -aG docker azagent  # If you installed Docker
   ```

5. **Create a directory for the agent**:
   ```bash
   sudo mkdir -p /opt/azure-pipelines-agent
   sudo chown azagent:azagent /opt/azure-pipelines-agent
   ```

## Step 2: Create a Personal Access Token (PAT) in Azure DevOps

1. **Sign in to your Azure DevOps organization** (https://dev.azure.com/your-organization)

2. **Create a Personal Access Token**:
   - Click on your profile icon in the top right corner
   - Select "Personal access tokens"
   - Click "New Token"
   - Name: "Contabo Agent Setup"
   - Organization: Select your organization
   - Expiration: Set an appropriate expiration date (e.g., 1 year)
   - Scopes: Select "Full access" or customize with at least:
     - Agent Pools: Read & manage
     - Deployment Groups: Read & manage
   - Click "Create"
   - **IMPORTANT**: Copy the generated token and save it securely. You won't be able to see it again.

## Step 3: Create an Agent Pool in Azure DevOps

1. **Navigate to Project Settings**:
   - Go to your Azure DevOps project
   - Click on "Project settings" at the bottom left

2. **Create a new Agent Pool**:
   - Select "Agent pools" under Pipelines
   - Click "Add pool"
   - Pool type: "Self-hosted"
   - Name: "ContaboAgentPool"
   - Click "Create"

## Step 4: Download and Configure the Azure Pipelines Agent

1. **Switch to the azagent user on your Contabo server**:
   ```bash
   sudo su - azagent
   ```

2. **Navigate to the agent directory**:
   ```bash
   cd /opt/azure-pipelines-agent
   ```

3. **Download the agent**:
   ```bash
   curl -O https://vstsagentpackage.azureedge.net/agent/2.214.1/vsts-agent-linux-x64-2.214.1.tar.gz
   ```
   Note: Check for the latest version at https://github.com/microsoft/azure-pipelines-agent/releases

4. **Extract the agent**:
   ```bash
   tar zxvf vsts-agent-linux-x64-2.214.1.tar.gz
   ```

5. **Configure the agent**:
   ```bash
   ./config.sh
   ```
   
   You'll be prompted for the following information:
   - Server URL: `https://dev.azure.com/your-organization`
   - Authentication type: `PAT`
   - Personal access token: Enter the PAT you created earlier
   - Agent pool: `ContaboAgentPool`
   - Agent name: `ContaboAgent` (or any name you prefer)
   - Work folder: Press Enter to accept the default
   - Run agent as service: `Y`

6. **Install and start the agent service**:
   ```bash
   sudo ./svc.sh install
   sudo ./svc.sh start
   ```

7. **Verify the agent is running**:
   ```bash
   sudo ./svc.sh status
   ```

## Step 5: Verify Agent Connection in Azure DevOps

1. **Go to your Agent Pool in Azure DevOps**:
   - Navigate to Project Settings > Agent pools > ContaboAgentPool
   - You should see your agent listed with "Online" status

## Step 6: Create Azure DevOps Pipeline

1. **Navigate to Pipelines in your Azure DevOps project**:
   - Click on "Pipelines" in the left sidebar
   - Click "New pipeline"

2. **Select your repository**:
   - Choose where your code is stored (GitHub, Azure Repos, etc.)
   - Select your repository

3. **Configure your pipeline**:
   - Select "Existing Azure Pipelines YAML file"
   - Path: `/devops/pipelines/azure-pipelines.yml`
   - Click "Continue"

4. **Modify the pipeline to use your self-hosted agent**:
   - In the pipeline YAML, replace the `pool` section:
   
   ```yaml
   pool:
     name: ContaboAgentPool
   ```

5. **Save and run the pipeline**:
   - Click "Save and run"
   - Commit the changes to your repository

## Step 7: Configure Environment Variables

1. **Create Variable Groups in Azure DevOps**:
   - Go to Pipelines > Library
   - Click "+ Variable group"
   - Name: "fms-common-variables"
   - Add variables:
     - `NODE_VERSION`: `16.x`
     - `PROJECT_NAME`: `AstroFinance`
   - Click "Save"

2. **Create environment-specific variable groups**:
   - Create another variable group named "fms-dev-variables"
   - Add variables:
     - `ENVIRONMENT`: `development`
     - `API_URL`: Your backend API URL
   - Click "Save"

## Step 8: Set Up Azure Resources

1. **Install Azure CLI on your local machine** (if not already installed):
   - Follow instructions at https://docs.microsoft.com/en-us/cli/azure/install-azure-cli

2. **Log in to Azure**:
   ```bash
   az login
   ```

3. **Create Resource Group**:
   ```bash
   az group create --name AstroFinance-RG --location eastus
   ```

4. **Deploy Azure Resources using ARM template**:
   ```bash
   az deployment group create \
     --resource-group AstroFinance-RG \
     --template-file /home/notcool/Desktop/astrofinanceNew/devops/infrastructure/arm-templates/webapp.json \
     --parameters environment=dev
   ```

## Step 9: Configure Pipeline for Deployment

1. **Create a Service Connection to Azure**:
   - Go to Project Settings > Service connections
   - Click "New service connection"
   - Select "Azure Resource Manager"
   - Authentication method: "Service principal (automatic)"
   - Scope level: "Subscription"
   - Subscription: Select your Azure subscription
   - Resource Group: "AstroFinance-RG"
   - Service connection name: "Azure Subscription"
   - Click "Save"

2. **Update the pipeline YAML files**:
   - Make sure the service connection name matches in your pipeline files:
   
   ```yaml
   azureSubscription: 'Azure Subscription'
   ```

## Step 10: Run the Pipeline

1. **Trigger the pipeline**:
   - Make a change to your repository and push it
   - The pipeline should automatically trigger
   - Alternatively, you can manually run the pipeline

2. **Monitor the pipeline execution**:
   - Go to Pipelines > Pipelines
   - Click on your running pipeline to see the progress
   - Check the logs for any errors

## Step 11: Set Up Continuous Deployment

1. **Configure branch policies**:
   - Go to Repos > Branches
   - Select your main branch
   - Click on the three dots (...) and select "Branch policies"
   - Enable "Require a minimum number of reviewers"
   - Set minimum number of reviewers to 1 or more
   - Click "Save"

2. **Configure environment approvals for production**:
   - Go to Pipelines > Environments
   - Select "production" environment
   - Click on the three dots (...) and select "Approvals and checks"
   - Click "+ Add check"
   - Select "Approvals"
   - Add approvers (users who can approve deployments)
   - Click "Create"

## Troubleshooting

### Agent Connection Issues

If the agent cannot connect to Azure DevOps:

1. **Check network connectivity**:
   ```bash
   curl -I https://dev.azure.com
   ```

2. **Check agent service status**:
   ```bash
   sudo ./svc.sh status
   ```

3. **Restart the agent service**:
   ```bash
   sudo ./svc.sh stop
   sudo ./svc.sh start
   ```

4. **Check agent logs**:
   ```bash
   cat _diag/Agent_*.log
   ```

### Pipeline Execution Issues

If the pipeline fails to execute:

1. **Check agent capabilities**:
   - Make sure the agent has all required software installed
   - You can add capabilities in Azure DevOps under Agent Pool > Agents > [Your Agent] > Capabilities

2. **Check pipeline logs**:
   - Review the detailed logs in Azure DevOps
   - Look for specific error messages

3. **Update agent software**:
   ```bash
   cd /opt/azure-pipelines-agent
   sudo ./svc.sh stop
   ./config.sh remove --auth pat --token <your-pat>
   # Download and configure the latest agent version
   ```

## Maintenance

### Updating the Agent

To update the agent to a newer version:

1. **Stop the agent service**:
   ```bash
   cd /opt/azure-pipelines-agent
   sudo ./svc.sh stop
   ```

2. **Remove the agent configuration**:
   ```bash
   ./config.sh remove --auth pat --token <your-pat>
   ```

3. **Download and install the new version**:
   ```bash
   curl -O https://vstsagentpackage.azureedge.net/agent/[new-version]/vsts-agent-linux-x64-[new-version].tar.gz
   tar zxvf vsts-agent-linux-x64-[new-version].tar.gz
   ```

4. **Reconfigure the agent**:
   ```bash
   ./config.sh
   sudo ./svc.sh install
   sudo ./svc.sh start
   ```

### Server Maintenance

1. **Regular updates**:
   ```bash
   sudo apt update
   sudo apt upgrade -y
   ```

2. **Monitor disk space**:
   ```bash
   df -h
   ```

3. **Clean up build artifacts**:
   ```bash
   cd /opt/azure-pipelines-agent/_work
   rm -rf */*/a
   ```

## Security Considerations

1. **Keep the PAT secure**:
   - Don't share the PAT
   - Rotate the PAT periodically

2. **Update the server regularly**:
   - Apply security patches promptly

3. **Use a firewall**:
   ```bash
   sudo apt install -y ufw
   sudo ufw allow ssh
   sudo ufw allow http
   sudo ufw allow https
   sudo ufw enable
   ```

4. **Secure SSH access**:
   - Use key-based authentication
   - Disable password authentication
   - Consider changing the default SSH port

## Conclusion

You have now set up a self-hosted Azure DevOps agent on your Contabo Ubuntu server and configured it to build and deploy the AstroFinance application. The pipeline will automatically build and create artifacts for both the frontend and backend components.

For more information, refer to the [Azure DevOps documentation](https://docs.microsoft.com/en-us/azure/devops/pipelines/agents/v2-linux?view=azure-devops) and the [Azure Pipelines documentation](https://docs.microsoft.com/en-us/azure/devops/pipelines/?view=azure-devops).