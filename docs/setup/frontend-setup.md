# Frontend Setup Guide

## Overview
This guide provides instructions for setting up the frontend development environment for the Financial Management System. The frontend is built using Next.js with TypeScript.

## Prerequisites
- Node.js (v16.x or later)
- npm (v8.x or later) or yarn (v1.22.x or later)
- Git

## Directory Structure
The frontend code is located in the `/fe` directory with the following structure:

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
├── .eslintrc.js            # ESLint configuration
├── .prettierrc             # Prettier configuration
├── next.config.js          # Next.js configuration
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## Installation

1. Navigate to the frontend directory:
   ```bash
   cd /home/notcool/Desktop/astrofinanceNew/fe
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

## Configuration

1. Create environment files:

   Create a `.env.local` file in the `/fe` directory with the following variables:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   NEXT_PUBLIC_APP_NAME=Financial Management System
   ```

2. Configure API services:

   Update the base URL in `/fe/src/services/api.ts` if needed.

## Development

1. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. Access the application:
   Open your browser and navigate to `http://localhost:3000`

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

### Type Checking
Run TypeScript compiler to check for type errors:
```bash
npm run type-check
# or
yarn type-check
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

## Key Dependencies

- **Next.js**: React framework for server-rendered applications
- **React**: UI library
- **TypeScript**: Static type checking
- **Tailwind CSS**: Utility-first CSS framework
- **React Query**: Data fetching and state management
- **React Hook Form**: Form handling
- **Axios**: HTTP client
- **Jest & React Testing Library**: Testing framework
- **ESLint & Prettier**: Code quality and formatting

## Folder Structure Guidelines

### Components
- Place reusable UI components in `/src/components`
- Module-specific components should go in `/src/components/modules/{module-name}`
- Common UI elements (buttons, inputs, etc.) should go in `/src/components/common`

### Pages
- Create Next.js pages in `/src/pages`
- Follow the Next.js routing convention
- Use dynamic routes for parameterized pages

### Services
- API service functions should be in `/src/services`
- Group services by module or feature

### Styles
- Global styles in `/src/styles`
- Component-specific styles should be co-located with components
- Use Tailwind CSS utility classes for styling

## Best Practices

1. **TypeScript**:
   - Define interfaces for all props and state
   - Use proper type annotations for functions
   - Avoid using `any` type

2. **Components**:
   - Use functional components with hooks
   - Keep components small and focused
   - Use proper prop validation

3. **State Management**:
   - Use React Query for server state
   - Use React Context for global UI state
   - Use local state for component-specific state

4. **Performance**:
   - Use memoization (useMemo, useCallback) when appropriate
   - Implement proper loading states
   - Use Next.js Image component for optimized images

5. **Accessibility**:
   - Ensure proper semantic HTML
   - Include ARIA attributes when necessary
   - Test with keyboard navigation

## Troubleshooting

### Common Issues

1. **API Connection Issues**:
   - Verify the API URL in `.env.local`
   - Check if the backend server is running
   - Check for CORS issues

2. **Build Errors**:
   - Clear the `.next` directory and rebuild
   - Verify all dependencies are installed
   - Check for TypeScript errors

3. **Performance Issues**:
   - Use React DevTools to identify unnecessary re-renders
   - Check for memory leaks with useEffect cleanup
   - Optimize large lists with virtualization

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Query Documentation](https://react-query.tanstack.com/overview)