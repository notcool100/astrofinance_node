---
description: Repository Information Overview
alwaysApply: true
---

# Financial Management System (FMS) Information

## Summary
A comprehensive Financial Management System for a microfinance company in Nepal. The system handles user management, loan calculation, interest handling, accounting entries, and financial reporting.

## Structure
- **fe/**: Frontend application built with Next.js and TypeScript
- **be/**: Backend API server using Node.js, Express, and Prisma
- **db/**: Database resources including schema design and seed data
- **devops/**: DevOps configuration for CI/CD pipelines and infrastructure
- **docs/**: Project documentation including module specifications and setup guides
- **pub/**: Public assets and resources

## Projects

### Frontend (Next.js Application)
**Configuration File**: fe/package.json

#### Language & Runtime
**Language**: TypeScript
**Version**: TypeScript 5.3.2
**Framework**: Next.js 14.0.3
**Package Manager**: npm/pnpm

#### Dependencies
**Main Dependencies**:
- React 18.2.0
- Next.js 14.0.3
- React Query 3.39.3
- React Hook Form 7.48.2
- Chakra UI 3.22.0
- Chart.js 4.4.0
- Axios 1.6.2

#### Build & Installation
```bash
cd fe
npm install
npm run dev  # Development server
npm run build  # Production build
npm run start  # Start production server
```

#### Testing
**Framework**: Jest 29.7.0
**Test Location**: fe/src/__tests__
**Run Command**:
```bash
npm run test
npm run test:coverage
```

### Backend (Node.js API)
**Configuration File**: be/package.json

#### Language & Runtime
**Language**: TypeScript
**Version**: TypeScript 5.8.3
**Framework**: Express 4.18.2
**ORM**: Prisma 4.14.0
**Package Manager**: npm/pnpm

#### Dependencies
**Main Dependencies**:
- Express 4.18.2
- Prisma Client 4.14.0
- JWT 9.0.0
- Bcrypt 6.0.0
- Joi 17.13.3
- Winston 3.8.2
- PDFKit 0.14.0
- ExcelJS 4.4.0

#### Build & Installation
```bash
cd be
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev  # Development server
npm run build  # Production build
npm run start  # Start production server
```

#### Testing
**Framework**: Jest 29.5.0
**Test Location**: be/tests
**Run Command**:
```bash
npm run test
```

### Database (PostgreSQL)
**Configuration File**: be/src/prisma/schema.prisma

#### Specification & Tools
**Type**: PostgreSQL
**ORM**: Prisma
**Schema Location**: be/src/prisma/schema.prisma

#### Key Resources
**Main Files**:
- be/src/prisma/schema.prisma (Database schema definition)
- db/seed-data/ (Seed data for development)
- be/src/prisma/seed.ts (Database seeding script)

#### Usage & Operations
**Key Commands**:
```bash
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio UI
npm run prisma:seed      # Seed the database
```

### DevOps Configuration
**Configuration File**: azure-pipelines.yml

#### Specification & Tools
**CI/CD**: Azure DevOps Pipelines
**Infrastructure**: Azure Cloud Services

#### Key Resources
**Main Files**:
- devops/pipelines/azure-pipelines.yml (Main pipeline definition)
- devops/pipelines/frontend-pipeline.yml (Frontend-specific pipeline)
- devops/pipelines/backend-pipeline.yml (Backend-specific pipeline)
- devops/infrastructure/ (Infrastructure configuration)

#### Usage & Operations
**Integration Points**:
- Automated builds triggered by commits to specific branches
- Deployment to development, staging, and production environments
- Infrastructure provisioning and configuration