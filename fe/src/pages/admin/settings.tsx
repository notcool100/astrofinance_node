import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/common/ProtectedRoute';

const SettingsPage: React.FC = () => {
  return (
    <ProtectedRoute adminOnly>
      <MainLayout>
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-semibold text-gray-900">System Settings</h1>
          <p className="mt-2 text-sm text-gray-700">Configure system-level options. (To be implemented)</p>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default SettingsPage;
