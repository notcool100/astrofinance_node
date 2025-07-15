# Staff Management Module

## Overview

The Staff Management module provides comprehensive functionality for managing staff members of the microfinance institution. It handles staff registration, role assignment, permission management, performance tracking, and attendance management.

## Submodules and Features

### 1. Staff Registration

**Description**: Manages the registration and onboarding of new staff members.

**Features**:
- Staff profile creation with personal and professional details
- Document upload and verification
- Employment history tracking
- Educational qualification management
- Staff ID generation
- Contract and agreement management

**Technical Implementation**:
- Form-based staff registration with multi-step wizard
- Document upload with validation and virus scanning
- Secure storage of staff documents
- Automated ID generation with configurable formats

### 2. Role Assignment

**Description**: Manages the assignment of roles to staff members.

**Features**:
- Predefined role templates (Manager, Loan Officer, Accountant, etc.)
- Custom role creation
- Role hierarchy management
- Role-based access control
- Role assignment history tracking
- Temporary role assignment (for leave coverage)

**Technical Implementation**:
- Role management interface with drag-and-drop capabilities
- Role hierarchy visualization
- Integration with permission system
- Audit logging for role changes

### 3. Permission Management

**Description**: Manages the permissions assigned to roles and individual staff members.

**Features**:
- Granular permission system
- Module-level permissions
- Action-level permissions (Create, Read, Update, Delete)
- Permission inheritance
- Permission override for specific staff
- Permission audit trail

**Technical Implementation**:
- Permission matrix interface
- Tree-based permission structure
- Database-driven permission system
- Integration with navigation system

### 4. Staff Performance Tracking

**Description**: Tracks and evaluates staff performance.

**Features**:
- Key Performance Indicator (KPI) definition
- Performance goal setting
- Performance review scheduling
- Performance evaluation forms
- Performance history tracking
- Performance analytics and reporting

**Technical Implementation**:
- Configurable KPI framework
- Automated performance review notifications
- Multi-level approval workflow for evaluations
- Performance dashboards with visualizations

### 5. Attendance Management

**Description**: Manages staff attendance and leave.

**Features**:
- Daily attendance tracking
- Leave application and approval
- Leave balance management
- Holiday calendar management
- Overtime tracking
- Attendance reporting

**Technical Implementation**:
- Calendar-based attendance interface
- Leave application workflow
- Integration with payroll system (if applicable)
- Automated leave balance calculation

## Database Schema

### Staff Table

```prisma
model Staff {
  id                String      @id @default(uuid())
  employeeId        String      @unique
  firstName         String
  lastName          String
  email             String      @unique
  phone             String
  address           String
  dateOfBirth       DateTime
  joinDate          DateTime
  department        String
  position          String
  status            StaffStatus @default(ACTIVE)
  profileImage      String?
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  // Relations
  roles             StaffRole[]
  documents         StaffDocument[]
  performanceReviews PerformanceReview[]
  attendance        Attendance[]
  leaves            Leave[]

  @@map("staff")
}

enum StaffStatus {
  ACTIVE
  INACTIVE
  ON_LEAVE
  TERMINATED
}
```

### Role and Permission Tables

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
  staffRoles  StaffRole[]
  navigation  RoleNavigation[]

  @@map("roles")
}

model Permission {
  id          String      @id @default(uuid())
  name        String      @unique
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

model StaffRole {
  id        String   @id @default(uuid())
  staffId   String
  roleId    String
  startDate DateTime @default(now())
  endDate   DateTime?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  staff     Staff    @relation(fields: [staffId], references: [id])
  role      Role     @relation(fields: [roleId], references: [id])

  @@map("staff_roles")
}
```

### Navigation Tables

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

### Performance and Attendance Tables

```prisma
model PerformanceReview {
  id              String      @id @default(uuid())
  staffId         String
  reviewerId      String
  reviewPeriodStart DateTime
  reviewPeriodEnd DateTime
  overallRating   Float
  strengths       String?
  areasToImprove  String?
  goals           String?
  comments        String?
  status          ReviewStatus @default(DRAFT)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  // Relations
  staff           Staff       @relation(fields: [staffId], references: [id])

  @@map("performance_reviews")
}

enum ReviewStatus {
  DRAFT
  SUBMITTED
  APPROVED
  REJECTED
}

model Attendance {
  id              String      @id @default(uuid())
  staffId         String
  date            DateTime
  checkIn         DateTime?
  checkOut        DateTime?
  status          AttendanceStatus
  comments        String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  // Relations
  staff           Staff       @relation(fields: [staffId], references: [id])

  @@unique([staffId, date])
  @@map("attendance")
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  HALF_DAY
  LATE
  ON_LEAVE
  HOLIDAY
}

model Leave {
  id              String      @id @default(uuid())
  staffId         String
  leaveType       LeaveType
  startDate       DateTime
  endDate         DateTime
  reason          String
  status          LeaveStatus @default(PENDING)
  approvedById    String?
  approvedAt      DateTime?
  comments        String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  // Relations
  staff           Staff       @relation(fields: [staffId], references: [id])

  @@map("leaves")
}

enum LeaveType {
  ANNUAL
  SICK
  MATERNITY
  PATERNITY
  UNPAID
  OTHER
}

enum LeaveStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED
}
```

## API Endpoints

### Staff Management

```
GET    /api/staff                - Get all staff members (with pagination)
POST   /api/staff                - Create a new staff member
GET    /api/staff/:id            - Get staff member by ID
PUT    /api/staff/:id            - Update staff member
DELETE /api/staff/:id            - Delete staff member (soft delete)
GET    /api/staff/search         - Search staff members
```

### Role Management

```
GET    /api/roles                - Get all roles
POST   /api/roles                - Create a new role
GET    /api/roles/:id            - Get role by ID
PUT    /api/roles/:id            - Update role
DELETE /api/roles/:id            - Delete role
GET    /api/roles/:id/permissions - Get permissions for a role
POST   /api/roles/:id/permissions - Assign permissions to a role
DELETE /api/roles/:id/permissions/:permissionId - Remove permission from role
```

### Staff Roles

```
GET    /api/staff/:id/roles      - Get roles for a staff member
POST   /api/staff/:id/roles      - Assign role to staff member
DELETE /api/staff/:id/roles/:roleId - Remove role from staff member
```

### Navigation Management

```
GET    /api/navigation           - Get navigation structure
GET    /api/navigation/user      - Get navigation for current user
POST   /api/navigation           - Create navigation item
PUT    /api/navigation/:id       - Update navigation item
DELETE /api/navigation/:id       - Delete navigation item
GET    /api/navigation/groups    - Get navigation groups
POST   /api/navigation/groups    - Create navigation group
```

### Performance Management

```
GET    /api/performance          - Get all performance reviews
POST   /api/performance          - Create a new performance review
GET    /api/performance/:id      - Get performance review by ID
PUT    /api/performance/:id      - Update performance review
GET    /api/staff/:id/performance - Get performance reviews for a staff member
```

### Attendance Management

```
GET    /api/attendance           - Get attendance records (with filters)
POST   /api/attendance           - Create attendance record
GET    /api/attendance/:id       - Get attendance record by ID
PUT    /api/attendance/:id       - Update attendance record
GET    /api/staff/:id/attendance - Get attendance for a staff member
POST   /api/attendance/bulk      - Create bulk attendance records
```

### Leave Management

```
GET    /api/leaves               - Get leave applications
POST   /api/leaves               - Create leave application
GET    /api/leaves/:id           - Get leave application by ID
PUT    /api/leaves/:id           - Update leave application
PUT    /api/leaves/:id/approve   - Approve leave application
PUT    /api/leaves/:id/reject    - Reject leave application
GET    /api/staff/:id/leaves     - Get leave applications for a staff member
```

## Frontend Components

### Staff Management

- StaffList: Displays a list of staff members with filtering and sorting
- StaffForm: Form for creating and editing staff members
- StaffProfile: Displays staff profile information
- StaffDocuments: Manages staff documents
- StaffRoles: Manages roles assigned to staff

### Role Management

- RoleList: Displays a list of roles
- RoleForm: Form for creating and editing roles
- RolePermissions: Manages permissions for a role
- PermissionMatrix: Visual matrix for managing role permissions

### Navigation Management

- NavigationBuilder: Interface for building navigation structure
- NavigationPreview: Preview of navigation structure
- NavigationItemForm: Form for creating and editing navigation items
- NavigationGroupForm: Form for creating and editing navigation groups

### Performance Management

- PerformanceReviewList: Displays a list of performance reviews
- PerformanceReviewForm: Form for creating and editing performance reviews
- PerformanceDashboard: Dashboard showing performance metrics
- KPITracker: Tracks KPIs for staff members

### Attendance Management

- AttendanceCalendar: Calendar view of attendance
- AttendanceForm: Form for recording attendance
- AttendanceSummary: Summary of attendance statistics
- BulkAttendance: Interface for recording bulk attendance

### Leave Management

- LeaveCalendar: Calendar view of leave
- LeaveApplicationForm: Form for applying for leave
- LeaveApproval: Interface for approving/rejecting leave applications
- LeaveBalance: Displays leave balance for staff members

## Integration Points

- **User Management**: Staff members may have corresponding user accounts
- **Admin Portal**: Staff management is accessible through the admin portal
- **Loan Module**: Loan officers are staff members with specific roles
- **Accounting**: Staff payroll may integrate with the accounting module
- **Notification**: Staff receive notifications for various events
- **Report Generation**: Staff performance and attendance reports

## Security Considerations

- Role-based access control for staff management
- Audit logging for all staff-related actions
- Secure storage of staff documents
- Permission validation for all API endpoints
- Data encryption for sensitive staff information

## Development Tasks

1. **Database Schema**
   - Design and implement staff-related tables
   - Create navigation tables
   - Set up role and permission tables

2. **Backend Implementation**
   - Create staff module structure
   - Implement staff CRUD operations
   - Develop role and permission management
   - Build navigation management API
   - Implement performance tracking
   - Develop attendance and leave management

3. **Frontend Implementation**
   - Create staff management interface
   - Build role and permission UI
   - Develop navigation builder
   - Implement performance review forms
   - Create attendance and leave interfaces

4. **Testing**
   - Unit tests for staff services
   - Integration tests for staff API
   - UI tests for staff management interface
   - Performance testing for navigation loading

5. **Documentation**
   - API documentation
   - User guide for staff management
   - Administrator guide for role management