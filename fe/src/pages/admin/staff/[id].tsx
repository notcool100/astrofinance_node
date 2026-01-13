import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline';
import MainLayout from '@/components/layout/MainLayout';
import Button from '@/components/common/Button';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import StaffDetails from '@/components/modules/staff/StaffDetails';
import { getStaffById, StaffProfile } from '@/services/staff.service';

const StaffDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [staff, setStaff] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);
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
            <h1 className="text-2xl font-semibold text-gray-900">
              {loading ? 'Loading Staff Details...' : `Staff Details: ${staff?.firstName} ${staff?.lastName}`}
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              View staff member information and role assignments.
            </p>
          </div>
          {staff && (
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <Link href={`/admin/staff/${staff.id}/edit`}>
                <Button variant="primary" className="flex items-center">
                  <PencilIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Edit Staff
                </Button>
              </Link>
            </div>
          )}
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

        {loading ? (
          <div className="p-6 text-center">Loading staff details...</div>
        ) : staff ? (
          <StaffDetails staff={staff} />
        ) : (
          <div className="p-6 text-center">Staff not found or you don't have permission to view this staff member.</div>
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

export default StaffDetailPage;
