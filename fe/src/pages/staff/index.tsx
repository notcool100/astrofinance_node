import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';

const StaffHomePage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to staff dashboard
    router.push('/staff/dashboard');
  }, [router]);

  return (
    <MainLayout title="Staff Portal">
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    </MainLayout>
  );
};

export default StaffHomePage;