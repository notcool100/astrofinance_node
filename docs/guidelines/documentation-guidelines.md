# Documentation Guidelines

This document outlines the documentation standards and best practices for the Financial Management System project. Following these guidelines will help ensure that the project is well-documented, making it easier to understand, maintain, and extend.

## Documentation Types

The project includes several types of documentation:

1. **Code Documentation**: Comments and documentation within the codebase
2. **API Documentation**: Documentation of API endpoints and their usage
3. **Technical Documentation**: Architecture, design decisions, and technical details
4. **User Documentation**: Guides and manuals for end-users
5. **Process Documentation**: Development workflows, procedures, and guidelines

## Documentation Structure

### Project-Level Documentation

Located in the `/docs` directory:

```
/docs
├── modules/             # Module-specific documentation
├── setup/               # Setup and installation guides
├── guidelines/          # Development guidelines
├── architecture/        # Architecture documentation
└── user-guides/         # End-user documentation
```

### Code-Level Documentation

Located alongside the code:

- Frontend: JSDoc comments, README files in component directories
- Backend: JSDoc comments, API documentation using OpenAPI/Swagger
- Database: Comments in migration files, entity-relationship diagrams

## Documentation Standards

### General Guidelines

1. **Keep Documentation Updated**:
   - Update documentation when code changes
   - Review documentation during code reviews
   - Treat documentation as a first-class citizen

2. **Write Clearly and Concisely**:
   - Use simple, direct language
   - Avoid jargon unless necessary
   - Define acronyms and technical terms

3. **Use Consistent Formatting**:
   - Follow Markdown conventions
   - Use consistent headings and structure
   - Include tables of contents for longer documents

4. **Include Examples**:
   - Provide code examples where appropriate
   - Include screenshots for UI features
   - Show sample API requests and responses

### Code Documentation

#### JavaScript/TypeScript Documentation

Use JSDoc comments for functions, classes, and modules:

```javascript
/**
 * Calculates the EMI (Equated Monthly Installment) for a loan.
 *
 * @param {number} principal - The loan amount in currency units
 * @param {number} rate - The annual interest rate (in percentage)
 * @param {number} tenure - The loan tenure in months
 * @returns {number} The monthly installment amount
 *
 * @example
 * // Calculate EMI for a loan of 100,000 at 10% annual interest for 5 years
 * const emi = calculateEMI(100000, 10, 60);
 * // Returns: 2124.70
 */
function calculateEMI(principal, rate, tenure) {
  const monthlyRate = rate / 12 / 100;
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenure) / 
              (Math.pow(1 + monthlyRate, tenure) - 1);
  return parseFloat(emi.toFixed(2));
}
```

#### React Component Documentation

Document React components with JSDoc and PropTypes/TypeScript interfaces:

```typescript
/**
 * LoanCalculator component allows users to calculate loan EMIs based on
 * principal amount, interest rate, and tenure.
 *
 * @component
 * @example
 * <LoanCalculator 
 *   minAmount={10000} 
 *   maxAmount={1000000} 
 *   defaultRate={10} 
 *   onCalculate={(result) => console.log(result)} 
 * />
 */
interface LoanCalculatorProps {
  /** Minimum loan amount allowed */
  minAmount: number;
  /** Maximum loan amount allowed */
  maxAmount: number;
  /** Default interest rate to display */
  defaultRate: number;
  /** Callback function when calculation is performed */
  onCalculate: (result: LoanResult) => void;
}

export const LoanCalculator: React.FC<LoanCalculatorProps> = ({
  minAmount,
  maxAmount,
  defaultRate,
  onCalculate
}) => {
  // Component implementation
};
```

#### SQL Documentation

Document database schema and migrations:

```sql
-- Create users table
-- This table stores all client information for the microfinance system
-- Users can be of different types: SB (Sadaran Bachat), BB (Baal Bachat), MB (Masik Bachat)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL, -- Client's full name
  date_of_birth DATE NOT NULL,     -- Client's date of birth
  gender VARCHAR(10),              -- Client's gender
  contact_number VARCHAR(20) NOT NULL, -- Primary contact number
  email VARCHAR(100),              -- Optional email address
  address TEXT NOT NULL,           -- Physical address
  id_type VARCHAR(50) NOT NULL,    -- Type of ID document provided
  id_number VARCHAR(50) NOT NULL,  -- ID document number
  user_type VARCHAR(10) NOT NULL,  -- SB, BB, or MB
  is_active BOOLEAN DEFAULT true,  -- Whether the user account is active
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster searches by name
CREATE INDEX idx_users_full_name ON users(full_name);
```

### API Documentation

Use OpenAPI/Swagger for API documentation:

```yaml
# User API endpoints
/api/users:
  get:
    summary: Retrieve a list of users
    description: Returns a paginated list of users with optional filtering
    parameters:
      - name: page
        in: query
        description: Page number for pagination
        schema:
          type: integer
          default: 1
      - name: limit
        in: query
        description: Number of users per page
        schema:
          type: integer
          default: 10
      - name: userType
        in: query
        description: Filter by user type (SB, BB, MB)
        schema:
          type: string
          enum: [SB, BB, MB]
    responses:
      '200':
        description: A list of users
        content:
          application/json:
            schema:
              type: object
              properties:
                data:
                  type: array
                  items:
                    $ref: '#/components/schemas/User'
                pagination:
                  $ref: '#/components/schemas/Pagination'
      '401':
        description: Unauthorized
      '500':
        description: Internal server error
```

### README Files

Each major directory should have a README.md file explaining:

1. **Purpose**: What the code in this directory does
2. **Structure**: How the code is organized
3. **Usage**: How to use the code
4. **Examples**: Sample usage if applicable

Example README for a component directory:

```markdown
# Loan Module Components

This directory contains React components for the Loan Module of the Financial Management System.

## Components

### LoanCalculator

A component that allows users to calculate loan EMIs based on principal amount, interest rate, and tenure.

#### Usage

```jsx
import { LoanCalculator } from './LoanCalculator';

<LoanCalculator 
  minAmount={10000} 
  maxAmount={1000000} 
  defaultRate={10} 
  onCalculate={(result) => console.log(result)} 
/>
```

### LoanApplicationForm

A multi-step form for loan applications.

#### Usage

```jsx
import { LoanApplicationForm } from './LoanApplicationForm';

<LoanApplicationForm 
  userId="123"
  loanTypes={loanTypes}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>
```

## Utilities

The `utils` directory contains helper functions for loan calculations and validation.
```

## Technical Documentation

### Architecture Documentation

Document the system architecture using:

1. **Architecture Diagrams**:
   - System context diagrams
   - Container diagrams
   - Component diagrams
   - Deployment diagrams

2. **Design Decisions**:
   - Document important design decisions
   - Include alternatives considered
   - Explain the rationale for choices

3. **Data Flow**:
   - Document how data flows through the system
   - Include sequence diagrams for complex flows

Example architecture document structure:

```markdown
# System Architecture

## Overview

The Financial Management System is a web-based application for microfinance institutions in Nepal. It provides functionality for user management, loan processing, accounting, and reporting.

## Architecture Diagram

![System Architecture](./images/system-architecture.png)

## Components

### Frontend (Next.js)

The frontend is built with Next.js and TypeScript, providing a responsive user interface for both administrators and clients.

Key technologies:
- Next.js for server-side rendering and routing
- React Query for data fetching and caching
- Tailwind CSS for styling
- Chart.js for data visualization

### Backend (Node.js)

The backend is built with Node.js and Express, providing RESTful APIs for the frontend.

Key technologies:
- Express.js for API routing
- Sequelize ORM for database access
- Passport.js for authentication
- Winston for logging

### Database (PostgreSQL)

PostgreSQL is used as the primary database, storing all application data.

Key features:
- Relational data model
- Transactional integrity
- Complex query support
- Robust indexing

## Data Flow

### Loan Application Process

1. User submits loan application through the frontend
2. Frontend validates input and sends to backend API
3. Backend validates application and stores in database
4. Notification is sent to admin for review
5. Admin reviews and approves/rejects application
6. If approved, loan is created and disbursement process begins

Sequence diagram:
![Loan Application Sequence](./images/loan-application-sequence.png)
```

### API Documentation

Document APIs using OpenAPI/Swagger:

1. **API Overview**:
   - Purpose and scope of the API
   - Authentication methods
   - Rate limiting and quotas

2. **Endpoints**:
   - URL and HTTP method
   - Request parameters and body
   - Response format and status codes
   - Error handling

3. **Examples**:
   - Sample requests and responses
   - Common use cases
   - Curl commands

### Database Documentation

Document the database schema:

1. **Entity-Relationship Diagram**:
   - Visual representation of tables and relationships
   - Cardinality and relationship types

2. **Table Descriptions**:
   - Purpose of each table
   - Column definitions and constraints
   - Indexes and performance considerations

3. **Query Examples**:
   - Common queries for reference
   - Complex queries with explanations

## User Documentation

### User Manuals

Create comprehensive user manuals:

1. **Admin Manual**:
   - System administration
   - User management
   - Configuration settings
   - Troubleshooting

2. **Operator Manual**:
   - Day-to-day operations
   - Transaction processing
   - Reporting
   - Common tasks

3. **End-User Guide**:
   - Account management
   - Loan applications
   - Transaction history
   - Statement access

### Tutorial-Style Documentation

Create step-by-step tutorials:

1. **Task-Based Tutorials**:
   - How to create a new user
   - How to process a loan application
   - How to generate reports

2. **Include**:
   - Screenshots
   - Step-by-step instructions
   - Expected outcomes
   - Troubleshooting tips

Example tutorial:

```markdown
# How to Process a Loan Application

This tutorial guides you through the process of reviewing and processing a loan application in the Financial Management System.

## Prerequisites

- Admin or Loan Officer role
- Access to the Loan Management module

## Steps

### 1. Access the Loan Applications List

Navigate to **Loans > Applications > Pending** in the main menu.

![Loan Applications Menu](./images/loan-applications-menu.png)

### 2. Review the Application

Click on an application to view its details.

![Application Details](./images/application-details.png)

Review the following information:
- Applicant details
- Loan amount and purpose
- Credit history
- Attached documents

### 3. Verify Documents

Check that all required documents are attached and valid:
- ID proof
- Income verification
- Collateral documents (if applicable)

### 4. Make a Decision

Based on your review, choose one of the following actions:
- **Approve**: If the application meets all criteria
- **Reject**: If the application does not meet criteria
- **Request More Information**: If additional documents or clarification is needed

![Decision Buttons](./images/decision-buttons.png)

### 5. Complete the Process

If approving:
1. Enter the approved loan amount and terms
2. Specify the disbursement date
3. Add any conditions (if applicable)
4. Click "Approve and Process"

![Approval Form](./images/approval-form.png)

### 6. Confirmation

You will see a confirmation screen. The applicant will be notified of the decision automatically.

![Confirmation Screen](./images/confirmation-screen.png)

## Troubleshooting

- **Cannot approve loan**: Ensure all required fields are filled and validation passes
- **Document not visible**: Try refreshing the page or check file format compatibility
- **System error**: Contact IT support with the error message displayed
```

## Documentation Tools and Processes

### Tools

1. **Markdown**:
   - Primary format for documentation
   - Supported by GitHub and most documentation systems

2. **JSDoc**:
   - For JavaScript/TypeScript code documentation
   - Generates API documentation from code comments

3. **Swagger/OpenAPI**:
   - For REST API documentation
   - Interactive API documentation and testing

4. **Diagrams**:
   - Draw.io/diagrams.net for architecture diagrams
   - PlantUML for sequence diagrams
   - Mermaid for embedding diagrams in Markdown

### Documentation Process

1. **Documentation Planning**:
   - Identify documentation needs at the start of the project
   - Allocate time for documentation in sprint planning
   - Assign documentation responsibilities

2. **Documentation Review**:
   - Include documentation in code reviews
   - Verify documentation accuracy and completeness
   - Ensure documentation follows guidelines

3. **Documentation Updates**:
   - Update documentation when code changes
   - Schedule regular documentation reviews
   - Track documentation debt

## Best Practices

1. **Write Documentation as You Code**:
   - Document code as you write it
   - Update documentation when you change code
   - Include documentation in definition of "done"

2. **Use Templates**:
   - Create templates for common documentation types
   - Ensure consistent structure and format
   - Make it easy to create new documentation

3. **Make Documentation Discoverable**:
   - Use clear file names and organization
   - Include links between related documentation
   - Maintain a documentation index

4. **Keep Documentation DRY (Don't Repeat Yourself)**:
   - Avoid duplicating information
   - Link to existing documentation instead of copying
   - Use references to maintain consistency

5. **Use Visuals Effectively**:
   - Include diagrams, screenshots, and flowcharts
   - Use consistent visual style
   - Ensure visuals are accessible and understandable

## Documentation Checklist

Use this checklist to ensure documentation completeness:

### Code Documentation
- [ ] All public functions, classes, and modules have JSDoc comments
- [ ] Complex algorithms and business logic are explained
- [ ] Edge cases and limitations are documented
- [ ] Examples are provided for non-trivial functionality

### API Documentation
- [ ] All endpoints are documented with OpenAPI/Swagger
- [ ] Request and response formats are specified
- [ ] Authentication requirements are documented
- [ ] Error responses and codes are documented
- [ ] Examples are provided for each endpoint

### Technical Documentation
- [ ] System architecture is documented with diagrams
- [ ] Component interactions are explained
- [ ] Data flow is documented
- [ ] Design decisions and rationale are documented
- [ ] Dependencies and integrations are documented

### User Documentation
- [ ] User manuals cover all functionality
- [ ] Step-by-step tutorials for common tasks
- [ ] Screenshots and visual aids are included
- [ ] Troubleshooting guidance is provided
- [ ] Documentation is written in user-friendly language

## Additional Resources

- [Google Developer Documentation Style Guide](https://developers.google.com/style)
- [Write the Docs](https://www.writethedocs.org/)
- [JSDoc Documentation](https://jsdoc.app/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Markdown Guide](https://www.markdownguide.org/)