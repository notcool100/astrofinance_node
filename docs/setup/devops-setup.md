# DevOps Setup Guide

## Overview
This guide provides instructions for setting up the DevOps infrastructure for the Financial Management System using Azure DevOps. It covers CI/CD pipelines, environment configuration, monitoring, and deployment strategies.

## Prerequisites
- Azure DevOps account
- Azure subscription
- Git
- Node.js and npm
- Docker (optional)
- Azure CLI

## Azure DevOps Project Setup

### Creating a New Project

1. Log in to Azure DevOps: https://dev.azure.com/
2. Create a new project:
   - Name: `FinancialManagementSystem`
   - Description: `Microfinance management system for Nepal`
   - Visibility: `Private`
   - Version control: `Git`
   - Work item process: `Agile`

3. Initialize the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://dev.azure.com/your-organization/FinancialManagementSystem/_git/FinancialManagementSystem
   git push -u origin main
   ```

### Repository Structure
Organize the repository with the following structure:
```
/
├── fe/                  # Frontend (Next.js + TypeScript)
├── be/                  # Backend (Node.js)
├── db/                  # Database scripts and migrations
├── devops/              # DevOps configuration
│   ├── pipelines/       # Azure Pipeline definitions
│   ├── templates/       # Reusable pipeline templates
│   ├── scripts/         # Deployment and utility scripts
│   └── infrastructure/  # Infrastructure as Code (IaC)
└── docs/                # Project documentation
```

## CI/CD Pipeline Setup

### Frontend Pipeline

1. Create a new pipeline file at `/devops/pipelines/frontend-pipeline.yml`:

```yaml
trigger:
  branches:
    include:
      - main
      - develop
  paths:
    include:
      - fe/*

pool:
  vmImage: 'ubuntu-latest'

variables:
  nodeVersion: '16.x'

stages:
- stage: Build
  displayName: 'Build Stage'
  jobs:
  - job: BuildJob
    displayName: 'Build Next.js App'
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: '$(nodeVersion)'
      displayName: 'Install Node.js'
    
    - script: |
        cd fe
        npm ci
      displayName: 'Install Dependencies'
    
    - script: |
        cd fe
        npm run lint
      displayName: 'Run Linting'
    
    - script: |
        cd fe
        npm run test
      displayName: 'Run Tests'
    
    - script: |
        cd fe
        npm run build
      displayName: 'Build Application'
    
    - task: ArchiveFiles@2
      inputs:
        rootFolderOrFile: 'fe'
        includeRootFolder: false
        archiveType: 'zip'
        archiveFile: '$(Build.ArtifactStagingDirectory)/frontend.zip'
        replaceExistingArchive: true
    
    - task: PublishBuildArtifacts@1
      inputs:
        PathtoPublish: '$(Build.ArtifactStagingDirectory)'
        ArtifactName: 'frontend'
        publishLocation: 'Container'

- stage: Deploy
  displayName: 'Deploy Stage'
  dependsOn: Build
  condition: succeeded()
  jobs:
  - deployment: DeployJob
    displayName: 'Deploy to Azure Web App'
    environment: 'development'
    strategy:
      runOnce:
        deploy:
          steps:
          - task: AzureWebApp@1
            inputs:
              azureSubscription: 'Azure Subscription'
              appType: 'webApp'
              appName: 'fms-frontend-dev'
              package: '$(Pipeline.Workspace)/frontend/frontend.zip'
              deploymentMethod: 'auto'
```

### Backend Pipeline

1. Create a new pipeline file at `/devops/pipelines/backend-pipeline.yml`:

```yaml
trigger:
  branches:
    include:
      - main
      - develop
  paths:
    include:
      - be/*

pool:
  vmImage: 'ubuntu-latest'

variables:
  nodeVersion: '16.x'

stages:
- stage: Build
  displayName: 'Build Stage'
  jobs:
  - job: BuildJob
    displayName: 'Build Node.js API'
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: '$(nodeVersion)'
      displayName: 'Install Node.js'
    
    - script: |
        cd be
        npm ci
      displayName: 'Install Dependencies'
    
    - script: |
        cd be
        npm run lint
      displayName: 'Run Linting'
    
    - script: |
        cd be
        npm run test
      displayName: 'Run Tests'
    
    - script: |
        cd be
        npm run build
      displayName: 'Build Application'
    
    - task: ArchiveFiles@2
      inputs:
        rootFolderOrFile: 'be'
        includeRootFolder: false
        archiveType: 'zip'
        archiveFile: '$(Build.ArtifactStagingDirectory)/backend.zip'
        replaceExistingArchive: true
    
    - task: PublishBuildArtifacts@1
      inputs:
        PathtoPublish: '$(Build.ArtifactStagingDirectory)'
        ArtifactName: 'backend'
        publishLocation: 'Container'

- stage: Deploy
  displayName: 'Deploy Stage'
  dependsOn: Build
  condition: succeeded()
  jobs:
  - deployment: DeployJob
    displayName: 'Deploy to Azure Web App'
    environment: 'development'
    strategy:
      runOnce:
        deploy:
          steps:
          - task: AzureWebApp@1
            inputs:
              azureSubscription: 'Azure Subscription'
              appType: 'webAppLinux'
              appName: 'fms-backend-dev'
              package: '$(Pipeline.Workspace)/backend/backend.zip'
              startUpCommand: 'npm run start'
```

### Database Migration Pipeline

1. Create a new pipeline file at `/devops/pipelines/database-pipeline.yml`:

```yaml
trigger:
  branches:
    include:
      - main
      - develop
  paths:
    include:
      - db/*

pool:
  vmImage: 'ubuntu-latest'

variables:
  nodeVersion: '16.x'

stages:
- stage: Validate
  displayName: 'Validate Migrations'
  jobs:
  - job: ValidateJob
    displayName: 'Validate Database Scripts'
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: '$(nodeVersion)'
      displayName: 'Install Node.js'
    
    - script: |
        cd be
        npm ci
      displayName: 'Install Dependencies'
    
    - script: |
        cd be
        npm run migrate:validate
      displayName: 'Validate Migrations'
    
    - task: PublishBuildArtifacts@1
      inputs:
        PathtoPublish: 'db/scripts'
        ArtifactName: 'database-scripts'
        publishLocation: 'Container'

- stage: Deploy
  displayName: 'Deploy Migrations'
  dependsOn: Validate
  condition: succeeded()
  jobs:
  - deployment: DeployJob
    displayName: 'Run Database Migrations'
    environment: 'development'
    strategy:
      runOnce:
        deploy:
          steps:
          - task: AzureCLI@2
            inputs:
              azureSubscription: 'Azure Subscription'
              scriptType: 'bash'
              scriptLocation: 'inlineScript'
              inlineScript: |
                cd $(Pipeline.Workspace)/database-scripts
                # Run migration scripts using Azure CLI
                # This is a placeholder - actual implementation will depend on your database setup
                echo "Running database migrations..."
```

## Environment Configuration

### Setting Up Environments

1. In Azure DevOps, go to Pipelines > Environments
2. Create the following environments:
   - Development
   - Testing
   - Staging
   - Production

3. Configure approval checks for sensitive environments:
   - For Staging and Production, add approval checks
   - Add required reviewers from the project team

### Variable Groups

1. In Azure DevOps, go to Pipelines > Library
2. Create variable groups for different environments:

#### Common Variables
- Create a variable group named `fms-common-variables`:
  - `NODE_VERSION`: `16.x`
  - `PROJECT_NAME`: `FinancialManagementSystem`

#### Development Variables
- Create a variable group named `fms-dev-variables`:
  - `ENVIRONMENT`: `development`
  - `API_URL`: `https://fms-backend-dev.azurewebsites.net/api`
  - `DB_HOST`: `fms-db-dev.postgres.database.azure.com`
  - (Add other environment-specific variables)

#### Testing Variables
- Create a variable group named `fms-test-variables`:
  - `ENVIRONMENT`: `testing`
  - `API_URL`: `https://fms-backend-test.azurewebsites.net/api`
  - `DB_HOST`: `fms-db-test.postgres.database.azure.com`
  - (Add other environment-specific variables)

#### Production Variables
- Create a variable group named `fms-prod-variables`:
  - `ENVIRONMENT`: `production`
  - `API_URL`: `https://fms-backend.azurewebsites.net/api`
  - `DB_HOST`: `fms-db.postgres.database.azure.com`
  - (Add other environment-specific variables)

## Infrastructure as Code (IaC)

### Azure Resources

Create ARM templates or Terraform configurations for the following resources:

1. App Service Plans
2. Web Apps (Frontend and Backend)
3. PostgreSQL Database
4. Storage Accounts
5. Application Insights
6. Key Vault for secrets

Example ARM template for Web App (`/devops/infrastructure/webapp.json`):

```json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "webAppName": {
      "type": "string",
      "metadata": {
        "description": "Name of the Web App"
      }
    },
    "location": {
      "type": "string",
      "defaultValue": "[resourceGroup().location]",
      "metadata": {
        "description": "Location for all resources"
      }
    },
    "sku": {
      "type": "string",
      "defaultValue": "F1",
      "metadata": {
        "description": "The SKU of App Service Plan"
      }
    },
    "linuxFxVersion": {
      "type": "string",
      "defaultValue": "NODE|16-lts",
      "metadata": {
        "description": "The Runtime stack of current web app"
      }
    }
  },
  "resources": [
    {
      "type": "Microsoft.Web/serverfarms",
      "apiVersion": "2021-02-01",
      "name": "[concat(parameters('webAppName'), '-plan')]",
      "location": "[parameters('location')]",
      "sku": {
        "name": "[parameters('sku')]"
      },
      "kind": "linux",
      "properties": {
        "reserved": true
      }
    },
    {
      "type": "Microsoft.Web/sites",
      "apiVersion": "2021-02-01",
      "name": "[parameters('webAppName')]",
      "location": "[parameters('location')]",
      "dependsOn": [
        "[resourceId('Microsoft.Web/serverfarms', concat(parameters('webAppName'), '-plan'))]"
      ],
      "properties": {
        "serverFarmId": "[resourceId('Microsoft.Web/serverfarms', concat(parameters('webAppName'), '-plan'))]",
        "siteConfig": {
          "linuxFxVersion": "[parameters('linuxFxVersion')]",
          "appSettings": [
            {
              "name": "WEBSITE_NODE_DEFAULT_VERSION",
              "value": "~16"
            }
          ]
        }
      }
    }
  ],
  "outputs": {
    "webAppUrl": {
      "type": "string",
      "value": "[concat('https://', reference(parameters('webAppName')).defaultHostName)]"
    }
  }
}
```

## Monitoring and Logging

### Application Insights Setup

1. Create Application Insights resources for each environment
2. Integrate with frontend and backend applications:

#### Frontend Integration
Add the following to `/fe/next.config.js`:
```javascript
const { withApplicationInsights } = require('next-applicationinsights');

module.exports = withApplicationInsights({
  applicationInsights: {
    instrumentationKey: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
    disableClientSideTracking: process.env.NODE_ENV !== 'production',
  },
  // other Next.js config
});
```

#### Backend Integration
Add the following to `/be/src/config/monitoring.js`:
```javascript
const appInsights = require('applicationinsights');

const setupMonitoring = () => {
  if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
    appInsights.setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY)
      .setAutoDependencyCorrelation(true)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(true)
      .setUseDiskRetryCaching(true)
      .start();
    
    console.log('Application Insights initialized');
  } else {
    console.log('Application Insights not configured');
  }
};

module.exports = { setupMonitoring };
```

### Log Analytics

1. Create a Log Analytics workspace
2. Configure diagnostic settings for all Azure resources
3. Set up alerts for critical conditions:
   - High error rates
   - Performance degradation
   - Database connection issues
   - Memory/CPU usage thresholds

## Deployment Strategies

### Blue-Green Deployment

For production deployments, implement a blue-green deployment strategy:

1. Create a deployment slot for the web app
2. Deploy to the staging slot
3. Run smoke tests
4. Swap slots if tests pass

Example script (`/devops/scripts/blue-green-deploy.sh`):
```bash
#!/bin/bash

# Variables
RESOURCE_GROUP="fms-production-rg"
WEBAPP_NAME="fms-backend"
SLOT_NAME="staging"

# Deploy to staging slot
echo "Deploying to staging slot..."
az webapp deployment source config-zip --resource-group $RESOURCE_GROUP --name $WEBAPP_NAME --slot $SLOT_NAME --src backend.zip

# Run smoke tests
echo "Running smoke tests..."
# Add your smoke test commands here
# Example: curl https://$WEBAPP_NAME-$SLOT_NAME.azurewebsites.net/api/health

# If tests pass, swap slots
if [ $? -eq 0 ]; then
  echo "Smoke tests passed. Swapping slots..."
  az webapp deployment slot swap --resource-group $RESOURCE_GROUP --name $WEBAPP_NAME --slot $SLOT_NAME --target-slot production
  echo "Deployment completed successfully."
else
  echo "Smoke tests failed. Deployment aborted."
  exit 1
fi
```

## Backup and Disaster Recovery

### Database Backups

1. Configure automated backups for PostgreSQL:
   - Enable geo-redundant backups
   - Set appropriate retention period (30 days recommended)
   - Schedule backups during off-peak hours

2. Create a backup verification job:
   - Periodically restore backups to a test environment
   - Verify data integrity
   - Document the process

### Disaster Recovery Plan

1. Document recovery procedures for different scenarios:
   - Database corruption
   - Application failure
   - Infrastructure outage
   - Regional disaster

2. Create recovery scripts and store them in the repository:
   - Database restore scripts
   - Application redeployment scripts
   - Configuration recovery scripts

## Security Considerations

### DevSecOps Practices

1. Implement security scanning in the CI/CD pipeline:
   - Static Application Security Testing (SAST)
   - Dependency vulnerability scanning
   - Container scanning (if using containers)

2. Add security tasks to the pipelines:
```yaml
- task: WhiteSource@21
  inputs:
    cwd: '$(System.DefaultWorkingDirectory)'
    projectName: 'FinancialManagementSystem'

- task: SonarQubePrepare@4
  inputs:
    SonarQube: 'SonarQube'
    scannerMode: 'CLI'
    configMode: 'manual'
    cliProjectKey: 'FinancialManagementSystem'
    cliProjectName: 'FinancialManagementSystem'
```

### Secret Management

1. Use Azure Key Vault for storing secrets:
   - Database credentials
   - API keys
   - Certificates
   - JWT secrets

2. Configure Key Vault integration in the pipelines:
```yaml
- task: AzureKeyVault@1
  inputs:
    azureSubscription: 'Azure Subscription'
    KeyVaultName: 'fms-key-vault'
    SecretsFilter: '*'
    RunAsPreJob: true
```

## Troubleshooting

### Common Issues

1. **Pipeline Failures**:
   - Check build logs for errors
   - Verify that all dependencies are installed
   - Ensure environment variables are correctly set

2. **Deployment Issues**:
   - Check application logs in App Service
   - Verify network connectivity between components
   - Check resource permissions and access policies

3. **Performance Problems**:
   - Review Application Insights telemetry
   - Check database query performance
   - Monitor resource utilization

### Support Procedures

1. Create a support runbook with:
   - Contact information for team members
   - Escalation procedures
   - Common issues and resolutions
   - Access recovery procedures

2. Document the incident response process:
   - Issue identification
   - Triage and prioritization
   - Resolution steps
   - Post-incident review

## Additional Resources

- [Azure DevOps Documentation](https://docs.microsoft.com/en-us/azure/devops/)
- [Azure Web Apps Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Azure PostgreSQL Documentation](https://docs.microsoft.com/en-us/azure/postgresql/)
- [Application Insights Documentation](https://docs.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview)
- [Azure Key Vault Documentation](https://docs.microsoft.com/en-us/azure/key-vault/)