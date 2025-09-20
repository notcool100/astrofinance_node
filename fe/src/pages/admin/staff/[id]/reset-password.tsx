import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import MainLayout from '@/components/layout/MainLayout';
import Button from '@/components/common/Button';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { getStaffById, resetStaffPassword, StaffProfile } from '@/services/staff.service';

const ResetPasswordPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [staff, setStaff] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!staff) return;
    
    // Validate passwords
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      
      await resetStaffPassword(staff.id, { newPassword });
      setSuccess('Password has been reset successfully. The new password has been sent to the staff member.');
      
      // Clear form
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Error resetting password:', err);
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute adminOnly>
        <MainLayout>
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">Loading staff details...</div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  if (!staff) {
    return (
      <ProtectedRoute adminOnly>
        <MainLayout>
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">Staff not found.</div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

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
              <h1 className="text-2xl font-semibold text-gray-900">Reset Staff Password</h1>
              <p className="mt-2 text-sm text-gray-700">
                Reset password for {staff.firstName} {staff.lastName} ({staff.employeeId})
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

          {success && (
            <div className="mb-6 rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Success</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>{success}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="max-w-md">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="Enter new password"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 8 characters long
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Link href="/admin/staff">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? 'Resetting...' : 'Reset Password'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default ResetPasswordPage;