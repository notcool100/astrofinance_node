import React from 'react';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/common/Card';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { fetchStaffDashboardSummary, StaffDashboardSummary } from '@/services/dashboard.service';
import {
  UsersIcon,
  BanknotesIcon,
  ClockIcon,
  DocumentTextIcon,
  UserPlusIcon,
  ClipboardDocumentCheckIcon,
  CalculatorIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';



const StaffDashboard = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Fetch dashboard data
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery(
    'staffDashboardSummary',
    fetchStaffDashboardSummary,
    {
      enabled: isAuthenticated,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div>
      </div> 
    );
  }

  return (
    <ProtectedRoute staffOnly>
      <MainLayout title="Staff Dashboard">
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <Card className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UsersIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Assigned Users</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {isDashboardLoading ? '...' : dashboardData?.assignedUsers}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <a href="/staff/users" className="font-medium text-primary-700 hover:text-primary-900">
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
                          {isDashboardLoading ? '...' : dashboardData?.activeLoans}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <a href="/staff/loans" className="font-medium text-primary-700 hover:text-primary-900">
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
                  <a href="/staff/applications" className="font-medium text-primary-700 hover:text-primary-900">
                    View all
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
                      <dt className="text-sm font-medium text-gray-500 truncate">Today's Payments</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {isDashboardLoading ? '...' : dashboardData?.todayPayments}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <a href="/staff/payments/today" className="font-medium text-primary-700 hover:text-primary-900">
                    View all
                  </a>
                </div>
              </div>
            </Card>

            <Card className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClipboardDocumentCheckIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Overdue Payments</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {isDashboardLoading ? '...' : dashboardData?.overduePayments}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <a href="/staff/payments/overdue" className="font-medium text-primary-700 hover:text-primary-900">
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
                                  : activity.type === 'PAYMENT'
                                  ? 'bg-green-500'
                                  : activity.type === 'USER_REGISTRATION'
                                  ? 'bg-yellow-500'
                                  : activity.type === 'OVERDUE'
                                  ? 'bg-red-500'
                                  : 'bg-purple-500'
                              }`}
                            >
                              {activity.type === 'LOAN_APPLICATION' ? (
                                <BanknotesIcon className="h-5 w-5 text-white" aria-hidden="true" />
                              ) : activity.type === 'PAYMENT' ? (
                                <DocumentTextIcon className="h-5 w-5 text-white" aria-hidden="true" />
                              ) : activity.type === 'USER_REGISTRATION' ? (
                                <UserPlusIcon className="h-5 w-5 text-white" aria-hidden="true" />
                              ) : activity.type === 'OVERDUE' ? (
                                <ClockIcon className="h-5 w-5 text-white" aria-hidden="true" />
                              ) : (
                                <PhoneIcon className="h-5 w-5 text-white" aria-hidden="true" />
                              )}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                {activity.description}{' '}
                                <a href={`/staff/users/${activity.user.id}`} className="font-medium text-gray-900">
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
                href="/staff/activity"
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
                href="/staff/users/new"
                className="inline-block rounded-md bg-white px-4 py-6 text-center shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                <UserPlusIcon className="mx-auto h-8 w-8 text-primary-600" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Register New User</h3>
              </a>
              
              <a
                href="/staff/applications/new"
                className="inline-block rounded-md bg-white px-4 py-6 text-center shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                <BanknotesIcon className="mx-auto h-8 w-8 text-primary-600" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">New Loan Application</h3>
              </a>
              
              <a
                href="/staff/payments/collect"
                className="inline-block rounded-md bg-white px-4 py-6 text-center shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                <DocumentTextIcon className="mx-auto h-8 w-8 text-primary-600" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Collect Payment</h3>
              </a>
              
              <a
                href="/staff/calculator"
                className="inline-block rounded-md bg-white px-4 py-6 text-center shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                <CalculatorIcon className="mx-auto h-8 w-8 text-primary-600" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Loan Calculator</h3>
              </a>
            </div>
          </Card>

          {/* Today's Schedule */}
          <Card title="Today's Schedule">
            <div className="overflow-hidden bg-white shadow sm:rounded-md">
              <ul role="list" className="divide-y divide-gray-200">
                <li>
                  <a href="#" className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm font-medium text-primary-600">Customer Meeting</p>
                        <div className="ml-2 flex flex-shrink-0">
                          <p className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                            10:00 AM
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <UsersIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                            John Doe
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <PhoneIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                          <p>Loan Application Discussion</p>
                        </div>
                      </div>
                    </div>
                  </a>
                </li>
                <li>
                  <a href="#" className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm font-medium text-primary-600">Payment Collection</p>
                        <div className="ml-2 flex flex-shrink-0">
                          <p className="inline-flex rounded-full bg-yellow-100 px-2 text-xs font-semibold leading-5 text-yellow-800">
                            2:30 PM
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <UsersIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                            Jane Smith
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <BanknotesIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                          <p>Loan #L-2023-042</p>
                        </div>
                      </div>
                    </div>
                  </a>
                </li>
                <li>
                  <a href="#" className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm font-medium text-primary-600">Follow-up Call</p>
                        <div className="ml-2 flex flex-shrink-0">
                          <p className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800">
                            4:00 PM
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <UsersIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                            Robert Johnson
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <PhoneIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                          <p>Overdue Payment Reminder</p>
                        </div>
                      </div>
                    </div>
                  </a>
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};



export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await import('next-i18next/serverSideTranslations').then(m => 
        m.serverSideTranslations(locale, ['common', 'user', 'auth'])
      )),
    },
  };
}

export default StaffDashboard;
