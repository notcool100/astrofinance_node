# AstroFinance Azure DevOps Pipeline Diagram

This document provides a visual representation of the AstroFinance Azure DevOps pipeline architecture.

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Azure DevOps Organization                     │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    AstroFinance Project                     │    │
│  │                                                             │    │
│  │  ┌─────────────────┐    ┌────────────────┐    ┌──────────┐  │    │
│  │  │    Repository   │    │    Pipelines   │    │ Artifacts│  │    │
│  │  │                 │    │                │    │          │  │    │
│  │  │  ┌───────────┐  │    │ ┌────────────┐ │    │┌────────┐│  │    │
│  │  │  │  Source   │  │    │ │azure-pipe..│ │    ││frontend││  │    │
│  │  │  │   Code    │◄─┼────┼─┤   lines.yml│ │    │└────────┘│  │    │
│  │  │  └───────────┘  │    │ └────────────┘ │    │┌────────┐│  │    │
│  │  │                 │    │ ┌────────────┐ │    ││backend ││  │    │
│  │  └─────────────────┘    │ │frontend-...│ │    │└────────┘│  │    │
│  │                         │ └────────────┘ │    │          │  │    │
│  │                         │ ┌────────────┐ │    │          │  │    │
│  │                         │ │backend-....│ │    │          │  │    │
│  │                         │ └────────────┘ │    │          │  │    │
│  │                         └────────────────┘    └──────────┘  │    │
│  │                                                             │    │
│  │  ┌─────────────────┐    ┌────────────────┐    ┌──────────┐  │    │
│  │  │   Agent Pools   │    │  Environments  │    │ Libraries │  │    │
│  │  │                 │    │                │    │          │  │    │
│  │  │ ┌─────────────┐ │    │ ┌────────────┐ │    │┌────────┐│  │    │
│  │  │ │ContaboAgent │ │    │ │development │ │    ││Variable││  │    │
│  │  │ │    Pool     │ │    │ └────────────┘ │    ││ Groups ││  │    │
│  │  │ └─────────────┘ │    │ ┌────────────┐ │    │└────────┘│  │    │
│  │  │                 │    │ │ production │ │    │          │  │    │
│  │  └─────────────────┘    │ └────────────┘ │    └──────────┘  │    │
│  │                         └────────────────┘                  │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘

                               │
                               │
                               ▼

┌─────────────────────────────────────────────────────────────────────┐
│                         Contabo Ubuntu Server                        │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    Self-Hosted Agent                        │    │
│  │                                                             │    │
│  │  ┌─────────────────┐    ┌────────────────┐    ┌──────────┐  │    │
│  │  │   Node.js 16    │    │      Git       │    │  Docker  │  │    │
│  │  └─────────────────┘    └────────────────┘    └──────────┘  │    │
│  │                                                             │    │
│  │  ┌─────────────────┐    ┌────────────────┐    ┌──────────┐  │    │
│  │  │    Azure CLI    │    │  Build Tools   │    │ Workspace│  │    │
│  │  └─────────────────┘    └────────────────┘    └──────────┘  │    │
│  │                                                             │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘

                               │
                               │
                               ▼

┌─────────────────────────────────────────────────────────────────────┐
│                            Azure Cloud                              │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    Resource Group                           │    │
│  │                                                             │    │
│  │  ┌─────────────────┐    ┌────────────────┐    ┌──────────┐  │    │
│  │  │  App Service    │    │   Web Apps     │    │  Key     │  │    │
│  │  │     Plans       │    │                │    │  Vault   │  │    │
│  │  └─────────────────┘    │ ┌────────────┐ │    └──────────┘  │    │
│  │                         │ │  Frontend  │ │                  │    │
│  │  ┌─────────────────┐    │ └────────────┘ │    ┌──────────┐  │    │
│  │  │  Application    │    │ ┌────────────┐ │    │ Storage  │  │    │
│  │  │    Insights     │    │ │  Backend   │ │    │ Account  │  │    │
│  │  └─────────────────┘    │ └────────────┘ │    └──────────┘  │    │
│  │                         └────────────────┘                  │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

## Pipeline Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Code Commit │────►│   Trigger    │────►│  Build Stage │────►│ Deploy Stage │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                                                │                     │
                                                ▼                     ▼
                                          ┌──────────────┐     ┌──────────────┐
                                          │  Build Steps │     │ Deploy Steps │
                                          └──────────────┘     └──────────────┘
                                                │                     │
                                                ▼                     ▼
                                          ┌──────────────┐     ┌──────────────┐
                                          │  Artifacts   │────►│  Azure Web   │
                                          │              │     │     Apps     │
                                          └──────────────┘     └──────────────┘
```

## Pipeline Components

### 1. Azure DevOps Components

- **Repository**: Stores the source code
- **Pipelines**: Defines the build and deployment process
- **Agent Pools**: Contains the self-hosted agent
- **Environments**: Defines deployment targets (development, production)
- **Libraries**: Stores variable groups and secure files

### 2. Contabo Server Components

- **Self-Hosted Agent**: Runs the pipeline jobs
- **Node.js**: Required for building the application
- **Git**: Required for source control operations
- **Docker**: Optional for containerization
- **Azure CLI**: Required for Azure resource management
- **Build Tools**: Required for building the application
- **Workspace**: Where the build happens

### 3. Azure Cloud Components

- **Resource Group**: Contains all Azure resources
- **App Service Plans**: Hosts the web apps
- **Web Apps**: Runs the frontend and backend applications
- **Application Insights**: Monitors the applications
- **Key Vault**: Stores secrets
- **Storage Account**: Stores files and backups

## Pipeline Stages

### 1. Build Stage

- Install Node.js
- Install dependencies
- Run linting
- Run tests
- Build application
- Create artifacts

### 2. Deploy Stage

- Download artifacts
- Deploy to Azure Web Apps
- Configure application settings
- Verify deployment

## Environment-Specific Configurations

### Development Environment

- Automatic deployments from develop branch
- Minimal approval requirements
- Basic resources

### Production Environment

- Deployments from main branch
- Approval requirements
- Enhanced resources
- Blue-green deployment strategy