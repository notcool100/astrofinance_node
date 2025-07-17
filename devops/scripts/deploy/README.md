# AstroFinance Deployment Scripts

This directory contains scripts for deploying and setting up the AstroFinance application infrastructure.

## Available Scripts

### 1. Setup Azure DevOps (`setup-azure-devops.sh`)

This script automates the setup of Azure DevOps pipelines and required Azure resources for the AstroFinance project.

**Features:**
- Creates Azure DevOps project if it doesn't exist
- Sets up service connections for Azure
- Creates environments (development, production)
- Creates variable groups for pipeline configuration
- Provisions Azure resources:
  - App Service Plans
  - Web Apps for frontend and backend
  - Application Insights
  - Key Vault for secrets

**Usage:**
```bash
./setup-azure-devops.sh
```

**Prerequisites:**
- Azure CLI installed
- Azure subscription
- Azure DevOps organization
- jq installed (for JSON parsing)

**Execution Flow:**
1. Checks for prerequisites
2. Logs in to Azure
3. Collects required information
4. Creates/configures Azure DevOps project
5. Creates Azure resources
6. Sets up Azure Pipelines
7. Stores secrets in Key Vault

**Post-Setup Tasks:**
After running the script, you should:
1. Configure approval checks for production environment
2. Set up branch policies for main branch
3. Configure variable groups with environment-specific variables
4. Set up monitoring and alerts

## Planned Scripts

The following scripts are planned for future implementation:

### 1. Infrastructure Deployment (`deploy-infrastructure.sh`)
- Deploy ARM templates or Terraform configurations
- Set up networking components
- Configure database resources

### 2. Blue-Green Deployment (`blue-green-deploy.sh`)
- Implement blue-green deployment for production
- Handle traffic switching
- Manage deployment slots