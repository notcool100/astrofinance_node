# Testing Guidelines

This document outlines the testing standards and best practices for the Financial Management System project. Following these guidelines will help ensure the reliability, quality, and maintainability of the application.

## Testing Pyramid

We follow the Testing Pyramid approach with:

1. **Unit Tests**: The foundation - many small, focused tests
2. **Integration Tests**: The middle layer - testing component interactions
3. **End-to-End Tests**: The top - fewer tests covering critical user flows

## Test Types

### Unit Tests

Unit tests verify that individual components work as expected in isolation.

#### Frontend Unit Tests

- Test React components using React Testing Library
- Test custom hooks
- Test utility functions
- Test state management logic

#### Backend Unit Tests

- Test service functions
- Test utility functions
- Test model methods
- Test validation logic

### Integration Tests

Integration tests verify that different parts of the application work together correctly.

#### Frontend Integration Tests

- Test component interactions
- Test form submissions
- Test API service integration
- Test context providers with consumers

#### Backend Integration Tests

- Test API endpoints
- Test database interactions
- Test middleware chains
- Test service interactions

### End-to-End Tests

E2E tests verify that entire user flows work correctly from start to finish.

- Test critical business flows
- Test user journeys
- Test across different environments
- Include visual regression testing

## Testing Tools

### Frontend Testing

- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing
- **MSW (Mock Service Worker)**: API mocking
- **Cypress**: End-to-end testing

### Backend Testing

- **Jest**: Test runner and assertion library
- **Supertest**: HTTP assertions
- **Sinon**: Mocks, stubs, and spies
- **Faker**: Test data generation

## Test Coverage

We aim for the following test coverage targets:

- **Unit Tests**: 80% or higher
- **Integration Tests**: Key interactions and flows
- **E2E Tests**: Critical user journeys

Coverage is measured using Jest's coverage reporter.

## Test Organization

### Frontend Test Structure

```
/fe
├── src/
│   ├── components/
│   │   ├── UserProfile.tsx
│   │   └── __tests__/
│   │       └── UserProfile.test.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── __tests__/
│   │       └── useAuth.test.ts
│   └── utils/
│       ├── formatters.ts
│       └── __tests__/
│           └── formatters.test.ts
└── cypress/
    ├── integration/
    │   └── user-management.spec.ts
    └── fixtures/
        └── users.json
```

### Backend Test Structure

```
/be
├── src/
│   ├── services/
│   │   ├── userService.js
│   │   └── __tests__/
│   │       └── userService.test.js
│   └── controllers/
│       ├── userController.js
│       └── __tests__/
│           └── userController.test.js
└── tests/
    ├── integration/
    │   └── user-api.test.js
    └── fixtures/
        └── users.json
```

## Writing Effective Tests

### Unit Test Best Practices

1. **Follow AAA Pattern**:
   - Arrange: Set up test data and conditions
   - Act: Perform the action being tested
   - Assert: Verify the results

2. **Test One Thing Per Test**:
   - Each test should verify a single behavior
   - Use descriptive test names that explain what's being tested

3. **Use Test Doubles Appropriately**:
   - Use mocks for external dependencies
   - Use stubs for predetermined responses
   - Use spies to verify interactions

4. **Keep Tests Fast**:
   - Avoid unnecessary setup
   - Mock external services
   - Use in-memory databases for tests

### Example Unit Test (Frontend)

```typescript
// UserProfile.test.tsx
import { render, screen } from '@testing-library/react';
import { UserProfile } from '../UserProfile';
import { useQuery } from 'react-query';

// Mock react-query
jest.mock('react-query');

describe('UserProfile', () => {
  it('displays user name when data is loaded', () => {
    // Arrange
    (useQuery as jest.Mock).mockReturnValue({
      data: { id: '123', name: 'John Doe', email: 'john@example.com' },
      isLoading: false,
      error: null,
    });

    // Act
    render(<UserProfile userId="123" showDetails={false} />);

    // Assert
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('displays loading state when data is loading', () => {
    // Arrange
    (useQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    // Act
    render(<UserProfile userId="123" showDetails={false} />);

    // Assert
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays error message when loading fails', () => {
    // Arrange
    (useQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to load'),
    });

    // Act
    render(<UserProfile userId="123" showDetails={false} />);

    // Assert
    expect(screen.getByText('Error loading user data')).toBeInTheDocument();
  });

  it('shows details when showDetails is true', () => {
    // Arrange
    (useQuery as jest.Mock).mockReturnValue({
      data: { id: '123', name: 'John Doe', email: 'john@example.com', accountType: 'SB' },
      isLoading: false,
      error: null,
    });

    // Act
    render(<UserProfile userId="123" showDetails={true} />);

    // Assert
    expect(screen.getByText('Email: john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Account Type: SB')).toBeInTheDocument();
  });
});
```

### Example Unit Test (Backend)

```javascript
// userService.test.js
const userService = require('../userService');
const User = require('../../models/user');
const { NotFoundError } = require('../../utils/errors');

// Mock the User model
jest.mock('../../models/user');

describe('userService', () => {
  describe('getUserById', () => {
    it('should return user when valid ID is provided', async () => {
      // Arrange
      const mockUser = { 
        id: '123', 
        name: 'John Doe', 
        email: 'john@example.com',
        accountType: 'SB',
        isActive: true
      };
      User.findByPk = jest.fn().mockResolvedValue(mockUser);
      
      // Act
      const result = await userService.getUserById('123');
      
      // Assert
      expect(result).toEqual({
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        accountType: 'SB',
        isActive: true
      });
      expect(User.findByPk).toHaveBeenCalledWith('123');
    });
    
    it('should throw NotFoundError when user does not exist', async () => {
      // Arrange
      User.findByPk = jest.fn().mockResolvedValue(null);
      
      // Act & Assert
      await expect(userService.getUserById('999')).rejects.toThrow(NotFoundError);
      expect(User.findByPk).toHaveBeenCalledWith('999');
    });
  });
});
```

### Integration Test Best Practices

1. **Focus on Interactions**:
   - Test how components work together
   - Verify data flow between components
   - Test API contract compliance

2. **Use Realistic Test Data**:
   - Create fixtures that represent real-world scenarios
   - Consider edge cases and boundary conditions

3. **Isolate External Dependencies**:
   - Use test doubles for external services
   - Use in-memory or test databases

4. **Clean Up After Tests**:
   - Reset state between tests
   - Clean up created resources

### Example Integration Test (Backend)

```javascript
// user-api.test.js
const request = require('supertest');
const app = require('../../app');
const db = require('../../models');

describe('User API', () => {
  beforeAll(async () => {
    // Set up test database
    await db.sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    // Seed test data
    await db.User.create({
      id: '123',
      name: 'John Doe',
      email: 'john@example.com',
      accountType: 'SB',
      isActive: true
    });
  });

  afterEach(async () => {
    // Clean up test data
    await db.User.destroy({ where: {} });
  });

  afterAll(async () => {
    // Close database connection
    await db.sequelize.close();
  });

  describe('GET /api/users/:id', () => {
    it('should return 200 and user data for valid ID', async () => {
      // Act
      const response = await request(app)
        .get('/api/users/123')
        .set('Authorization', `Bearer ${generateTestToken()}`);
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        accountType: 'SB',
        isActive: true
      });
    });

    it('should return 404 for non-existent user', async () => {
      // Act
      const response = await request(app)
        .get('/api/users/999')
        .set('Authorization', `Bearer ${generateTestToken()}`);
      
      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'User not found');
    });

    it('should return 401 for unauthorized request', async () => {
      // Act
      const response = await request(app)
        .get('/api/users/123');
      
      // Assert
      expect(response.status).toBe(401);
    });
  });
});

function generateTestToken() {
  // Generate a test JWT token
  // Implementation details omitted for brevity
}
```

### End-to-End Test Best Practices

1. **Test Critical User Flows**:
   - Focus on business-critical paths
   - Test complete user journeys
   - Include happy paths and error scenarios

2. **Use Realistic Test Environment**:
   - Test against an environment similar to production
   - Use realistic data
   - Consider performance characteristics

3. **Make Tests Resilient**:
   - Handle asynchronous operations properly
   - Use appropriate waiting strategies
   - Avoid brittle selectors

4. **Keep Tests Independent**:
   - Each test should be self-contained
   - Tests should not depend on each other
   - Clean up after each test

### Example E2E Test (Cypress)

```javascript
// user-management.spec.ts
describe('User Management', () => {
  beforeEach(() => {
    // Set up test data and login
    cy.fixture('users').then((users) => {
      cy.intercept('GET', '/api/users*', { body: users }).as('getUsers');
      cy.intercept('GET', '/api/users/123', { body: users[0] }).as('getUser');
    });
    
    cy.login('admin@example.com', 'password');
  });

  it('should display user list and navigate to user details', () => {
    // Visit user management page
    cy.visit('/admin/users');
    cy.wait('@getUsers');
    
    // Verify user list is displayed
    cy.get('[data-testid="user-list"]').should('be.visible');
    cy.get('[data-testid="user-list-item"]').should('have.length.at.least', 1);
    
    // Click on a user to view details
    cy.get('[data-testid="user-list-item"]').first().click();
    cy.wait('@getUser');
    
    // Verify user details are displayed
    cy.get('[data-testid="user-details"]').should('be.visible');
    cy.get('[data-testid="user-name"]').should('contain', 'John Doe');
    cy.get('[data-testid="user-email"]').should('contain', 'john@example.com');
  });

  it('should create a new user successfully', () => {
    // Intercept the POST request
    cy.intercept('POST', '/api/users', {
      statusCode: 201,
      body: {
        id: '456',
        name: 'Jane Smith',
        email: 'jane@example.com',
        accountType: 'BB',
        isActive: true
      }
    }).as('createUser');
    
    // Visit user management page
    cy.visit('/admin/users');
    
    // Click on "Add User" button
    cy.get('[data-testid="add-user-button"]').click();
    
    // Fill the form
    cy.get('[data-testid="user-form"]').should('be.visible');
    cy.get('[data-testid="input-name"]').type('Jane Smith');
    cy.get('[data-testid="input-email"]').type('jane@example.com');
    cy.get('[data-testid="select-account-type"]').select('BB');
    
    // Submit the form
    cy.get('[data-testid="submit-button"]').click();
    cy.wait('@createUser');
    
    // Verify success message
    cy.get('[data-testid="success-message"]').should('be.visible');
    cy.get('[data-testid="success-message"]').should('contain', 'User created successfully');
  });
});
```

## Test Data Management

### Test Data Principles

1. **Use Fixtures for Common Data**:
   - Store reusable test data in fixture files
   - Organize fixtures by domain or feature

2. **Generate Dynamic Data When Needed**:
   - Use libraries like Faker for random data
   - Ensure generated data meets validation requirements

3. **Clean Up Test Data**:
   - Reset the test environment between tests
   - Delete created resources after tests

### Example Fixture (users.json)

```json
[
  {
    "id": "123",
    "name": "John Doe",
    "email": "john@example.com",
    "accountType": "SB",
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00Z"
  },
  {
    "id": "124",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "accountType": "BB",
    "isActive": true,
    "createdAt": "2023-01-02T00:00:00Z"
  },
  {
    "id": "125",
    "name": "Bob Johnson",
    "email": "bob@example.com",
    "accountType": "MB",
    "isActive": false,
    "createdAt": "2023-01-03T00:00:00Z"
  }
]
```

## Mocking Strategies

### What to Mock

1. **External Services**:
   - APIs
   - Databases
   - File systems
   - Time-dependent functions

2. **Complex Components**:
   - Authentication providers
   - Context providers
   - Third-party components

### Mocking Techniques

1. **Jest Mocks**:
   ```javascript
   jest.mock('../path/to/module');
   ```

2. **Manual Mocks**:
   ```javascript
   // __mocks__/axios.js
   module.exports = {
     get: jest.fn().mockResolvedValue({ data: {} }),
     post: jest.fn().mockResolvedValue({ data: {} })
   };
   ```

3. **Mock Service Worker (MSW)**:
   ```javascript
   // mocks/handlers.js
   import { rest } from 'msw';
   
   export const handlers = [
     rest.get('/api/users', (req, res, ctx) => {
       return res(ctx.json([{ id: '123', name: 'John Doe' }]));
     }),
     
     rest.post('/api/users', (req, res, ctx) => {
       return res(ctx.status(201), ctx.json({ id: '456', ...req.body }));
     })
   ];
   ```

## Test Automation

### CI/CD Integration

1. **Run Tests on Pull Requests**:
   - Configure CI to run tests for every PR
   - Block merging if tests fail

2. **Run Tests on Merge to Main Branches**:
   - Run full test suite on merges to develop/main
   - Generate and publish coverage reports

3. **Run E2E Tests in Staging**:
   - Run E2E tests against staging environment
   - Include visual regression tests

### Example CI Configuration (Azure Pipelines)

```yaml
trigger:
  - main
  - develop

pool:
  vmImage: 'ubuntu-latest'

stages:
  - stage: Test
    jobs:
      - job: UnitTests
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: '16.x'
          
          - script: |
              cd fe
              npm ci
              npm run test:coverage
            displayName: 'Frontend Unit Tests'
          
          - script: |
              cd be
              npm ci
              npm run test:coverage
            displayName: 'Backend Unit Tests'
          
          - task: PublishTestResults@2
            inputs:
              testResultsFormat: 'JUnit'
              testResultsFiles: '**/junit.xml'
          
          - task: PublishCodeCoverageResults@1
            inputs:
              codeCoverageTool: 'Cobertura'
              summaryFileLocation: '**/coverage/cobertura-coverage.xml'
      
      - job: IntegrationTests
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: '16.x'
          
          - script: |
              cd be
              npm ci
              npm run test:integration
            displayName: 'Backend Integration Tests'
      
      - job: E2ETests
        dependsOn: [UnitTests, IntegrationTests]
        condition: succeeded()
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: '16.x'
          
          - script: |
              cd fe
              npm ci
              npm run test:e2e
            displayName: 'E2E Tests'
```

## Test-Driven Development (TDD)

We encourage using TDD for complex features:

1. **Write a Failing Test**:
   - Define the expected behavior
   - Start with the simplest test case

2. **Write the Minimum Code to Pass**:
   - Implement just enough code to make the test pass
   - Don't worry about optimization yet

3. **Refactor**:
   - Clean up the code
   - Ensure tests still pass

4. **Repeat**:
   - Add more test cases
   - Expand functionality incrementally

## Troubleshooting Tests

### Common Issues and Solutions

1. **Flaky Tests**:
   - Identify and fix race conditions
   - Add proper waiting mechanisms
   - Ensure test isolation

2. **Slow Tests**:
   - Profile test execution
   - Mock expensive operations
   - Parallelize test execution

3. **Difficult to Maintain Tests**:
   - Refactor to remove duplication
   - Extract common setup into helpers
   - Improve test organization

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Cypress Documentation](https://docs.cypress.io/)
- [Testing JavaScript](https://testingjavascript.com/) by Kent C. Dodds
- [The Art of Unit Testing](https://www.manning.com/books/the-art-of-unit-testing-third-edition) by Roy Osherove