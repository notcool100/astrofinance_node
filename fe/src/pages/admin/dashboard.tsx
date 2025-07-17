import React from 'react';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/common/Card';
import { fetchDashboardSummary, DashboardSummary } from '@/services/dashboard.service';
import {
  UsersIcon,
  BanknotesIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Fetch dashboard data
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery(
    'adminDashboardSummary',
    fetchDashboardSummary,
    {
      enabled: isAuthenticated && isAdmin,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Redirect if not authenticated or not admin
  React.useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, isAdmin, router]);

  if (authLoading || !isAuthenticated || !isAdmin) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <MainLayout title="Admin Dashboard">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UsersIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {isDashboardLoading ? '...' : dashboardData?.users.total}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <a href="/admin/users" className="font-medium text-primary-700 hover:text-primary-900">
                  View all
                </a>
              </div>
            </div>
          </Card>

          <Card className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BanknotesIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Loans</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {isDashboardLoading ? '...' : dashboardData?.loans.active}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <a href="/admin/loans" className="font-medium text-primary-700 hover:text-primary-900">
                  View all
                </a>
              </div>
            </div>
          </Card>

          <Card className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Applications</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {isDashboardLoading ? '...' : dashboardData?.pendingApplications}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <a href="/admin/loans/applications" className="font-medium text-primary-700 hover:text-primary-900">
                  View all
                </a>
              </div>
            </div>
          </Card>

          <Card className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Disbursed</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {isDashboardLoading ? '...' : `$${dashboardData?.loans.totalAmount.toLocaleString()}`}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <a href="/admin/reports/disbursements" className="font-medium text-primary-700 hover:text-primary-900">
                  View details
                </a>
              </div>
            </div>
          </Card>

          <Card className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Outstanding Amount</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {isDashboardLoading ? '...' : `$${dashboardData?.loans.outstandingAmount.toLocaleString()}`}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <a href="/admin/reports/collections" className="font-medium text-primary-700 hover:text-primary-900">
                  View details
                </a>
              </div>
            </div>
          </Card>

          <Card className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DocumentTextIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Staff</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {isDashboardLoading ? '...' : dashboardData?.staff.active}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <a href="/admin/loans/overdue" className="font-medium text-primary-700 hover:text-primary-900">
                  View all
                </a>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card title="Recent Activity">
          <div className="flow-root">
            <ul role="list" className="-mb-8">
              {isDashboardLoading ? (
                <li className="py-4 text-center text-sm text-gray-500">
                  Loading...
                </li>
              ) : dashboardData?.recentActivities && dashboardData.recentActivities.length > 0 ? (
                dashboardData.recentActivities.map((activity, activityIdx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== dashboardData.recentActivities.length - 1 ? (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span
                            className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                              activity.type === 'LOAN_APPLICATION'
                                ? 'bg-blue-500'
                                : activity.type === 'LOAN_APPROVAL'
                                ? 'bg-green-500'
                                : activity.type === 'PAYMENT'
                                ? 'bg-purple-500'
                                : activity.type === 'USER_REGISTRATION'
                                ? 'bg-yellow-500'
                                : 'bg-gray-500'
                            }`}
                          >
                            {activity.type === 'LOAN_APPLICATION' ? (
                              <BanknotesIcon className="h-5 w-5 text-white" aria-hidden="true" />
                            ) : activity.type === 'LOAN_APPROVAL' ? (
                              <CheckCircleIcon className="h-5 w-5 text-white" aria-hidden="true" />
                            ) : activity.type === 'PAYMENT' ? (
                              <CurrencyDollarIcon className="h-5 w-5 text-white" aria-hidden="true" />
                            ) : activity.type === 'USER_REGISTRATION' ? (
                              <UsersIcon className="h-5 w-5 text-white" aria-hidden="true" />
                            ) : (
                              <DocumentTextIcon className="h-5 w-5 text-white" aria-hidden="true" />
                            )}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              {activity.description}{' '}
                              <a href={`/admin/users/${activity.user.id}`} className="font-medium text-gray-900">
                                {activity.user.name}
                              </a>
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {new Date(activity.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="py-4 text-center text-sm text-gray-500">
                  No recent activity found.
                </li>
              )}
            </ul>
          </div>
          <div className="mt-6">
            <a
              href="/admin/activity"
              className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              View all activity
            </a>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <a
              href="/admin/users/new"
              className="inline-block rounded-md bg-white px-4 py-6 text-center shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <UsersIcon className="mx-auto h-8 w-8 text-primary-600" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Add New User</h3>
            </a>
            
            <a
              href="/admin/loans/applications/pending"
              className="inline-block rounded-md bg-white px-4 py-6 text-center shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <ClockIcon className="mx-auto h-8 w-8 text-primary-600" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Review Applications</h3>
            </a>
            
            <a
              href="/admin/loans/disburse"
              className="inline-block rounded-md bg-white px-4 py-6 text-center shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <BanknotesIcon className="mx-auto h-8 w-8 text-primary-600" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Disburse Loans</h3>
            </a>
            
            <a
              href="/admin/reports/generate"
              className="inline-block rounded-md bg-white px-4 py-6 text-center shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <DocumentTextIcon className="mx-auto h-8 w-8 text-primary-600" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Generate Reports</h3>
            </a>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;