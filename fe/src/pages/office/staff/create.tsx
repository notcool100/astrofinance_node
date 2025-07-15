import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import Button from '@/components/common/Button';
import StaffForm from '@/components/modules/staff/StaffForm';
import { createStaff, CreateStaffData } from '@/services/staff.service';

const CreateStaffPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateStaffData) => {
    try {
      setLoading(true);
      setError(null);
      
      await createStaff(data);
      
      // Redirect to staff list on success
      router.push('/office/staff');
    } catch (err: any) {
      console.error('Error creating staff:', err);
      setError(err.response?.data?.message || 'Failed to create staff member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute adminOnly>
      <MainLayout>
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link href="/office/staff">
              <Button variant="outline" className="flex items-center">
                <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Back to Staff List
              </Button>
            </Link>
          </div>

        <div className="sm:flex sm:items-center mb-6">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Add New Staff Member</h1>
            <p className="mt-2 text-sm text-gray-700">
              Create a new staff member account with role assignments.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <StaffForm 
          onSubmit={handleSubmit} 
          isSubmitting={loading} 
          isEditMode={false}
        />
      </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default CreateStaffPage;