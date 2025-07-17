# AstroFinance Azure DevOps Pipeline Quick Start Guide

This guide provides a quick overview of how to set up and run the Azure DevOps pipeline for the AstroFinance application using a self-hosted agent on a Contabo Ubuntu server.

## Step 1: Set Up Azure DevOps

1. **Create an Azure DevOps Organization** (if you don't have one):
   - Go to https://dev.azure.com/
   - Sign in with your Microsoft account
   - Create a new organization

2. **Create a Project**:
   - Click "New project"
   - Name: "AstroFinance"
   - Visibility: "Private"
   - Click "Create"

3. **Create a Personal Access Token (PAT)**:
   - Click on your profile icon in the top right corner
   - Select "Personal access tokens"
   - Click "New Token"
   - Name: "Contabo Agent Setup"
   - Organization: Select your organization
   - Expiration: Set an appropriate expiration date
   - Scopes: Select "Full access" or customize with at least:
     - Agent Pools: Read & manage
     - Deployment Groups: Read & manage
   - Click "Create"
   - **IMPORTANT**: Copy the generated token and save it securely

4. **Create an Agent Pool**:
   - Go to Project Settings > Agent pools
   - Click "Add pool"
   - Pool type: "Self-hosted"
   - Name: "ContaboAgentPool"
   - Click "Create"

## Step 2: Set Up Self-Hosted Agent on Contabo Server

1. **Copy the Agent Setup Script to Your Server**:
   ```bash
   scp /home/notcool/Desktop/astrofinanceNew/devops/scripts/agent-setup/setup-agent.sh username@your-contabo-server-ip:~/
   ```

2. **SSH into Your Server**:
   ```bash
   ssh username@your-contabo-server-ip
   ```

3. **Run the Agent Setup Script**:
   ```bash
   chmod +x setup-agent.sh
   sudo ./setup-agent.sh
   ```

4. **Provide Required Information**:
   - Azure DevOps Organization URL
   - Personal Access Token (PAT)
   - Agent Pool Name (default: ContaboAgentPool)
   - Agent Name (default: ContaboAgent)

5. **Verify Agent Connection**:
   - Go to Project Settings > Agent pools > ContaboAgentPool
   - You should see your agent listed with "Online" status

## Step 3: Import Repository

1. **Import the AstroFinance Repository**:
   - Go to Repos > Files
   - Click "Import repository"
   - Clone URL: Your repository URL
   - Click "Import"

## Step 4: Create Pipeline

1. **Create a New Pipeline**:
   - Go to Pipelines > Pipelines
   - Click "New pipeline"
   - Select your repository source
   - Select your repository
   - Select "Existing Azure Pipelines YAML file"
   - Path: `/devops/pipelines/azure-pipelines.yml`
   - Click "Continue"

2. **Modify the Pipeline to Use Your Self-Hosted Agent**:
   - Update the `pool` section:
   ```yaml
   pool:
     name: ContaboAgentPool
   ```

3. **Save and Run the Pipeline**:
   - Click "Save and run"
   - Commit the changes to your repository

## Step 5: Set Up Azure Resources

1. **Create Azure Resources**:
   - Use the Azure CLI or Azure Portal to create:
     - Resource Group
     - App Service Plans
     - Web Apps for frontend and backend
     - Application Insights
     - Key Vault

2. **Create a Service Connection**:
   - Go to Project Settings > Service connections
   - Click "New service connection"
   - Select "Azure Resource Manager"
   - Authentication method: "Service principal (automatic)"
   - Scope level: "Subscription"
   - Subscription: Select your Azure subscription
   - Resource Group: "AstroFinance-RG"
   - Service connection name: "Azure Subscription"
   - Click "Save"

## Step 6: Configure Pipeline Variables

1. **Create Variable Groups**:
   - Go to Pipelines > Library
   - Click "+ Variable group"
   - Name: "fms-common-variables"
   - Add variables:
     - `NODE_VERSION`: `16.x`
     - `PROJECT_NAME`: `AstroFinance`
   - Click "Save"

2. **Create Environment-Specific Variable Groups**:
   - Create another variable group named "fms-dev-variables"
   - Add variables:
     - `ENVIRONMENT`: `development`
     - `API_URL`: Your backend API URL
   - Click "Save"

## Step 7: Run the Pipeline

1. **Trigger the Pipeline**:
   - Make a change to your repository and push it
   - The pipeline should automatically trigger
   - Alternatively, you can manually run the pipeline

2. **Monitor the Pipeline Execution**:
   - Go to Pipelines > Pipelines
   - Click on your running pipeline to see the progress
   - Check the logs for any errors

## Troubleshooting

### Agent Connection Issues

If the agent cannot connect to Azure DevOps:

1. **Check agent service status**:
   ```bash
   sudo /opt/azure-pipelines-agent/svc.sh status
   ```

2. **Restart the agent service**:
   ```bash
   sudo /opt/azure-pipelines-agent/svc.sh stop
   sudo /opt/azure-pipelines-agent/svc.sh start
   ```

3. **Check agent logs**:
   ```bash
   cat /opt/azure-pipelines-agent/_diag/Agent_*.log
   ```

### Pipeline Execution Issues

If the pipeline fails to execute:

1. **Check agent capabilities**:
   - Make sure the agent has all required software installed

2. **Check pipeline logs**:
   - Review the detailed logs in Azure DevOps
   - Look for specific error messages

## Next Steps

1. **Configure Branch Policies**:
   - Set up branch protection rules
   - Require pull request reviews

2. **Configure Environment Approvals**:
   - Set up approval checks for production deployments

3. **Set Up Monitoring**:
   - Configure Application Insights
   - Set up alerts

For more detailed instructions, refer to:
- [CONTABO_AGENT_SETUP.md](CONTABO_AGENT_SETUP.md) - Detailed guide for setting up the agent
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Comprehensive guide for setting up the pipeline