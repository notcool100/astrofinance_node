# AstroFinance DevOps Scripts

This directory contains utility scripts for DevOps operations.

## Available Scripts

### Deploy Scripts

Located in the `deploy/` directory:

#### 1. Setup Azure DevOps (`setup-azure-devops.sh`)

This script helps set up the Azure DevOps pipeline for the AstroFinance project.

**Features:**
- Creates Azure DevOps project
- Sets up service connections
- Creates environments (development, production)
- Creates variable groups
- Provisions Azure resources (App Service Plans, Web Apps, Application Insights, Key Vault)
- Creates Azure Pipelines

**Usage:**
```bash
cd /home/notcool/Desktop/astrofinanceNew/devops/scripts/deploy
./setup-azure-devops.sh
```

**Prerequisites:**
- Azure CLI installed
- Azure subscription
- Azure DevOps organization

**Prompts:**
- Azure DevOps organization name
- Azure DevOps project name (default: AstroFinance)
- Azure subscription ID
- Resource group name (default: AstroFinance-RG)
- Location (default: eastus)

## Future Scripts

The following scripts are planned for future implementation:

### Backup Scripts

Located in the `backup/` directory:
- Database backup scripts
- Application backup scripts

### Monitoring Scripts

Located in the `monitoring/` directory:
- Health check scripts
- Alert configuration scripts
- Log analysis scripts