# Coding Standards

This document outlines the coding standards and best practices for the Financial Management System project. All team members should adhere to these guidelines to ensure code quality, maintainability, and consistency.

## General Guidelines

### Code Formatting

- Use consistent indentation (2 spaces)
- Limit line length to 100 characters
- Use meaningful variable and function names
- Follow the principle of "Clean Code"
- Use ESLint and Prettier for automated formatting

### File Organization

- One class/component per file
- Group related files in appropriate directories
- Use consistent file naming conventions
- Keep files reasonably sized (< 300 lines as a guideline)

### Comments and Documentation

- Write self-documenting code where possible
- Add comments for complex logic or business rules
- Document public APIs and interfaces
- Include JSDoc comments for functions and classes
- Keep comments up-to-date with code changes

### Error Handling

- Use try-catch blocks for error-prone operations
- Provide meaningful error messages
- Log errors with appropriate context
- Handle errors at the appropriate level
- Never silently catch errors without proper handling

## Frontend Standards (Next.js/TypeScript)

### Component Structure

- Use functional components with hooks
- Keep components focused on a single responsibility
- Extract reusable logic into custom hooks
- Separate container and presentational components
- Use proper prop validation with TypeScript interfaces

```typescript
// Example of a well-structured component
import React from 'react';
import { useQuery } from 'react-query';
import { fetchUserData } from '../services/userService';

interface UserProfileProps {
  userId: string;
  showDetails: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userId, showDetails }) => {
  const { data, isLoading, error } = useQuery(['user', userId], () => fetchUserData(userId));

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading user data</div>;

  return (
    <div className="user-profile">
      <h2>{data.name}</h2>
      {showDetails && (
        <div className="user-details">
          <p>Email: {data.email}</p>
          <p>Account Type: {data.accountType}</p>
        </div>
      )}
    </div>
  );
};
```

### State Management

- Use React Query for server state
- Use React Context for global UI state
- Use local state for component-specific state
- Avoid prop drilling by using context or composition
- Keep state as close as possible to where it's used

### Styling

- Use Tailwind CSS for styling
- Follow utility-first approach
- Extract common patterns to components
- Use consistent naming for custom classes
- Ensure responsive design for all components

### TypeScript Usage

- Define interfaces for all props and state
- Use proper type annotations for functions
- Avoid using `any` type
- Use union types for variables with multiple possible types
- Leverage TypeScript's type system for better code quality

```typescript
// Example of good TypeScript usage
interface User {
  id: string;
  name: string;
  email: string;
  accountType: 'SB' | 'BB' | 'MB';
  isActive: boolean;
}

function formatUserName(user: User): string {
  return `${user.name} (${user.accountType})`;
}

// Using generics for reusable functions
function sortByProperty<T>(array: T[], property: keyof T): T[] {
  return [...array].sort((a, b) => 
    a[property] > b[property] ? 1 : a[property] < b[property] ? -1 : 0
  );
}
```

## Backend Standards (Node.js)

### API Structure

- Follow RESTful API design principles
- Use consistent URL patterns
- Implement proper HTTP status codes
- Version your APIs
- Document APIs with OpenAPI/Swagger

### Controller Pattern

- Keep controllers thin
- Move business logic to services
- Use dependency injection for services
- Handle request validation in middleware
- Return consistent response formats

```javascript
// Example of a well-structured controller
const userService = require('../services/userService');

async function getUser(req, res, next) {
  try {
    const userId = req.params.id;
    const user = await userService.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUser
};
```

### Service Layer

- Implement business logic in services
- Make services testable and reusable
- Use dependency injection for external dependencies
- Handle domain-specific validation
- Return domain objects, not database entities

```javascript
// Example of a well-structured service
const User = require('../models/user');
const { NotFoundError } = require('../utils/errors');

async function getUserById(userId) {
  const user = await User.findByPk(userId);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    accountType: user.accountType,
    isActive: user.isActive
  };
}

module.exports = {
  getUserById
};
```

### Database Access

- Use Sequelize ORM for database operations
- Define clear and consistent models
- Use migrations for schema changes
- Implement proper indexing
- Use transactions for data integrity

### Authentication and Authorization

- Implement JWT-based authentication
- Use middleware for authorization
- Apply principle of least privilege
- Validate and sanitize all user inputs
- Protect against common security vulnerabilities

## Database Standards

### Schema Design

- Use meaningful table and column names
- Follow naming conventions consistently
- Implement proper relationships
- Use appropriate data types
- Add constraints for data integrity

### SQL Queries

- Write readable and maintainable SQL
- Use parameterized queries to prevent SQL injection
- Optimize queries for performance
- Add comments for complex queries
- Use transactions for multi-step operations

### Migrations

- Use migrations for all schema changes
- Make migrations reversible
- Keep migrations small and focused
- Include descriptive comments
- Test migrations before applying to production

## Testing Standards

### Unit Testing

- Write tests for all business logic
- Follow AAA pattern (Arrange, Act, Assert)
- Use meaningful test descriptions
- Mock external dependencies
- Aim for high test coverage

```javascript
// Example of a good unit test
describe('userService', () => {
  describe('getUserById', () => {
    it('should return user when valid ID is provided', async () => {
      // Arrange
      const mockUser = { id: '123', name: 'John Doe', email: 'john@example.com' };
      User.findByPk = jest.fn().mockResolvedValue(mockUser);
      
      // Act
      const result = await userService.getUserById('123');
      
      // Assert
      expect(result).toEqual({
        id: '123',
        name: 'John Doe',
        email: 'john@example.com'
      });
      expect(User.findByPk).toHaveBeenCalledWith('123');
    });
    
    it('should throw NotFoundError when user does not exist', async () => {
      // Arrange
      User.findByPk = jest.fn().mockResolvedValue(null);
      
      // Act & Assert
      await expect(userService.getUserById('999')).rejects.toThrow(NotFoundError);
    });
  });
});
```

### Integration Testing

- Test API endpoints
- Test database interactions
- Use test databases for integration tests
- Clean up test data after tests
- Test happy paths and error scenarios

### End-to-End Testing

- Test critical user flows
- Use realistic test data
- Test across different environments
- Include performance testing
- Document test scenarios

## Version Control

### Git Workflow

- Follow Git Flow or a similar branching strategy
- Write meaningful commit messages
- Keep commits focused and atomic
- Use pull requests for code reviews
- Regularly merge from main/develop to feature branches

### Commit Messages

- Use the imperative mood ("Add feature" not "Added feature")
- Start with a capital letter
- Keep the first line under 50 characters
- Add detailed description if necessary
- Reference issue numbers when applicable

## Code Review

### Review Process

- Review all code before merging
- Focus on logic, security, and maintainability
- Be constructive and respectful
- Use automated tools to catch common issues
- Document review decisions

### Review Checklist

- Does the code follow the coding standards?
- Is the code secure and free from vulnerabilities?
- Is the code well-tested?
- Is the code efficient and performant?
- Is the code easy to understand and maintain?
- Is the documentation complete and accurate?

## Continuous Improvement

- Regularly review and update coding standards
- Share knowledge and best practices
- Conduct code quality metrics analysis
- Refactor legacy code when appropriate
- Invest in developer education and training