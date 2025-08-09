import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import MainLayout from '@/components/layout/MainLayout';
import Button from '@/components/common/Button';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import StaffForm from '@/components/modules/staff/StaffForm';
import { getStaffById, updateStaff, StaffProfile, UpdateStaffData } from '@/services/staff.service';

const EditStaffPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [staff, setStaff] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchStaffDetails(id);
    }
  }, [id]);

  const fetchStaffDetails = async (staffId: string) => {
    try {
      setLoading(true);
      const data = await getStaffById(staffId);
      setStaff(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching staff details:', err);
      setError('Failed to load staff details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: UpdateStaffData) => {
    if (!staff) return;
    
    try {
      setSubmitting(true);
      setError(null);
      
      await updateStaff(staff.id, data);
      
      // Redirect to staff list on success
      router.push('/admin/staff');
    } catch (err: any) {
      console.error('Error updating staff:', err);
      setError(err.response?.data?.message || 'Failed to update staff member. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute adminOnly>
        <MainLayout>
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">Loading staff details...</div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  if (!staff) {
    return (
      <ProtectedRoute adminOnly>
        <MainLayout>
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">Staff not found.</div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute adminOnly>
      <MainLayout>
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link href="/admin/staff">
              <Button variant="outline" className="flex items-center">
                <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Back to Staff List
              </Button>
            </Link>
          </div>

          <div className="sm:flex sm:items-center mb-6">
            <div className="sm:flex-auto">
              <h1 className="text-2xl font-semibold text-gray-900">Edit Staff Member</h1>
              <p className="mt-2 text-sm text-gray-700">
                Update staff member information and role assignments.
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
            staff={staff}
            onSubmit={handleSubmit} 
            isSubmitting={submitting} 
            isEditMode={true}
          />
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default EditStaffPage;