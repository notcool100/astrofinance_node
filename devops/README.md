# AstroFinance - DevOps

This directory contains DevOps configuration files, CI/CD pipelines, and infrastructure as code for the AstroFinance Financial Management System.

## Technology Stack

- Azure DevOps
- Azure Cloud Services
- YAML Pipelines
- ARM Templates / Terraform

## Getting Started

We provide several guides to help you set up and use the DevOps pipeline:

- [Quick Start Guide](QUICKSTART.md) - Get up and running quickly
- [Setup Guide](SETUP_GUIDE.md) - Comprehensive setup instructions
- [Contabo Agent Setup Guide](CONTABO_AGENT_SETUP.md) - Set up a self-hosted agent on Contabo
- [Pipeline Diagram](PIPELINE_DIAGRAM.md) - Visual representation of the pipeline architecture
- [DevOps Setup Guide](../docs/setup/devops-setup.md) - Original setup documentation

## Directory Structure

```
/devops
├── pipelines/           # Azure Pipeline definitions
│   ├── azure-pipelines.yml     # Combined pipeline for frontend and backend
│   ├── frontend-pipeline.yml   # Frontend-specific pipeline
│   ├── backend-pipeline.yml    # Backend-specific pipeline
│   └── README.md               # Pipeline documentation
├── templates/           # Reusable pipeline templates
│   ├── build-template.yml      # Common build steps
│   ├── deploy-template.yml     # Common deployment steps
│   └── README.md               # Template documentation
├── scripts/             # Deployment and utility scripts
│   ├── deploy/          # Deployment scripts
│   │   ├── setup-azure-devops.sh  # Azure DevOps setup script
│   │   └── README.md             # Deployment scripts documentation
│   ├── agent-setup/     # Self-hosted agent setup scripts
│   │   ├── setup-agent.sh        # Agent setup script
│   │   └── README.md             # Agent setup documentation
│   ├── backup/          # Backup scripts (to be implemented)
│   │   └── README.md             # Backup scripts documentation
│   ├── monitoring/      # Monitoring scripts (to be implemented)
│   │   └── README.md             # Monitoring scripts documentation
│   └── README.md        # Scripts documentation
├── infrastructure/      # Infrastructure as Code (IaC)
│   ├── arm-templates/   # Azure Resource Manager templates
│   │   └── webapp.json          # Web App ARM template
│   ├── terraform/       # Terraform configurations
│   │   └── main.tf              # Main Terraform configuration
│   └── README.md        # Infrastructure documentation
├── QUICKSTART.md        # Quick start guide
├── SETUP_GUIDE.md       # Comprehensive setup guide
├── CONTABO_AGENT_SETUP.md # Self-hosted agent setup guide
└── PIPELINE_DIAGRAM.md  # Visual pipeline architecture
```

## CI/CD Pipelines

The project uses the following CI/CD pipelines:

1. **Combined Pipeline** (`azure-pipelines.yml`)
   - Builds and deploys both frontend and backend components
   - Triggered by changes to either frontend or backend code

2. **Frontend Pipeline** (`frontend-pipeline.yml`)
   - Builds and deploys the Next.js frontend application
   - Includes linting, testing, and building steps
   - Deploys to Azure Web App

3. **Backend Pipeline** (`backend-pipeline.yml`)
   - Builds and deploys the Node.js backend application
   - Includes linting, testing, and building steps
   - Deploys to Azure Web App for Linux

## Environment Configuration

The project uses the following environments:

1. **Development**
   - For ongoing development work
   - Automatic deployments from the develop branch
   - Minimal approval requirements

2. **Production**
   - Live environment
   - Strict approval requirements
   - Blue-green deployment strategy

## Infrastructure as Code

The infrastructure is defined using ARM templates or Terraform and includes:

1. **App Service Plans**
   - For hosting frontend and backend applications

2. **Web Apps**
   - For frontend and backend services
   - With deployment slots for blue-green deployments

3. **PostgreSQL Database**
   - Managed PostgreSQL service
   - With geo-redundant backups

4. **Storage Accounts**
   - For storing files, backups, and other assets

5. **Application Insights**
   - For monitoring and logging

6. **Key Vault**
   - For secure storage of secrets and credentials

## Monitoring and Alerting

The project uses the following monitoring tools:

1. **Application Insights**
   - For application performance monitoring
   - For exception tracking
   - For user behavior analytics

2. **Log Analytics**
   - For centralized logging
   - For log querying and analysis
   - For custom dashboards

3. **Azure Monitor**
   - For resource metrics
   - For health checks
   - For automated alerts

## Deployment Strategies

The project uses the following deployment strategies:

1. **Development**: Direct deployment
2. **Production**: Blue-green deployment with full testing

## Security Considerations

The DevOps setup includes the following security measures:

1. **Secret Management**
   - All secrets stored in Azure Key Vault
   - No secrets in source code or pipeline variables

2. **Access Control**
   - Role-based access control for all resources
   - Minimal necessary permissions

3. **Security Scanning**
   - Dependency vulnerability scanning
   - Static code analysis
   - Container scanning (if applicable)

## Disaster Recovery

The disaster recovery plan includes:

1. **Database Backups**
   - Automated daily backups
   - Point-in-time restore capability
   - Geo-redundant storage

2. **Application Recovery**
   - Infrastructure as code for quick rebuilding
   - Documented recovery procedures
   - Regular recovery testing