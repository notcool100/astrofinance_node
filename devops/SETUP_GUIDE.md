# AstroFinance Azure DevOps Setup Guide

This guide provides instructions for setting up the Azure DevOps CI/CD pipeline for the AstroFinance application.

## Overview

The AstroFinance project uses Azure DevOps for continuous integration and continuous deployment. The pipeline builds and deploys both the frontend (Next.js) and backend (Node.js) components to Azure Web Apps.

## Prerequisites

- Azure DevOps account
- Azure subscription
- Git
- Node.js and npm
- Azure CLI (for setup script)

## Pipeline Files

The following pipeline files are available:

1. **Combined Pipeline** (`azure-pipelines.yml`)
   - Builds and deploys both frontend and backend components
   - Use this for comprehensive CI/CD

2. **Frontend Pipeline** (`frontend-pipeline.yml`)
   - Builds and deploys only the frontend component
   - Use this for frontend-specific changes

3. **Backend Pipeline** (`backend-pipeline.yml`)
   - Builds and deploys only the backend component
   - Use this for backend-specific changes

## Setup Options

### Option 1: Automated Setup

Use the provided setup script to automate the creation of Azure DevOps pipelines and Azure resources:

```bash
cd /home/notcool/Desktop/astrofinanceNew/devops/scripts/deploy
./setup-azure-devops.sh
```

The script will:
- Create Azure DevOps project
- Set up service connections
- Create environments
- Provision Azure resources
- Create Azure Pipelines

### Option 2: Manual Setup

If you prefer to set up the pipeline manually:

1. **Create Azure Resources**
   - Create resource group
   - Create App Service Plans
   - Create Web Apps for frontend and backend
   - Create Application Insights
   - Create Key Vault

2. **Set Up Azure DevOps**
   - Create a new project
   - Create service connection to Azure
   - Create environments (development, production)
   - Create variable groups

3. **Create Pipelines**
   - Create a new pipeline
   - Select Azure Repos Git as the source
   - Select your repository
   - Select "Existing Azure Pipelines YAML file"
   - Select the desired pipeline file (e.g., `/devops/pipelines/azure-pipelines.yml`)
   - Review and create the pipeline

## Pipeline Configuration

### Variable Groups

Create the following variable groups:

1. **fms-common-variables**
   - `NODE_VERSION`: `16.x`
   - `PROJECT_NAME`: `AstroFinance`

2. **fms-dev-variables**
   - `ENVIRONMENT`: `development`
   - `API_URL`: URL of the development backend API

3. **fms-prod-variables**
   - `ENVIRONMENT`: `production`
   - `API_URL`: URL of the production backend API

### Environment Configuration

Configure the following environments:

1. **Development**
   - No approval checks
   - Automatic deployments from develop branch

2. **Production**
   - Add approval checks
   - Add required reviewers
   - Deploy only from main branch

## Infrastructure as Code

The project includes Infrastructure as Code (IaC) definitions:

1. **ARM Templates** (`/devops/infrastructure/arm-templates/`)
   - `webapp.json`: Defines Web Apps and App Service Plan

2. **Terraform** (`/devops/infrastructure/terraform/`)
   - `main.tf`: Defines all required Azure resources

To deploy using ARM templates:

```bash
az deployment group create \
  --resource-group AstroFinance-RG \
  --template-file webapp.json \
  --parameters environment=dev
```

To deploy using Terraform:

```bash
cd /devops/infrastructure/terraform
terraform init
terraform plan -var="environment=dev" -out=tfplan
terraform apply tfplan
```

## Monitoring and Logging

The pipeline integrates with Application Insights for monitoring and logging:

1. **Frontend Integration**
   - Instrumentation key is passed as an environment variable

2. **Backend Integration**
   - Instrumentation key is passed as an environment variable

## Security Considerations

1. **Secret Management**
   - Store all secrets in Azure Key Vault
   - Access secrets using variable groups linked to Key Vault

2. **Access Control**
   - Use role-based access control
   - Limit access to production environment

## Troubleshooting

If you encounter issues with the pipeline:

1. Check the build logs for errors
2. Verify service connection is working
3. Ensure variable groups are correctly configured
4. Check that Azure resources are properly provisioned

## Additional Resources

- [Azure DevOps Documentation](https://docs.microsoft.com/en-us/azure/devops/)
- [Azure Web Apps Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Node.js Deployment Best Practices](https://docs.microsoft.com/en-us/azure/app-service/configure-language-nodejs)