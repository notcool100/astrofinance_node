import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import Button from '@/components/common/Button';
import UserForm from '@/components/modules/users/UserForm';
import { getUserById, updateUser, UpdateUserData } from '@/services/user.service';
import { toast } from 'react-toastify';

const EditUserPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchUserDetails(id);
    }
  }, [id]);

  const fetchUserDetails = async (userId: string) => {
    try {
      setLoading(true);
      const data = await getUserById(userId);
      setUser(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError('Failed to load user details. Please try again later.');
      toast.error('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: UpdateUserData) => {
    if (!id || typeof id !== 'string') return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Map form fields to API fields
      const updateData: UpdateUserData = {
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        contactNumber: data.contactNumber,
        email: data.email,
        address: data.address,
        identificationNumber: data.identificationNumber,
        identificationType: data.identificationType,
        isActive: data.isActive
      };
      
      await updateUser(id, updateData);
      toast.success('User updated successfully');
      
      // Redirect to the user details page
      router.push(`/office/users/${id}`);
    } catch (err: any) {
      console.error('Error updating user:', err);
      setError(err.response?.data?.message || 'Failed to update user. Please try again.');
      toast.error('Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link href={`/office/users/${id}`}>
              <Button variant="outline" className="flex items-center">
                <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Back to User Details
              </Button>
            </Link>
          </div>

          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <div className="px-4 sm:px-0">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Edit User</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Update user information and settings.
                </p>
                {error && (
                  <div className="mt-4 rounded-md bg-red-50 p-4">
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
              </div>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              {loading ? (
                <div className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary-400 border-r-transparent"></div>
                  <p className="mt-4 text-gray-700">Loading user details...</p>
                </div>
              ) : user ? (
                <UserForm
                  user={user}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  isEditMode={true}
                />
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-700">User not found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default EditUserPage;