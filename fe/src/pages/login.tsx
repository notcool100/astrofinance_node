import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/forms/LoginForm';

type UserType = 'STAFF' | 'ADMIN';

const Login = () => {
  // Check if there's a userType in the URL query
  const router = useRouter();
  const { type } = router.query;
  const initialUserType = (type === 'admin' ? 'ADMIN' : type === 'staff' ? 'STAFF' : 'STAFF') as UserType;
  
  const [userType, setUserType] = useState<UserType>(initialUserType);
  const { isAuthenticated, isAdmin, isStaff } = useAuth();

  // Update userType when URL query changes
  useEffect(() => {
    if (type === 'admin') {
      setUserType('ADMIN');
    } else if (type === 'staff') {
      setUserType('STAFF');
    }
  }, [type]);

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      if (isAdmin) {
        router.push('/admin/dashboard');
      } else if (isStaff) {
        router.push('/staff/dashboard');
      }
    }
  }, [isAuthenticated, isAdmin, isStaff, router]);

  const getLoginTitle = () => {
    switch (userType) {
      case 'ADMIN':
        return 'Admin Login';
      case 'STAFF':
      default:
        return 'Staff Login';
    }
  };

  const getSubtitle = () => {
    switch (userType) {
      case 'ADMIN':
        return (
          <span>
            Admin access only.{' '}
            <button
              onClick={handleSwitchUserType}
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Switch to staff login
            </button>
          </span>
        );
      case 'STAFF':
      default:
        return (
          <span>
            Staff access only.{' '}
            <button
              onClick={handleSwitchUserType}
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Switch to admin login
            </button>
          </span>
        );
    }
  };

  const getSwitchButtonText = () => {
    return userType === 'ADMIN' ? 'Switch to Staff Login' : 'Switch to Admin Login';
  };

  const handleSwitchUserType = () => {
    const newType = userType === 'ADMIN' ? 'staff' : 'admin';
    router.push(`/login?type=${newType}`, undefined, { shallow: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-12 w-auto"
          src="/logo.svg"
          alt="AstroFinance"
        />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {getLoginTitle()}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {getSubtitle()}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <LoginForm userType={userType} />
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <a 
                href={userType === 'ADMIN' ? '/login?type=staff' : '/login?type=admin'} 
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                {userType === 'ADMIN' ? 'Go to Staff Login' : 'Go to Admin Login'}
              </a>
            </div>

            <div className="mt-6">
              <button
                onClick={handleSwitchUserType}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {getSwitchButtonText()}
              </button>
            </div>
            
            {userType !== 'USER' && (
              <div className="mt-4 text-center text-xs text-gray-500">
                <span>
                  {userType === 'ADMIN' ? 'Admin' : 'Staff'} login is restricted to authorized personnel only.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;