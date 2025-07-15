import React, { useState, useEffect } from 'react';
import { StaffProfile, CreateStaffData, UpdateStaffData } from '@/services/staff.service';
import Button from '@/components/common/Button';
import DatePicker from '@/components/common/DatePicker';
import { formatDate } from '@/utils/dateUtils';

interface Role {
  id: string;
  name: string;
  description?: string;
}

interface StaffFormProps {
  staff?: StaffProfile;
  onSubmit: (data: CreateStaffData | UpdateStaffData) => void;
  isSubmitting: boolean;
  isEditMode: boolean;
}

const StaffForm: React.FC<StaffFormProps> = ({
  staff,
  onSubmit,
  isSubmitting,
  isEditMode,
}) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [formData, setFormData] = useState<CreateStaffData | UpdateStaffData>({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    joinDate: '',
    department: '',
    position: '',
    status: 'ACTIVE',
    roleIds: [],
  });
  const [loadingRoles, setLoadingRoles] = useState(true);

  useEffect(() => {
    // Fetch roles
    const fetchRoles = async () => {
      try {
        setLoadingRoles(true);
        // This would be replaced with an actual API call
        const response = await fetch('/api/roles');
        const data = await response.json();
        setRoles(data);
      } catch (error) {
        console.error('Error fetching roles:', error);
        // Fallback roles for demo
        setRoles([
          { id: '1', name: 'Admin', description: 'Administrator role' },
          { id: '2', name: 'Manager', description: 'Manager role' },
          { id: '3', name: 'Staff', description: 'Regular staff role' },
        ]);
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchRoles();

    // If editing, populate form with staff data
    if (isEditMode && staff) {
      setFormData({
        employeeId: staff.employeeId,
        firstName: staff.firstName,
        lastName: staff.lastName,
        email: staff.email,
        phone: staff.phone,
        address: staff.address,
        dateOfBirth: staff.dateOfBirth,
        joinDate: staff.joinDate,
        department: staff.department,
        position: staff.position,
        status: staff.status,
        roleIds: staff.roles.map(role => role.id),
      });
    }
  }, [isEditMode, staff]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: string, date: Date | null) => {
    if (date) {
      setFormData(prev => ({ ...prev, [name]: date.toISOString().split('T')[0] }));
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const currentRoleIds = prev.roleIds || [];
      if (checked) {
        return { ...prev, roleIds: [...currentRoleIds, value] };
      } else {
        return { ...prev, roleIds: currentRoleIds.filter(id => id !== value) };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          {/* Employee ID */}
          <div className="sm:col-span-2">
            <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">
              Employee ID
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="employeeId"
                id="employeeId"
                value={formData.employeeId || ''}
                onChange={handleChange}
                disabled={isEditMode}
                required={!isEditMode}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* First Name */}
          <div className="sm:col-span-2">
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="firstName"
                id="firstName"
                value={formData.firstName || ''}
                onChange={handleChange}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Last Name */}
          <div className="sm:col-span-2">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="lastName"
                id="lastName"
                value={formData.lastName || ''}
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
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="sm:col-span-3">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <div className="mt-1">
              <input
                type="tel"
                name="phone"
                id="phone"
                value={formData.phone || ''}
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
                  value={(formData as CreateStaffData).password || ''}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 6 characters long.
              </p>
            </div>
          )}

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

          {/* Date of Birth */}
          <div className="sm:col-span-3">
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
              Date of Birth
            </label>
            <div className="mt-1">
              <DatePicker
                id="dateOfBirth"
                name="dateOfBirth"
                selected={formData.dateOfBirth ? new Date(formData.dateOfBirth) : null}
                onChange={(date) => handleDateChange('dateOfBirth', date)}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Join Date */}
          <div className="sm:col-span-3">
            <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700">
              Join Date
            </label>
            <div className="mt-1">
              <DatePicker
                id="joinDate"
                name="joinDate"
                selected={formData.joinDate ? new Date(formData.joinDate) : null}
                onChange={(date) => handleDateChange('joinDate', date)}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Department */}
          <div className="sm:col-span-3">
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">
              Department
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="department"
                id="department"
                value={formData.department || ''}
                onChange={handleChange}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Position */}
          <div className="sm:col-span-3">
            <label htmlFor="position" className="block text-sm font-medium text-gray-700">
              Position
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="position"
                id="position"
                value={formData.position || ''}
                onChange={handleChange}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Status */}
          <div className="sm:col-span-3">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <div className="mt-1">
              <select
                id="status"
                name="status"
                value={formData.status || 'ACTIVE'}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="TERMINATED">Terminated</option>
              </select>
            </div>
          </div>

          {/* Roles */}
          <div className="sm:col-span-6">
            <fieldset>
              <legend className="text-sm font-medium text-gray-700">Roles</legend>
              <div className="mt-2 space-y-2">
                {loadingRoles ? (
                  <p className="text-sm text-gray-500">Loading roles...</p>
                ) : (
                  roles.map((role) => (
                    <div key={role.id} className="relative flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          id={`role-${role.id}`}
                          name={`role-${role.id}`}
                          type="checkbox"
                          value={role.id}
                          checked={(formData.roleIds || []).includes(role.id)}
                          onChange={handleRoleChange}
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor={`role-${role.id}`} className="font-medium text-gray-700">
                          {role.name}
                        </label>
                        {role.description && (
                          <p className="text-gray-500">{role.description}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </fieldset>
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
          {isEditMode ? 'Update Staff' : 'Create Staff'}
        </Button>
      </div>
    </form>
  );
};

export default StaffForm;