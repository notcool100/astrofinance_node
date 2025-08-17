import apiService from './api';

// Types
export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  description?: string;
  category: string;
  isPublic: boolean;
  isEncrypted: boolean;
  dataType: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON' | 'DATE' | 'EMAIL' | 'URL' | 'PHONE';
  validation?: string;
  createdAt: string;
  updatedAt: string;
  updatedBy?: {
    id: string;
    username: string;
    fullName: string;
  };
}

export interface SettingCategory {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  icon?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SettingAuditLog {
  id: string;
  settingId: string;
  oldValue?: string;
  newValue?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'PASSWORD_CHANGE' | 'PERMISSION_CHANGE' | 'APPROVE' | 'REJECT' | 'DISBURSE' | 'PAYMENT';
  reason?: string;
  changedById: string;
  changedAt: string;
  setting: {
    key: string;
    category: string;
  };
  changedBy: {
    id: string;
    username: string;
    fullName: string;
  };
}

export interface CreateSettingData {
  key: string;
  value: string;
  description?: string;
  category?: string;
  isPublic?: boolean;
  isEncrypted?: boolean;
  dataType?: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON' | 'DATE' | 'EMAIL' | 'URL' | 'PHONE';
  validation?: string;
}

export interface UpdateSettingData {
  value?: string;
  description?: string;
  category?: string;
  isPublic?: boolean;
  isEncrypted?: boolean;
  dataType?: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON' | 'DATE' | 'EMAIL' | 'URL' | 'PHONE';
  validation?: string;
}

export interface BulkUpdateSettingData {
  key: string;
  value?: string;
  description?: string;
}

export interface BulkUpdateRequest {
  settings: BulkUpdateSettingData[];
}

export interface BulkUpdateResult {
  key: string;
  success: boolean;
  error?: string;
}

export interface BulkUpdateResponse {
  results: BulkUpdateResult[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Settings API
export const getSettings = (params?: { 
  category?: string; 
  search?: string; 
  page?: number; 
  limit?: number; 
}) => 
  apiService.get<PaginatedResponse<SystemSetting>>('/admin/settings', params);

export const getSettingByKey = (key: string) => 
  apiService.get<SystemSetting>(`/admin/settings/${key}`);

export const createSetting = (data: CreateSettingData) => 
  apiService.post<SystemSetting>('/admin/settings', data);

export const updateSetting = (key: string, data: UpdateSettingData) => 
  apiService.put<SystemSetting>(`/admin/settings/${key}`, data);

export const deleteSetting = (key: string) => 
  apiService.delete<{ message: string }>(`/admin/settings/${key}`);

export const getSettingCategories = () => 
  apiService.get<SettingCategory[]>('/admin/settings/categories/list');

export const getPublicSettings = (params?: { category?: string }) => 
  apiService.get<SystemSetting[]>('/admin/settings/public/list', params);

export const bulkUpdateSettings = (data: BulkUpdateRequest) => 
  apiService.post<BulkUpdateResponse>('/admin/settings/bulk-update', data);

export const getSettingAuditLogs = (params?: { 
  key?: string; 
  page?: number; 
  limit?: number; 
}) => 
  apiService.get<PaginatedResponse<SettingAuditLog>>('/admin/settings/audit-logs/list', params);

// Helper functions
export const getSettingValue = (setting: SystemSetting): any => {
  if (setting.isEncrypted) {
    // In a real implementation, you would decrypt the value
    return setting.value;
  }
  
  switch (setting.dataType) {
    case 'NUMBER':
      return parseFloat(setting.value);
    case 'BOOLEAN':
      return setting.value === 'true';
    case 'JSON':
      try {
        return JSON.parse(setting.value);
      } catch {
        return setting.value;
      }
    case 'DATE':
      return new Date(setting.value);
    default:
      return setting.value;
  }
};

export const formatSettingValue = (value: any, dataType: string): string => {
  switch (dataType) {
    case 'BOOLEAN':
      return value ? 'true' : 'false';
    case 'JSON':
      return typeof value === 'string' ? value : JSON.stringify(value);
    case 'DATE':
      return value instanceof Date ? value.toISOString() : value;
    default:
      return String(value);
  }
};

export const validateSettingValue = (value: any, dataType: string): boolean => {
  switch (dataType) {
    case 'STRING':
      return typeof value === 'string';
    case 'NUMBER':
      return typeof value === 'number' && !isNaN(value);
    case 'BOOLEAN':
      return typeof value === 'boolean';
    case 'JSON':
      try {
        JSON.parse(value);
        return true;
      } catch {
        return false;
      }
    case 'DATE':
      return !isNaN(Date.parse(value));
    case 'EMAIL': {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    }
    case 'URL': {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    }
    case 'PHONE': {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
    }
    default:
      return true;
  }
};

// Default settings for common configurations
export const DEFAULT_SETTINGS = {
  // General Settings
  'app.name': { value: 'AstroFinance', category: 'GENERAL', dataType: 'STRING' as const },
  'app.description': { value: 'Financial Management System', category: 'GENERAL', dataType: 'STRING' as const },
  'app.version': { value: '1.0.0', category: 'GENERAL', dataType: 'STRING' as const },
  'app.timezone': { value: 'Asia/Kathmandu', category: 'GENERAL', dataType: 'STRING' as const },
  'app.language': { value: 'en', category: 'GENERAL', dataType: 'STRING' as const },
  
  // Contact Information
  'contact.email': { value: 'info@astrofinance.com', category: 'CONTACT', dataType: 'EMAIL' as const },
  'contact.phone': { value: '+977-1-1234567', category: 'CONTACT', dataType: 'PHONE' as const },
  'contact.address': { value: 'Kathmandu, Nepal', category: 'CONTACT', dataType: 'STRING' as const },
  'contact.website': { value: 'https://astrofinance.com', category: 'CONTACT', dataType: 'URL' as const },
  
  // Business Settings
  'business.name': { value: 'AstroFinance Pvt. Ltd.', category: 'BUSINESS', dataType: 'STRING' as const },
  'business.registration_number': { value: '123456789', category: 'BUSINESS', dataType: 'STRING' as const },
  'business.tax_id': { value: 'TAX123456', category: 'BUSINESS', dataType: 'STRING' as const },
  'business.currency': { value: 'NPR', category: 'BUSINESS', dataType: 'STRING' as const },
  'business.financial_year_start': { value: '2024-04-01', category: 'BUSINESS', dataType: 'DATE' as const },
  
  // Loan Settings
  'loan.max_amount': { value: '1000000', category: 'LOAN', dataType: 'NUMBER' as const },
  'loan.min_amount': { value: '1000', category: 'LOAN', dataType: 'NUMBER' as const },
  'loan.max_tenure': { value: '84', category: 'LOAN', dataType: 'NUMBER' as const },
  'loan.min_tenure': { value: '3', category: 'LOAN', dataType: 'NUMBER' as const },
  'loan.processing_fee_percent': { value: '2.5', category: 'LOAN', dataType: 'NUMBER' as const },
  'loan.late_fee_amount': { value: '500', category: 'LOAN', dataType: 'NUMBER' as const },
  
  // Notification Settings
  'notification.email_enabled': { value: 'true', category: 'NOTIFICATION', dataType: 'BOOLEAN' as const },
  'notification.sms_enabled': { value: 'true', category: 'NOTIFICATION', dataType: 'BOOLEAN' as const },
  'notification.push_enabled': { value: 'false', category: 'NOTIFICATION', dataType: 'BOOLEAN' as const },
  'notification.sms_provider': { value: 'twilio', category: 'NOTIFICATION', dataType: 'STRING' as const },
  
  // Security Settings
  'security.password_min_length': { value: '8', category: 'SECURITY', dataType: 'NUMBER' as const },
  'security.password_require_special': { value: 'true', category: 'SECURITY', dataType: 'BOOLEAN' as const },
  'security.session_timeout': { value: '3600', category: 'SECURITY', dataType: 'NUMBER' as const },
  'security.max_login_attempts': { value: '5', category: 'SECURITY', dataType: 'NUMBER' as const },
  'security.two_factor_enabled': { value: 'false', category: 'SECURITY', dataType: 'BOOLEAN' as const },
  
  // System Settings
  'system.maintenance_mode': { value: 'false', category: 'SYSTEM', dataType: 'BOOLEAN' as const },
  'system.debug_mode': { value: 'false', category: 'SYSTEM', dataType: 'BOOLEAN' as const },
  'system.log_level': { value: 'info', category: 'SYSTEM', dataType: 'STRING' as const },
  'system.backup_enabled': { value: 'true', category: 'SYSTEM', dataType: 'BOOLEAN' as const },
  'system.backup_frequency': { value: 'daily', category: 'SYSTEM', dataType: 'STRING' as const }
};

const settingsService = {
  getSettings,
  getSettingByKey,
  createSetting,
  updateSetting,
  deleteSetting,
  getSettingCategories,
  getPublicSettings,
  bulkUpdateSettings,
  getSettingAuditLogs,
  getSettingValue,
  formatSettingValue,
  validateSettingValue,
  DEFAULT_SETTINGS
};

export default settingsService;
