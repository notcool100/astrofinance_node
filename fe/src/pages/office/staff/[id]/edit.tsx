import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import Button from '@/components/common/Button';
import StaffForm from '@/components/modules/staff/StaffForm';
import { getStaffById, updateStaff, StaffProfile, UpdateStaffData } from '@/services/staff.service';

const EditStaffPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [staff, setStaff] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
    if (!id || typeof id !== 'string') return;
    
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      console.log('Submitting staff update with data:', data);
      
      // Ensure roleIds is an array of strings
      if (data.roleIds) {
        data.roleIds = data.roleIds.map(id => String(id));
        console.log('Processed roleIds:', data.roleIds);
      }
      
      await updateStaff(id, data);
      setSuccessMessage('Staff details updated successfully');
      
      // Refresh staff data
      await fetchStaffDetails(id);
    } catch (err: any) {
      console.error('Error updating staff:', err);
      setError(err.message || 'Failed to update staff details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute adminOnly>
      <MainLayout>
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link href={`/office/staff/${id}`}>
              <Button variant="outline" className="flex items-center">
                <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Back to Staff Details
              </Button>
            </Link>
          </div>

        <div className="sm:flex sm:items-center mb-6">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">
              {loading ? 'Loading Staff Details...' : `Edit Staff: ${staff?.firstName} ${staff?.lastName}`}
            </h1>
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

        {successMessage && (
          <div className="mb-6 rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Success</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>{successMessage}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="p-6 text-center">Loading staff details...</div>
        ) : staff ? (
          <StaffForm 
            staff={staff} 
            onSubmit={handleSubmit} 
            isSubmitting={saving} 
            isEditMode={true}
          />
        ) : (
          <div className="p-6 text-center">Staff not found or you don't have permission to edit this staff member.</div>
        )}
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

export default EditStaffPage;
