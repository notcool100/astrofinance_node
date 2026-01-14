import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/common/Card';
import ProfileForm from '@/components/forms/ProfileForm';
import PasswordChangeForm from '@/components/forms/PasswordChangeForm';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <MainLayout title="My Profile">
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card title="Profile Information">
              <ProfileForm />
            </Card>

            <Card title="Change Password">
              <PasswordChangeForm />
            </Card>
          </div>

          <Card title="Account Information">
            <div className="px-4 py-5 sm:p-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Account ID</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user?.id}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Email address</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Account status</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      user?.isActive 
                        ? 'bg-success-100 text-success-800' 
                        : 'bg-danger-100 text-danger-800'
                    }`}>
                      {user?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Member since</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user?.createdAt 
                      ? new Date(user.createdAt).toLocaleDateString() 
                      : 'Not available'}
                  </dd>
                </div>
              </dl>
            </div>
          </Card>

          <Card title="Linked Accounts">
            <div className="px-4 py-5 sm:p-6">
              <p className="text-sm text-gray-500">
                You don't have any linked accounts yet. Linking your bank account can make loan disbursements and repayments easier.
              </p>
              <div className="mt-5">
                <button
                  type="button"
                  className="btn btn-outline"
                >
                  Link Bank Account
                </button>
              </div>
            </div>
          </Card>

          <Card title="Notification Preferences">
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-4">
                <div className="relative flex items-start">
                  <div className="flex h-5 items-center">
                    <input
                      id="email-notifications"
                      name="email-notifications"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      defaultChecked
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="email-notifications" className="font-medium text-gray-700">
                      Email Notifications
                    </label>
                    <p className="text-gray-500">Receive email notifications about your account activity.</p>
                  </div>
                </div>
                
                <div className="relative flex items-start">
                  <div className="flex h-5 items-center">
                    <input
                      id="sms-notifications"
                      name="sms-notifications"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      defaultChecked
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="sms-notifications" className="font-medium text-gray-700">
                      SMS Notifications
                    </label>
                    <p className="text-gray-500">Receive SMS notifications about your account activity.</p>
                  </div>
                </div>
                
                <div className="relative flex items-start">
                  <div className="flex h-5 items-center">
                    <input
                      id="marketing-notifications"
                      name="marketing-notifications"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="marketing-notifications" className="font-medium text-gray-700">
                      Marketing Communications
                    </label>
                    <p className="text-gray-500">Receive updates about new products and features.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  className="btn btn-primary"
                >
                  Save Preferences
                </button>
              </div>
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

export default ProfilePage;
