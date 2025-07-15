# SMS Notifications Module

## Overview
The SMS Notifications module enables automated communication with clients through SMS messages. It handles various notification types, template management, delivery tracking, and integration with SMS gateways.

## Submodules

### 1. SMS Gateway Integration

#### Features
- **Gateway Configuration**
  - API key and credentials management
  - Sender ID configuration
  - Rate limiting settings
  - Fallback gateway options
  
- **Message Routing**
  - Gateway selection logic
  - Load balancing
  - Failover handling
  - Message prioritization

#### Technical Implementation
- Adapter pattern for multiple gateway support
  - Supports common SMS gateways in Nepal
  - Pluggable architecture for new gateways
- Secure credential storage
- Health check monitoring

### 2. Notification Templates

#### Features
- **Template Management**
  - Create and edit message templates
  - Variable placeholders
  - Character count and preview
  - Language variants
  
- **Template Categories**
  - Account notifications
  - Loan notifications
  - Transaction alerts
  - Marketing messages
  - System alerts

#### Technical Implementation
- Template engine with variable substitution
- Character counting with Unicode support
- Template versioning
- Template testing functionality

### 3. Event-Based Notifications

#### Features
- **Event Configuration**
  - Event type definition
  - Notification trigger rules
  - Schedule and timing options
  - User preference integration
  
- **Common Events**
  - Account creation
  - Deposit/withdrawal
  - Loan approval/rejection
  - EMI due reminder
  - Payment confirmation
  - Account statement

#### Technical Implementation
- Event listener architecture
- Rule-based notification triggering
- Scheduled notification queuing
- User preference checking

### 4. Notification Tracking

#### Features
- **Delivery Monitoring**
  - Message status tracking
  - Delivery receipts
  - Failure handling
  - Retry mechanism
  
- **Notification History**
  - Message log retention
  - Search and filtering
  - Analytics and reporting
  - Cost tracking

#### Technical Implementation
- Asynchronous status updates
- Webhook handlers for delivery receipts
- Logging and archiving strategy
- Analytics data aggregation

## API Endpoints

### SMS Gateway Configuration
- `GET /api/sms/gateways` - List available gateways
- `GET /api/sms/gateways/:id` - Get gateway configuration
- `PUT /api/sms/gateways/:id` - Update gateway configuration
- `POST /api/sms/gateways/:id/test` - Test gateway connection

### Notification Templates
- `GET /api/sms/templates` - List all templates
- `POST /api/sms/templates` - Create new template
- `GET /api/sms/templates/:id` - Get template details
- `PUT /api/sms/templates/:id` - Update template
- `DELETE /api/sms/templates/:id` - Delete template
- `POST /api/sms/templates/:id/test` - Test template with sample data

### Notification Events
- `GET /api/sms/events` - List notification events
- `PUT /api/sms/events/:id` - Update event configuration
- `GET /api/sms/events/:id/history` - Get event notification history

### Notification Management
- `POST /api/sms/send` - Send manual notification
- `GET /api/sms/logs` - Get notification logs
- `GET /api/sms/stats` - Get notification statistics

## Database Schema

### SMS Gateways Table
```sql
CREATE TABLE sms_gateways (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  provider VARCHAR(100) NOT NULL,
  api_url VARCHAR(255) NOT NULL,
  api_key VARCHAR(255),
  sender_id VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### SMS Templates Table
```sql
CREATE TABLE sms_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  variables JSONB,
  character_count INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### SMS Events Table
```sql
CREATE TABLE sms_events (
  id SERIAL PRIMARY KEY,
  event_code VARCHAR(100) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  template_id INTEGER REFERENCES sms_templates(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### SMS Logs Table
```sql
CREATE TABLE sms_logs (
  id SERIAL PRIMARY KEY,
  recipient VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  event_id INTEGER REFERENCES sms_events(id),
  template_id INTEGER REFERENCES sms_templates(id),
  gateway_id INTEGER REFERENCES sms_gateways(id),
  message_id VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending', -- pending, sent, delivered, failed
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### User Notification Preferences Table
```sql
CREATE TABLE user_notification_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  event_id INTEGER REFERENCES sms_events(id),
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, event_id)
);
```

## UI Components

### SMS Gateway Configuration
- Gateway configuration form
- Gateway status indicator
- Test connection interface
- Gateway priority management

### Template Management
- Template editor with variable highlighting
- Character counter
- Template preview
- Template testing interface

### Event Configuration
- Event listing with status toggles
- Event-template assignment interface
- Event trigger rules configuration
- Schedule configuration

### Notification Logs
- Log listing with filters
- Status indicators
- Retry controls
- Analytics dashboard

## Development Tasks

### Frontend Tasks
1. Create SMS gateway configuration interface
2. Implement template editor with variable support
3. Design event configuration screens
4. Build notification log viewer
5. Create notification analytics dashboard
6. Implement template testing functionality
7. Design responsive layouts for all screens

### Backend Tasks
1. Develop SMS gateway integration adapters
2. Implement template engine with variable substitution
3. Create event listener system
4. Develop notification queuing and sending service
5. Implement delivery status tracking
6. Create notification analytics service
7. Develop retry mechanism for failed messages

## Testing Strategy

### Unit Tests
- Template variable substitution tests
- Gateway adapter tests
- Event triggering logic tests

### Integration Tests
- End-to-end notification flow tests
- Gateway communication tests
- Retry mechanism tests

### UI Tests
- Template editor functionality tests
- Configuration form validation tests
- Log viewer filtering tests

## Dependencies

### Frontend
- React Hook Form for configuration forms
- React Query for data fetching
- Chart.js for notification analytics
- React Table for logs display

### Backend
- SMS gateway client libraries
- Queue management system
- Template engine
- Scheduled task manager