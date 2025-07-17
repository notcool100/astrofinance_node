# AstroFinance Pipeline Templates

This directory contains reusable templates for Azure DevOps pipelines.

## Available Templates

### 1. Build Template (`build-template.yml`)

This template contains common build steps for Node.js applications.

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| projectPath | string | '' | Path to the project directory (e.g., 'fe' or 'be') |
| projectType | string | 'frontend' | Type of project ('frontend' or 'backend') |
| nodeVersion | string | '16.x' | Node.js version to use |
| artifactName | string | 'app' | Name of the build artifact |

#### Steps

1. Install Node.js
2. Install dependencies (`npm ci`)
3. Run linting (`npm run lint`)
4. Run TypeScript check (`npm run type-check`) - frontend only
5. Generate Prisma client (`npm run prisma:generate`) - backend only
6. Run tests (`npm run test`)
7. Build application (`npm run build`)
8. Archive files
9. Publish build artifacts

### 2. Deploy Template (`deploy-template.yml`)

This template contains common deployment steps for Azure Web Apps.

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| environment | string | 'development' | Deployment environment |
| artifactName | string | 'app' | Name of the build artifact |
| appType | string | 'webApp' | Type of Azure Web App ('webApp' or 'webAppLinux') |
| appName | string | '' | Name of the Azure Web App |
| startUpCommand | string | '' | Startup command (for Linux Web Apps) |

#### Steps

1. Download build artifacts
2. Deploy to Azure Web App

## Usage

To use these templates in your pipeline, include them with the `template` keyword:

```yaml
steps:
- template: ../templates/build-template.yml
  parameters:
    projectPath: 'fe'
    projectType: 'frontend'
    nodeVersion: '16.x'
    artifactName: 'frontend'
```

## Best Practices

1. Keep templates focused on a single responsibility
2. Use parameters to make templates flexible
3. Provide default values for parameters when possible
4. Document parameters and their usage
5. Use conditional steps for different project types