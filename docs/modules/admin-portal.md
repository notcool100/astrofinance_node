# Admin Portal Module

## Overview
The Admin Portal module provides the administrative interface for the Financial Management System. It includes authentication, dashboard, and role-based access control features.

## Submodules

### 1. Authentication

#### Features
- **Admin Login**
  - Secure login form with username/email and password
  - Password encryption and security measures
  - Session management
  - Remember me functionality
  - Password reset capability

#### Technical Implementation
- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting for failed login attempts
- Session timeout configuration

### 2. Dashboard

#### Features
- **Overview Dashboard**
  - Key metrics display (total users, pending loans, etc.)
  - Quick action buttons
  - Recent activity feed
  - System status indicators
  
- **Analytics Dashboard**
  - User growth charts
  - Loan disbursement trends
  - Collection efficiency metrics
  - Financial performance indicators

#### Technical Implementation
- Real-time data fetching with React Query
- Interactive charts with Chart.js
- Responsive layout for all device sizes
- Customizable widgets based on admin role

### 3. Role-Based Access Control

#### Features
- **User Roles Management**
  - Create and manage role definitions
  - Assign permissions to roles
  - Role assignment to admin users
  
- **Permission Management**
  - Granular permission settings
  - Module-level access control
  - Action-level permissions (view, create, edit, delete)

#### Technical Implementation
- Role-based middleware for API endpoints
- Permission checking on frontend components
- Hierarchical role structure
- Audit logging for permission changes

### 4. Navigation Management

#### Features
- **Menu Builder**
  - Create and manage navigation menu structure
  - Drag-and-drop interface for menu organization
  - Icon and label customization
  - Menu item visibility control
  
- **Role-Based Navigation**
  - Assign navigation items to specific roles
  - Dynamic menu rendering based on user role
  - Permission-based menu item visibility
  - Navigation item ordering and grouping

#### Technical Implementation
- Database-driven navigation system
- Dynamic menu component with React
- Navigation caching for performance
- Real-time navigation updates
- Integration with role and permission system

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `POST /api/auth/reset-password` - Password reset request
- `PUT /api/auth/reset-password` - Password reset confirmation

### Dashboard
- `GET /api/dashboard/metrics` - Fetch dashboard metrics
- `GET /api/dashboard/recent-activity` - Get recent system activity
- `GET /api/dashboard/analytics` - Fetch analytics data

### Role Management
- `GET /api/roles` - List all roles
- `POST /api/roles` - Create new role
- `GET /api/roles/:id` - Get role details
- `PUT /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role
- `GET /api/permissions` - List all permissions
- `PUT /api/roles/:id/permissions` - Update role permissions

### Navigation Management
- `GET /api/navigation` - Get all navigation items
- `POST /api/navigation` - Create new navigation item
- `GET /api/navigation/:id` - Get navigation item details
- `PUT /api/navigation/:id` - Update navigation item
- `DELETE /api/navigation/:id` - Delete navigation item
- `GET /api/navigation/structure` - Get complete navigation structure
- `GET /api/navigation/user` - Get navigation for current user
- `GET /api/navigation/groups` - Get all navigation groups
- `POST /api/navigation/groups` - Create new navigation group
- `PUT /api/navigation/groups/:id` - Update navigation group
- `DELETE /api/navigation/groups/:id` - Delete navigation group
- `PUT /api/navigation/order` - Update navigation item order
- `PUT /api/roles/:id/navigation` - Assign navigation items to role

## Database Schema

### Admin Users Model
```prisma
model AdminUser {
  id          String      @id @default(uuid())
  username    String      @unique
  email       String      @unique
  passwordHash String
  fullName    String
  isActive    Boolean     @default(true)
  lastLogin   DateTime?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  // Relations
  roles       AdminUserRole[]

  @@map("admin_users")
}
```

### Roles and Permissions Models
```prisma
model Role {
  id          String      @id @default(uuid())
  name        String      @unique
  description String?
  isSystem    Boolean     @default(false)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  // Relations
  permissions RolePermission[]
  adminUsers  AdminUserRole[]
  navigation  RoleNavigation[]

  @@map("roles")
}

model Permission {
  id          String      @id @default(uuid())
  code        String      @unique
  description String?
  module      String
  action      String
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  // Relations
  rolePermissions RolePermission[]

  @@map("permissions")
}

model RolePermission {
  id           String     @id @default(uuid())
  roleId       String
  permissionId String
  createdAt    DateTime   @default(now())

  // Relations
  role         Role       @relation(fields: [roleId], references: [id])
  permission   Permission @relation(fields: [permissionId], references: [id])

  @@unique([roleId, permissionId])
  @@map("role_permissions")
}

model AdminUserRole {
  id          String     @id @default(uuid())
  adminUserId String
  roleId      String
  createdAt   DateTime   @default(now())

  // Relations
  adminUser   AdminUser  @relation(fields: [adminUserId], references: [id])
  role        Role       @relation(fields: [roleId], references: [id])

  @@unique([adminUserId, roleId])
  @@map("admin_user_roles")
}
```

### Navigation Models
```prisma
model NavigationItem {
  id          String      @id @default(uuid())
  label       String
  icon        String?
  url         String?
  order       Int
  parentId    String?
  groupId     String?
  isActive    Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  // Relations
  parent      NavigationItem?  @relation("NavigationItemToNavigationItem", fields: [parentId], references: [id])
  children    NavigationItem[] @relation("NavigationItemToNavigationItem")
  group       NavigationGroup? @relation(fields: [groupId], references: [id])
  roleNavigation RoleNavigation[]

  @@map("navigation_items")
}

model NavigationGroup {
  id          String      @id @default(uuid())
  name        String      @unique
  description String?
  order       Int
  isActive    Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  // Relations
  navigationItems NavigationItem[]

  @@map("navigation_groups")
}

model RoleNavigation {
  id              String      @id @default(uuid())
  roleId          String
  navigationItemId String
  createdAt       DateTime    @default(now())

  // Relations
  role            Role        @relation(fields: [roleId], references: [id])
  navigationItem  NavigationItem @relation(fields: [navigationItemId], references: [id])

  @@unique([roleId, navigationItemId])
  @@map("role_navigation")
}
```

## UI Components

### Login Page
- Login form with validation
- Forgot password link
- Error message display
- Loading state indicators

### Dashboard
- Header with user profile and logout
- Sidebar navigation (database-driven)
- Main content area with widgets
- Responsive design for all screen sizes

### Role Management
- Role listing table
- Role creation/edit form
- Permission assignment interface
- User role assignment interface

### Navigation Management
- Navigation builder with drag-and-drop interface
- Navigation item form with icon picker
- Navigation group management
- Navigation preview
- Role-based navigation assignment interface

## Development Tasks

### Frontend Tasks
1. Create login page with form validation
2. Implement dashboard layout and dynamic navigation
3. Design and implement dashboard widgets
4. Create role management interfaces
5. Implement permission assignment UI
6. Add user role assignment functionality
7. Create analytics dashboard with charts
8. Develop navigation builder interface
9. Implement navigation preview component
10. Create navigation role assignment UI

### Backend Tasks
1. Implement authentication API endpoints
2. Create JWT token generation and validation
3. Develop dashboard data aggregation services
4. Implement role and permission management APIs
5. Create middleware for role-based access control
6. Implement audit logging for admin actions
7. Develop analytics data processing services
8. Create navigation management API endpoints
9. Implement dynamic navigation retrieval based on user role
10. Develop navigation caching mechanism

## Testing Strategy

### Unit Tests
- Authentication service tests
- Permission checking logic tests
- Dashboard data calculation tests
- Navigation structure generation tests
- Role-based navigation filtering tests

### Integration Tests
- API endpoint tests for all admin portal functions
- Role-based access control tests
- Authentication flow tests
- Navigation API endpoint tests
- Dynamic navigation retrieval tests

### UI Tests
- Login form validation tests
- Dashboard rendering tests
- Role management interface tests
- Navigation builder interface tests
- Dynamic navigation rendering tests

## Dependencies

### Frontend
- Next.js
- React Query
- Chart.js
- React Hook Form
- TailwindCSS
- React DnD (for drag-and-drop navigation builder)
- React Icons

### Backend
- Express.js
- Passport.js
- JWT
- bcrypt
- Prisma ORM
- Redis (for navigation caching)