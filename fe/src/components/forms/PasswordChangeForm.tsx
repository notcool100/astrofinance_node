import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Button from '@/components/common/Button';
import authService, { PasswordChangeData } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';

const passwordChangeSchema = yup.object().shape({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup
    .string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required'),
});

const PasswordChangeForm: React.FC = () => {
  const { isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordChangeData & { confirmPassword: string }>({
    resolver: yupResolver(passwordChangeSchema),
  });

  const onSubmit = async (data: PasswordChangeData & { confirmPassword: string }) => {
    setIsLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...passwordData } = data;
      
      if (isAdmin) {
        await authService.changeAdminPassword(passwordData);
      } else {
        await authService.changeUserPassword(passwordData);
      }
      
      setSuccessMessage('Password changed successfully');
      reset(); // Clear form
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to change password');
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
        <label htmlFor="currentPassword" className="form-label">
          Current Password
        </label>
        <div className="mt-1">
          <input
            id="currentPassword"
            type="password"
            className="form-input"
            {...register('currentPassword')}
          />
          {errors.currentPassword && (
            <p className="form-error">{errors.currentPassword.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="newPassword" className="form-label">
          New Password
        </label>
        <div className="mt-1">
          <input
            id="newPassword"
            type="password"
            className="form-input"
            {...register('newPassword')}
          />
          {errors.newPassword && (
            <p className="form-error">{errors.newPassword.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="form-label">
          Confirm New Password
        </label>
        <div className="mt-1">
          <input
            id="confirmPassword"
            type="password"
            className="form-input"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="form-error">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
        >
          Change Password
        </Button>
      </div>
    </form>
  );
};

export default PasswordChangeForm;