import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import Button from '@/components/common/Button';
import UserForm from '@/components/modules/users/UserForm';
import { createUser, CreateUserData } from '@/services/user.service';
import { toast } from 'react-toastify';

const CreateUserPage: React.FC = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateUserData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const newUser = await createUser(data);
      toast.success('User created successfully');
      
      // Redirect to the user details page
      router.push(`/users/${newUser.id}`);
    } catch (err: any) {
      console.error('Error creating user:', err);
      setError(err.response?.data?.message || 'Failed to create user. Please try again.');
      toast.error('Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link href="/users">
              <Button variant="outline" className="flex items-center">
                <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Back to Users List
              </Button>
            </Link>
          </div>

          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <div className="px-4 sm:px-0">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Create New User</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Add a new user to the system. Users can have accounts and apply for loans.
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
              <UserForm
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                isEditMode={false}
              />
            </div>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default CreateUserPage;