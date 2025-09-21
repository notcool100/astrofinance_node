import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import authService, { PasswordChangeData } from '@/services/authService';

interface ProfileFormData {
  fullName?: string;
  email?: string;
  contactNumber?: string;
  department?: string;
  position?: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const profileSchema = yup.object().shape({
  fullName: yup.string(),
  email: yup.string().email('Invalid email format'),
  contactNumber: yup.string(),
  department: yup.string(),
  position: yup.string(),
});

const passwordSchema = yup.object().shape({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: yup.string()
    .required('Please confirm your password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});

const OfficeProfile = () => {
  const { user, updateUser, isAuthenticated, isOfficeUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState(false);
  const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Redirect if not authenticated or not an office user
  React.useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isOfficeUser)) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, isOfficeUser, router]);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      contactNumber: user?.contactNumber || '',
      department: user?.department || '',
      position: user?.position || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm<PasswordFormData>({
    resolver: yupResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsUpdating(true);
    setError(null);
    setProfileUpdateSuccess(false);

    try {
      // Only include fields that are editable
      const updateData = {
        ...user,
        ...data,
      };

      // Call API to update profile
      const updatedUser = await authService.getOfficeProfile();
      
      // Update local user data
      updateUser(updatedUser);
      
      setProfileUpdateSuccess(true);
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsChangingPassword(true);
    setPasswordError(null);
    setPasswordUpdateSuccess(false);

    try {
      const passwordData: PasswordChangeData = {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      };

      // Call API to change password
      await authService.changeOfficePassword(passwordData);
      
      setPasswordUpdateSuccess(true);
      resetPasswordForm();
    } catch (err) {
      console.error('Password change error:', err);
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (authLoading || !isAuthenticated || !isOfficeUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <MainLayout title="My Profile">
      <div className="space-y-6">
        <Card title="Profile Information">
          {profileUpdateSuccess && (
            <div className="mb-4 p-4 bg-green-50 text-green-800 rounded-md">
              Profile updated successfully!
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="fullName"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...registerProfile('fullName')}
                    disabled={user?.userType === 'STAFF'} // Staff can't change their name
                  />
                  {profileErrors.fullName && (
                    <p className="mt-2 text-sm text-red-600">{profileErrors.fullName.message}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="email"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...registerProfile('email')}
                    disabled={true} // Email can't be changed
                  />
                  {profileErrors.email && (
                    <p className="mt-2 text-sm text-red-600">{profileErrors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">
                  Contact Number
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="contactNumber"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...registerProfile('contactNumber')}
                  />
                  {profileErrors.contactNumber && (
                    <p className="mt-2 text-sm text-red-600">{profileErrors.contactNumber.message}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                  Department
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="department"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...registerProfile('department')}
                    disabled={true} // Department can't be changed by user
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                  Position
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="position"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...registerProfile('position')}
                    disabled={true} // Position can't be changed by user
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="userType" className="block text-sm font-medium text-gray-700">
                  User Type
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="userType"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={user?.userType || ''}
                    disabled
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                isLoading={isUpdating}
                disabled={isUpdating}
              >
                Update Profile
              </Button>
            </div>
          </form>
        </Card>

        <Card title="Change Password">
          {passwordUpdateSuccess && (
            <div className="mb-4 p-4 bg-green-50 text-green-800 rounded-md">
              Password changed successfully!
            </div>
          )}
          
          {passwordError && (
            <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-md">
              {passwordError}
            </div>
          )}
          
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    id="currentPassword"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...registerPassword('currentPassword')}
                  />
                  {passwordErrors.currentPassword && (
                    <p className="mt-2 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    id="newPassword"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...registerPassword('newPassword')}
                  />
                  {passwordErrors.newPassword && (
                    <p className="mt-2 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    id="confirmPassword"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...registerPassword('confirmPassword')}
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                isLoading={isChangingPassword}
                disabled={isChangingPassword}
              >
                Change Password
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
};

export default OfficeProfile;