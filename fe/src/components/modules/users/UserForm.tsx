import React, { useState } from 'react';
import { User, CreateUserData, UpdateUserData } from '@/services/user.service';
import Button from '@/components/common/Button';
import DatePicker from '@/components/common/DatePicker';
import { formatDate } from '@/utils/dateUtils';

interface UserFormProps {
  user?: User;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  isEditMode: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
  user,
  onSubmit,
  isSubmitting,
  isEditMode,
}) => {
  const [formData, setFormData] = useState<CreateUserData | UpdateUserData>({
    fullName: user?.fullName || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || '',
    contactNumber: user?.contactNumber || '',
    email: user?.email || '',
    address: user?.address || '',
    identificationNumber: user?.idNumber || '',
    identificationType: user?.idType || 'NATIONAL_ID',
    password: '',
    userType: user?.userType || 'SB',
    isActive: user?.isActive !== undefined ? user.isActive : true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleDateChange = (name: string, date: Date | null) => {
    if (date) {
      // Format date as ISO string for backend compatibility
      setFormData(prev => ({ ...prev, [name]: date.toISOString() }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          {/* Full Name */}
          <div className="sm:col-span-3">
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="fullName"
                id="fullName"
                value={formData.fullName || ''}
                onChange={handleChange}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div className="sm:col-span-3">
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
              Date of Birth
            </label>
            <div className="mt-1">
              <DatePicker
                id="dateOfBirth"
                selected={formData.dateOfBirth ? new Date(formData.dateOfBirth) : null}
                onChange={(date) => handleDateChange('dateOfBirth', date)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Gender */}
          <div className="sm:col-span-3">
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
              Gender
            </label>
            <div className="mt-1">
              <select
                id="gender"
                name="gender"
                value={formData.gender || ''}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          {/* Contact Number */}
          <div className="sm:col-span-3">
            <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">
              Contact Number
            </label>
            <div className="mt-1">
              <input
                type="tel"
                name="contactNumber"
                id="contactNumber"
                value={formData.contactNumber || ''}
                onChange={handleChange}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Email */}
          <div className="sm:col-span-3">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="mt-1">
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email || ''}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Address */}
          <div className="sm:col-span-6">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <div className="mt-1">
              <textarea
                name="address"
                id="address"
                rows={3}
                value={formData.address || ''}
                onChange={handleChange}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Identification Type */}
          <div className="sm:col-span-3">
            <label htmlFor="identificationType" className="block text-sm font-medium text-gray-700">
              Identification Type
            </label>
            <div className="mt-1">
              <select
                id="identificationType"
                name="identificationType"
                value={formData.identificationType || ''}
                onChange={handleChange}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="NATIONAL_ID">National ID</option>
                <option value="PASSPORT">Passport</option>
                <option value="DRIVING_LICENSE">Driving License</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          {/* Identification Number */}
          <div className="sm:col-span-3">
            <label htmlFor="identificationNumber" className="block text-sm font-medium text-gray-700">
              Identification Number
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="identificationNumber"
                id="identificationNumber"
                value={formData.identificationNumber || ''}
                onChange={handleChange}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Password (only for create mode) */}
          {!isEditMode && (
            <div className="sm:col-span-3">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={(formData as CreateUserData).password || ''}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 8 characters long with at least one uppercase letter, one lowercase letter, one number, and one special character.
              </p>
            </div>
          )}

          {/* User Type */}
          <div className="sm:col-span-3">
            <label htmlFor="userType" className="block text-sm font-medium text-gray-700">
              User Type
            </label>
            <div className="mt-1">
              <select
                id="userType"
                name="userType"
                value={(formData as any).userType || 'SB'}
                onChange={handleChange}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="SB">Savings Bank</option>
                <option value="BB">Business Banking</option>
                <option value="MB">Mobile Banking</option>
              </select>
            </div>
          </div>

          {/* Status */}
          <div className="sm:col-span-3">
            <div className="flex items-center h-full mt-4">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                checked={formData.isActive === true}
                onChange={handleCheckboxChange}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Active
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          {isEditMode ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;