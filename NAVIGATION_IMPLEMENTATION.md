# Dynamic Navigation Implementation

## Overview

We've implemented a dynamic navigation system that fetches navigation items from the database based on user roles and permissions. This allows for a more flexible and maintainable navigation structure that can be managed through the admin interface.

## Database Schema

The navigation system uses the following database tables:

1. **NavigationItem**: Stores individual navigation items with properties like label, icon, URL, and order.
2. **NavigationGroup**: Groups navigation items into categories.
3. **RoleNavigation**: Maps navigation items to roles, controlling which users can see which items.
4. **Role**: Defines user roles with associated permissions.
5. **Permission**: Defines granular permissions for system actions.

## Backend Implementation

### Navigation Service

Created a service (`navigation.service.ts`) that:
- Fetches navigation items for a user based on their roles
- Organizes items into a hierarchical structure
- Handles parent-child relationships between navigation items
- Retrieves user permissions based on their roles

### Navigation Controller

Implemented a controller (`navigation.controller.ts`) with endpoints for:
- Getting navigation items for the current user
- Admin functions for managing navigation items:
  - Getting all navigation items
  - Getting all navigation groups
  - Creating new navigation items
  - Updating existing navigation items
  - Deleting navigation items
  - Assigning navigation items to roles

### Authentication Controller

Updated the authentication controller to:
- Include navigation items in the login response
- Include permissions in the login response
- Use the navigation service to fetch user-specific navigation

### Routes

Added new routes for navigation management:
- `/office/navigation` - Get navigation for current user
- `/office/admin/navigation/items` - Admin management of navigation items
- `/office/admin/navigation/groups` - Admin management of navigation groups
- `/office/admin/roles/:roleId/navigation` - Assign navigation to roles

### Validation

Created validation schemas for navigation-related requests:
- `createNavigationItemSchema` - Validates navigation item creation
- `updateNavigationItemSchema` - Validates navigation item updates
- `assignNavigationToRoleSchema` - Validates navigation assignment to roles

## Frontend Implementation

### Navigation Service

Created a service (`navigation.service.ts`) that:
- Fetches navigation items from the API
- Provides functions for admin management of navigation

### Dynamic Navigation Component

Updated the `DynamicNavigation` component to:
- Use navigation data from the API instead of hardcoded items
- Map icon names from the database to Heroicons components
- Handle missing or invalid navigation data with fallbacks
- Support nested navigation items
- Automatically determine the "current" state based on the active route

### Authentication Context

Updated the authentication context to:
- Store navigation items from the login response
- Provide navigation items to components
- Check user permissions based on the permissions array

## Benefits

1. **Centralized Management**: Navigation can be managed through the admin interface without code changes
2. **Role-Based Access**: Navigation items are shown based on user roles and permissions
3. **Flexible Structure**: Support for nested navigation and grouping
4. **Maintainable Code**: No hardcoded navigation items in the frontend
5. **Consistent UI**: Navigation follows the same structure and styling across the application

## Next Steps

1. **Admin Interface**: Create a UI for managing navigation items and groups
2. **Drag-and-Drop Ordering**: Add the ability to reorder navigation items visually
3. **Navigation Preview**: Allow admins to preview navigation changes before saving
4. **Navigation Templates**: Create predefined navigation templates for common user roles
5. **Navigation Analytics**: Track which navigation items are used most frequently