import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/common/Button';

interface LoginFormProps {
  userType?: 'STAFF' | 'ADMIN';
}

interface LoginFormData {
  username: string;
  password: string;
}

// Schema for login validation
const loginSchema = yup.object().shape({
  username: yup.string().required('Username or Employee ID is required'),
  password: yup.string().required('Password is required'),
});

const LoginForm: React.FC<LoginFormProps> = ({ userType = 'STAFF' }) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      console.log(`Attempting ${userType} login with:`, data);
      await login(data, userType);
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-md bg-danger-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-danger-800">Login Error</h3>
              <div className="mt-2 text-sm text-danger-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="username" className="form-label">
          {userType === 'ADMIN' ? 'Username' : 'Employee ID or Email'}
        </label>
        <div className="mt-1">
          <input
            id="username"
            type="text"
            autoComplete="username"
            className="form-input"
            placeholder={userType === 'ADMIN' ? 'Enter your username' : 'Enter your employee ID or email'}
            {...register('username')}
          />
          {errors.username && (
            <p className="form-error">{errors.username.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <div className="mt-1 relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            className="form-input pr-10"
            {...register('password')}
          />
          <button
            type="button"
            tabIndex={-1}
            className="absolute inset-y-0 right-0 flex items-center px-2 focus:outline-none"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-400" />
            )}
          </button>
          {errors.password && (
            <p className="form-error">{errors.password.message}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
            Remember me
          </label>
        </div>

        <div className="text-sm">
          <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
            Forgot your password?
          </a>
        </div>
      </div>

      <div>
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          isLoading={isLoading}
        >
          Sign in
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;