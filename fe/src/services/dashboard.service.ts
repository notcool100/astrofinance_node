import apiService from './api';

// Types
export interface DashboardSummary {
  users: {
    total: number;
    active: number;
  };
  staff: {
    total: number;
    active: number;
  };
  loans: {
    total: number;
    active: number;
    totalAmount: number;
    outstandingAmount: number;
  };
  pendingApplications: number;
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    user: {
      id: string;
      name: string;
    };
    details: any;
  }>;
}

export interface StaffDashboardSummary {
  assignedUsers: number;
  activeLoans: number;
  pendingApplications: number;
  todayPayments: number;
  overduePayments: number;
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    user: {
      id: string;
      name: string;
    };
  }>;
}

// Admin dashboard API
export const fetchDashboardSummary = async (): Promise<DashboardSummary> => {
  return apiService.get<DashboardSummary>('/admin/dashboard/summary');
};

// Staff dashboard API
export const fetchStaffDashboardSummary = async (): Promise<StaffDashboardSummary> => {
  return apiService.get<StaffDashboardSummary>('/staff/dashboard/summary');
};