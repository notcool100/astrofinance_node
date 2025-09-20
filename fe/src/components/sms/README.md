# SMS Template System

A comprehensive WYSIWYG (What You See Is What You Get) SMS template editor with dynamic placeholders for the AstroFinance application.

## Features

### 🎯 Dynamic Variables
- **Placeholder System**: Use `{{variableName}}` syntax for dynamic content
- **Category-based Variables**: Different variable sets for different message types
- **Real-time Preview**: See how your message looks with sample data
- **Variable Management**: Add, remove, and manage variables easily

### 📱 Template Categories
- **Account**: User account related messages
- **Transaction**: Deposit, withdrawal, and transfer notifications
- **Loan**: Loan approval, EMI reminders, payment confirmations
- **Marketing**: Promotional messages and offers
- **System**: System notifications and alerts

### 🛠️ Editor Features
- **WYSIWYG Interface**: Visual editing with live preview
- **Character Counting**: Track message length and SMS segments
- **Variable Panel**: Easy insertion of dynamic placeholders
- **Template Configuration**: Name, category, and event association
- **Test SMS**: Send test messages to verify templates

## Components

### SmsTemplateEditor
The main editor component for creating and editing SMS templates.

```tsx
<SmsTemplateEditor
  initialContent="Dear {{name}}, your account {{accountNumber}}..."
  initialVariables={{ name: 'User Name', accountNumber: 'Account Number' }}
  onSave={(data) => console.log(data)}
  categories={['Account', 'Transaction', 'Loan']}
  smsEvents={smsEvents}
/>
```

### SmsTemplatePreview
Preview component showing how the template looks with sample data.

```tsx
<SmsTemplatePreview
  content="Dear {{name}}, your balance is {{balance}}."
  variables={{ name: 'User Name', balance: 'Balance' }}
  onSendTest={(phone, vars) => sendTestSMS(phone, vars)}
/>
```

## Usage Examples

### Creating a Deposit Confirmation Template

1. **Select Category**: Choose "Transaction"
2. **Add Variables**: Insert `{{name}}`, `{{amount}}`, `{{balance}}`, `{{date}}`
3. **Write Message**: "Dear {{name}}, your account has been credited with Rs. {{amount}} on {{date}}. Available balance: Rs. {{balance}}."
4. **Preview**: See how it looks with sample data
5. **Test**: Send a test SMS to verify

### Creating a Loan EMI Reminder

1. **Select Category**: Choose "Loan"
2. **Add Variables**: Insert `{{name}}`, `{{emiAmount}}`, `{{dueDate}}`, `{{loanNumber}}`
3. **Write Message**: "Dear {{name}}, your EMI of Rs. {{emiAmount}} for loan {{loanNumber}} is due on {{dueDate}}. Please ensure timely payment."
4. **Preview & Test**: Verify the message format

## Variable Reference

### Account Variables
- `{{name}}` - User Name
- `{{accountNumber}}` - Account Number
- `{{balance}}` - Account Balance
- `{{date}}` - Current Date
- `{{time}}` - Current Time

### Transaction Variables
- `{{name}}` - User Name
- `{{accountNumber}}` - Account Number
- `{{amount}}` - Transaction Amount
- `{{balance}}` - Balance After Transaction
- `{{date}}` - Transaction Date
- `{{time}}` - Transaction Time
- `{{transactionType}}` - Type of Transaction

### Loan Variables
- `{{name}}` - User Name
- `{{loanNumber}}` - Loan Number
- `{{amount}}` - Loan Amount
- `{{emiAmount}}` - EMI Amount
- `{{dueDate}}` - EMI Due Date
- `{{applicationNumber}}` - Application Number
- `{{interestRate}}` - Interest Rate
- `{{tenure}}` - Loan Tenure

## API Integration

The system integrates with the backend SMS API:

```typescript
// Create template
await createSmsTemplate({
  name: 'Deposit Confirmation',
  content: 'Dear {{name}}, your account {{accountNumber}}...',
  variables: { name: 'User Name', accountNumber: 'Account Number' },
  category: 'Transaction',
  isActive: true
});

// Send test SMS
await sendTestSms({
  to: '+977-XXXXXXXXX',
  templateId: 'template-id',
  variables: { name: 'John Doe', amount: '5000' }
});
```

## File Structure

```
src/components/sms/
├── SmsTemplateEditor.tsx    # Main editor component
├── SmsTemplatePreview.tsx   # Preview component
└── README.md               # This documentation

src/pages/admin/sms/
├── index.tsx               # Template list page
├── new.tsx                 # Create template page
├── demo.tsx                # Demo page
└── [id]/
    ├── index.tsx           # Template detail page
    └── edit.tsx            # Edit template page
```

## Best Practices

1. **Keep Messages Concise**: SMS has character limits
2. **Use Clear Variable Names**: Make variable purposes obvious
3. **Test Before Deploying**: Always send test SMS
4. **Categorize Properly**: Use appropriate categories for organization
5. **Preview Regularly**: Check how messages look with sample data

## Character Limits

- **Single SMS**: 160 characters
- **Concatenated SMS**: 153 characters per segment
- **Unicode Support**: Full Unicode character support
- **Auto-counting**: Real-time character and SMS count display
