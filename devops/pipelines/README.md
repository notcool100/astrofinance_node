# AstroFinance CI/CD Pipelines

This directory contains Azure DevOps pipeline definitions for building and deploying the AstroFinance application.

## Available Pipelines

### 1. Combined Pipeline (`azure-pipelines.yml`)

This pipeline builds and deploys both frontend and backend components in a single workflow.

- **Trigger**: Changes to `fe/*` or `be/*` directories on `main` or `develop` branches
- **Stages**:
  - Build Frontend
  - Build Backend
  - Deploy to Development (when triggered from `develop` branch)
  - Deploy to Production (when triggered from `main` branch)

### 2. Frontend Pipeline (`frontend-pipeline.yml`)

This pipeline builds and deploys only the frontend component.

- **Trigger**: Changes to `fe/*` directory on `main` or `develop` branches
- **Stages**:
  - Build
  - Deploy to Development (when triggered from `develop` branch)
  - Deploy to Production (when triggered from `main` branch)

### 3. Backend Pipeline (`backend-pipeline.yml`)

This pipeline builds and deploys only the backend component.

- **Trigger**: Changes to `be/*` directory on `main` or `develop` branches
- **Stages**:
  - Build
  - Deploy to Development (when triggered from `develop` branch)
  - Deploy to Production (when triggered from `main` branch)

## Pipeline Templates

The pipelines use reusable templates from the `../templates/` directory:

- **build-template.yml**: Common build steps for Node.js applications
- **deploy-template.yml**: Common deployment steps for Azure Web Apps

## Environment Configuration

The pipelines are configured to deploy to the following environments:

- **Development**: For ongoing development work (deployed from `develop` branch)
- **Production**: For live environment (deployed from `main` branch)

## Setting Up the Pipelines

1. In Azure DevOps, go to Pipelines > New Pipeline
2. Select Azure Repos Git as the source
3. Select your repository
4. Select "Existing Azure Pipelines YAML file"
5. Select the desired pipeline file (e.g., `/devops/pipelines/azure-pipelines.yml`)
6. Review and create the pipeline

## Required Service Connections

Before running these pipelines, you need to set up the following service connections in Azure DevOps:

1. **Azure Resource Manager**: Named "Azure Subscription" for deploying to Azure Web Apps

## Required Variables

The following variables should be defined in Azure DevOps variable groups:

- **Common Variables**:
  - `nodeVersion`: The Node.js version to use (default: 16.x)

- **Environment-specific Variables**:
  - Development environment variables
  - Production environment variables

## Security Considerations

- All secrets should be stored in Azure Key Vault and accessed via variable groups
- No secrets should be hardcoded in pipeline definitions
- Approval checks should be configured for production deployments