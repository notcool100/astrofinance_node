# Backend Setup Guide

## Overview
This guide provides instructions for setting up the backend development environment for the Financial Management System. The backend is built using Node.js with Express.js framework and follows a module-based architecture.

## Prerequisites
- Node.js (v16.x or later)
- npm (v8.x or later) or yarn (v1.22.x or later)
- PostgreSQL (v14.x or later)
- Git
- Redis (optional, for caching)

## Directory Structure
The backend code is located in the `/be` directory with the following structure:

```
/be
├── src/
│   ├── modules/            # Feature modules
│   │   ├── admin/          # Admin module
│   │   │   ├── admin.controller.ts
│   │   │   ├── admin.module.ts
│   │   │   ├── admin.route.ts
│   │   │   └── admin.service.ts
│   │   ├── user/           # User module
│   │   ├── staff/          # Staff module
│   │   ├── loan/           # Loan module
│   │   ├── accounting/     # Accounting module
│   │   ├── notification/   # SMS notification module
│   │   ├── tax/            # Tax calculation module
│   │   ├── report/         # Report generation module
│   │   └── expense/        # Expense tracking module
│   ├── common/             # Shared code
│   │   ├── decorators/     # Custom decorators
│   │   ├── filters/        # Exception filters
│   │   ├── guards/         # Authentication guards
│   │   ├── interceptors/   # Request/response interceptors
│   │   └── middleware/     # Express middleware
│   ├── config/             # Configuration files
│   ├── prisma/             # Prisma schema and client
│   │   ├── schema.prisma   # Prisma schema definition
│   │   ├── migrations/     # Prisma migrations
│   │   └── seed.ts         # Database seeding script
│   ├── utils/              # Utility functions
│   └── app.ts              # Express application setup
├── tests/                  # Test files
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── e2e/                # End-to-end tests
├── .env.example            # Example environment variables
├── .eslintrc.js            # ESLint configuration
├── .prettierrc             # Prettier configuration
├── jest.config.js          # Jest configuration
├── package.json            # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## Installation

1. Navigate to the backend directory:
   ```bash
   cd /home/notcool/Desktop/astrofinanceNew/be
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

## Configuration

1. Create environment file:

   Copy the example environment file and update it with your configuration:
   ```bash
   cp .env.example .env
   ```

   Update the following variables in the `.env` file:
   ```
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   
   # Database Configuration (Prisma)
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/fms_db?schema=public"
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRATION=8h
   
   # Logging Configuration
   LOG_LEVEL=debug
   
   # Redis Configuration (optional, for caching)
   REDIS_URL=redis://localhost:6379
   
   # SMS Gateway Configuration (if applicable)
   SMS_API_KEY=your_sms_api_key
   SMS_SENDER_ID=FMS
   ```

2. Configure Prisma:

   The Prisma schema is defined in `/be/src/prisma/schema.prisma`. This file contains all the database models and their relationships.

## Database Setup

1. Create the PostgreSQL database:
   ```bash
   psql -U postgres -c "CREATE DATABASE fms_db;"
   ```

2. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

3. Run Prisma migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

4. (Optional) Seed the database with initial data:
   ```bash
   npx prisma db seed
   ```

5. (Optional) Explore your database with Prisma Studio:
   ```bash
   npx prisma studio
   ```
   This will open a web interface at http://localhost:5555 where you can view and edit your database.

## Development

1. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   This will start the server with nodemon for automatic reloading.

2. The API will be available at `http://localhost:3001/api`

## Building for Production

1. Create a production build:
   ```bash
   npm run build
   # or
   yarn build
   ```

2. Start the production server:
   ```bash
   npm run start
   # or
   yarn start
   ```

## Code Quality Tools

### Linting
Run ESLint to check for code quality issues:
```bash
npm run lint
# or
yarn lint
```

### Formatting
Format code using Prettier:
```bash
npm run format
# or
yarn format
```

## Testing

### Running Tests
Execute unit and integration tests:
```bash
npm run test
# or
yarn test
```

Run tests in watch mode during development:
```bash
npm run test:watch
# or
yarn test:watch
```

### Test Coverage
Generate test coverage report:
```bash
npm run test:coverage
# or
yarn test:coverage
```

## API Documentation

The API documentation is generated using Swagger/OpenAPI:

1. Start the server in development mode
2. Access the API documentation at `http://localhost:3001/api-docs`

## Key Dependencies

- **Express.js**: Web framework for Node.js
- **TypeScript**: Static type checking
- **Prisma**: Next-generation ORM for PostgreSQL
- **Passport.js**: Authentication middleware
- **JWT**: JSON Web Token for authentication
- **Joi**: Request validation
- **Winston**: Logging
- **Redis**: Caching (optional)
- **Jest**: Testing framework
- **Supertest**: HTTP testing
- **Swagger/OpenAPI**: API documentation

## Folder Structure Guidelines

### Module-Based Architecture
- Each feature is organized as a module in `/src/modules`
- Each module contains its own controllers, routes, and services
- Modules are self-contained and follow a consistent structure

### Module Structure
- **module.controller.ts**: Request handlers for the module
- **module.route.ts**: API routes for the module
- **module.service.ts**: Business logic for the module
- **module.module.ts**: Module definition and configuration

### Common Code
- Place shared code in `/src/common`
- Use decorators for cross-cutting concerns
- Implement middleware for request processing
- Create guards for authentication and authorization

### Prisma Schema
- Define all data models in `/src/prisma/schema.prisma`
- Follow Prisma schema conventions
- Include proper relations and validations
- Use Prisma migrations for schema changes

## Best Practices

1. **Error Handling**:
   - Use a centralized error handling middleware
   - Return consistent error responses
   - Log errors with appropriate context

2. **Authentication & Authorization**:
   - Implement proper JWT validation
   - Use role-based access control
   - Secure sensitive routes with middleware

3. **Validation**:
   - Validate all request inputs
   - Use Joi schemas for validation
   - Return descriptive validation errors

4. **Logging**:
   - Use structured logging
   - Include request IDs for traceability
   - Configure appropriate log levels

5. **Performance**:
   - Optimize database queries
   - Implement caching where appropriate
   - Use pagination for large data sets

## Troubleshooting

### Common Issues

1. **Database Connection Issues**:
   - Verify database credentials in `.env`
   - Check if PostgreSQL service is running
   - Ensure database exists and is accessible

2. **Authentication Issues**:
   - Check JWT secret and expiration settings
   - Verify token validation middleware
   - Check for proper token transmission

3. **Performance Issues**:
   - Look for N+1 query problems
   - Check for missing database indexes
   - Monitor memory usage for leaks

## Additional Resources

- [Node.js Documentation](https://nodejs.org/en/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [Sequelize Documentation](https://sequelize.org/master/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)