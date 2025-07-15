import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/common/Button';
import authService from '@/services/authService';

interface ProfileFormData {
  fullName: string;
  email: string;
  contactNumber: string;
}

const profileSchema = yup.object().shape({
  fullName: yup.string().required('Full name is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  contactNumber: yup.string().required('Contact number is required'),
});

const ProfileForm: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      contactNumber: user?.contactNumber || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    try {
      const updatedUser = await authService.updateUserProfile(data);
      updateUser(updatedUser);
      setSuccessMessage('Profile updated successfully');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {successMessage && (
        <div className="rounded-md bg-success-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-success-800">Success</h3>
              <div className="mt-2 text-sm text-success-700">
                <p>{successMessage}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-md bg-danger-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-danger-800">Error</h3>
              <div className="mt-2 text-sm text-danger-700">
                <p>{errorMessage}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="fullName" className="form-label">
          Full Name
        </label>
        <div className="mt-1">
          <input
            id="fullName"
            type="text"
            className="form-input"
            {...register('fullName')}
          />
          {errors.fullName && (
            <p className="form-error">{errors.fullName.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="form-label">
          Email Address
        </label>
        <div className="mt-1">
          <input
            id="email"
            type="email"
            className="form-input"
            {...register('email')}
            disabled // Email cannot be changed
          />
          {errors.email && (
            <p className="form-error">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="contactNumber" className="form-label">
          Contact Number
        </label>
        <div className="mt-1">
          <input
            id="contactNumber"
            type="text"
            className="form-input"
            {...register('contactNumber')}
          />
          {errors.contactNumber && (
            <p className="form-error">{errors.contactNumber.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
        >
          Update Profile
        </Button>
      </div>
    </form>
  );
};

export default ProfileForm;