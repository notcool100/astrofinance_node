import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { UserCircleIcon, KeyIcon } from '@heroicons/react/24/outline';

// Form validation schema for profile update
const profileSchema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
});

// Form validation schema for password change
const passwordSchema = yup.object().shape({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup
    .string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const StaffProfile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  
  // Profile form setup
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      firstName: user?.fullName?.split(' ')[0] || '',
      lastName: user?.fullName?.split(' ')[1] || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });
  
  // Password form setup
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: yupResolver(passwordSchema),
  });
  
  // Handle profile update
  const onUpdateProfile = async (data: ProfileFormData) => {
    setIsUpdatingProfile(true);
    setUpdateSuccess(false);
    
    try {
      // This would be replaced with an actual API call
      // const response = await authService.updateStaffProfile(data);
      
      // For now, just simulate a successful update
      const updatedUser = {
        ...user,
        fullName: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone,
      };
      
      // Update user in context
      updateUser(updatedUser);
      
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };
  
  // Handle password change
  const onChangePassword = async (data: PasswordFormData) => {
    setIsChangingPassword(true);
    setPasswordSuccess(false);
    
    try {
      // This would be replaced with an actual API call
      // await authService.changeStaffPassword({
      //   currentPassword: data.currentPassword,
      //   newPassword: data.newPassword,
      // });
      
      // For now, just simulate a successful password change
      console.log('Password changed:', data);
      
      resetPassword();
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password. Please check your current password and try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  return (
    <ProtectedRoute staffOnly>
      <MainLayout title="Staff Profile">
        <div className="space-y-6">
          <Card>
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  className={`py-4 px-6 border-b-2 font-medium text-sm ${
                    activeTab === 'profile'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('profile')}
                >
                  <UserCircleIcon className="h-5 w-5 inline mr-2" />
                  Profile Information
                </button>
                <button
                  className={`py-4 px-6 border-b-2 font-medium text-sm ${
                    activeTab === 'password'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('password')}
                >
                  <KeyIcon className="h-5 w-5 inline mr-2" />
                  Change Password
                </button>
              </nav>
            </div>
            
            <div className="p-6">
              {activeTab === 'profile' ? (
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Update your personal information and contact details.
                  </p>
                  
                  {updateSuccess && (
                    <div className="mt-4 p-4 rounded-md bg-green-50">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-green-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-green-800">
                            Profile updated successfully!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                          First Name
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          className={`mt-1 form-input ${profileErrors.firstName ? 'border-red-500' : ''}`}
                          {...registerProfile('firstName')}
                        />
                        {profileErrors.firstName && (
                          <p className="mt-1 text-sm text-red-600">{profileErrors.firstName.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                          Last Name
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          className={`mt-1 form-input ${profileErrors.lastName ? 'border-red-500' : ''}`}
                          {...registerProfile('lastName')}
                        />
                        {profileErrors.lastName && (
                          <p className="mt-1 text-sm text-red-600">{profileErrors.lastName.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          className={`mt-1 form-input ${profileErrors.email ? 'border-red-500' : ''}`}
                          {...registerProfile('email')}
                        />
                        {profileErrors.email && (
                          <p className="mt-1 text-sm text-red-600">{profileErrors.email.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          id="phone"
                          className={`mt-1 form-input ${profileErrors.phone ? 'border-red-500' : ''}`}
                          {...registerProfile('phone')}
                        />
                        {profileErrors.phone && (
                          <p className="mt-1 text-sm text-red-600">{profileErrors.phone.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="pt-5">
                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          variant="primary"
                          isLoading={isUpdatingProfile}
                        >
                          Update Profile
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              ) : (
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Change Password</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Update your password to maintain account security.
                  </p>
                  
                  {passwordSuccess && (
                    <div className="mt-4 p-4 rounded-md bg-green-50">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-green-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-green-800">
                            Password changed successfully!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmitPassword(onChangePassword)} className="mt-6 space-y-6">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        className={`mt-1 form-input ${passwordErrors.currentPassword ? 'border-red-500' : ''}`}
                        {...registerPassword('currentPassword')}
                      />
                      {passwordErrors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        className={`mt-1 form-input ${passwordErrors.newPassword ? 'border-red-500' : ''}`}
                        {...registerPassword('newPassword')}
                      />
                      {passwordErrors.newPassword && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        className={`mt-1 form-input ${passwordErrors.confirmPassword ? 'border-red-500' : ''}`}
                        {...registerPassword('confirmPassword')}
                      />
                      {passwordErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
                      )}
                    </div>
                    
                    <div className="pt-5">
                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          variant="primary"
                          isLoading={isChangingPassword}
                        >
                          Change Password
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default StaffProfile;