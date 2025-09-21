# AstroFinance Frontend Implementation Guide

## Overview

This document provides a comprehensive guide to the AstroFinance frontend implementation. The frontend is built using Next.js with TypeScript, following modern best practices for React development.

## Project Structure

The frontend follows a modular architecture with the following key components:

```
/fe
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── common/         # Common UI elements
│   │   ├── forms/          # Form components
│   │   ├── layout/         # Layout components
│   │   └── modules/        # Module-specific components
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Next.js pages
│   ├── services/           # API services
│   ├── styles/             # Global styles
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
```

## Key Features Implemented

### Authentication System

- JWT-based authentication
- User and admin login flows
- Registration for new users
- Protected routes for authenticated users
- Role-based access control (admin vs regular users)

### Loan Management

- Loan calculator with amortization schedule
- Loan application form and workflow
- Loan listing and details view
- Payment tracking and management
- Loan settlement calculation

### User Profile Management

- Profile information editing
- Password management
- Account information display
- Notification preferences

## Pages Implemented

1. **Authentication**
   - `/login` - User and admin login
   - `/register` - New user registration

2. **User Pages**
   - `/dashboard` - User dashboard
   - `/calculator` - Loan calculator
   - `/profile` - User profile management
   - `/loans` - Loan management
   - `/loans/apply` - Loan application
   - `/loans/applications` - Loan applications list
   - `/loans/[id]` - Loan details
   - `/loans/[id]/payments` - Loan payments

3. **Admin Pages**
   - `/admin/dashboard` - Admin dashboard (placeholder)

## Components Implemented

### Common Components

- `Button` - Reusable button component with variants and loading state
- `Card` - Content card component with optional header and footer
- `Badge` - Status badge component with different variants
- `Table` - Data table with sorting and pagination
- `ProtectedRoute` - Authentication wrapper for protected pages

### Form Components

- `LoginForm` - Authentication form
- `ProfileForm` - User profile editing form
- `PasswordChangeForm` - Password change form
- `LoanApplicationForm` - Loan application form

### Module Components

- `LoanCalculator` - Interactive loan calculator with amortization schedule

## Services

- `apiService` - Base API service with Axios
- `authService` - Authentication service
- `loanService` - Loan management service

## State Management

- React Context for global state (auth)
- React Query for server state
- Local state for component-specific state

## Styling

The frontend uses Tailwind CSS for styling with a custom theme. The theme includes:

- Custom color palette
- Responsive design
- Form styling
- Component-specific styles

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Access the application:
   Open your browser and navigate to `http://localhost:3000`

## Environment Variables

Create a `.env.local` file with the following variables:

```
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_APP_NAME=AstroFinance
```

## Development Guidelines

1. **Component Structure**
   - Use functional components with hooks
   - Keep components small and focused
   - Use TypeScript interfaces for props

2. **State Management**
   - Use React Query for API data
   - Use Context for global state
   - Use local state for component-specific state

3. **Styling**
   - Use Tailwind utility classes
   - Use component classes for complex components
   - Follow the design system

4. **Form Handling**
   - Use React Hook Form for form state
   - Use Yup for validation
   - Handle errors consistently

5. **API Integration**
   - Use services for API calls
   - Handle loading and error states
   - Use React Query for caching and refetching

## Future Enhancements

1. **Complete Module Implementation**
   - Implement remaining pages and components for all modules
   - Add more interactive features to the dashboard

2. **Performance Optimizations**
   - Implement code splitting
   - Add more caching strategies

3. **Testing**
   - Add unit tests for components
   - Add integration tests for key flows

4. **Accessibility**
   - Enhance keyboard navigation
   - Improve screen reader support

## Conclusion

The AstroFinance frontend provides a comprehensive user interface for the microfinance management system. The modular architecture allows for easy extension and maintenance as the application grows.