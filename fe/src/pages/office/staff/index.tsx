import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  KeyIcon 
} from '@heroicons/react/24/outline';
import MainLayout from '@/components/layout/MainLayout';
import Table from '@/components/common/Table';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import { getAllStaff, StaffProfile } from '@/services/staff.service';
import { formatDate } from '@/utils/dateUtils';

const StaffListPage: React.FC = () => {
  const router = useRouter();
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        const data = await getAllStaff();
        setStaff(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching staff:', err);
        setError('Failed to load staff data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge color="green" text="Active" />;
      case 'INACTIVE':
        return <Badge color="gray" text="Inactive" />;
      case 'SUSPENDED':
        return <Badge color="yellow" text="Suspended" />;
      case 'TERMINATED':
        return <Badge color="red" text="Terminated" />;
      default:
        return <Badge color="gray" text={status} />;
    }
  };

  const columns = [
    {
      header: 'Employee ID',
      accessor: 'employeeId',
    },
    {
      header: 'Name',
      accessor: 'name',
      cell: (row: StaffProfile) => `${row.firstName} ${row.lastName}`,
    },
    {
      header: 'Email',
      accessor: 'email',
    },
    {
      header: 'Department',
      accessor: 'department',
    },
    {
      header: 'Position',
      accessor: 'position',
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row: StaffProfile) => getStatusBadge(row.status),
    },
    {
      header: 'Join Date',
      accessor: 'joinDate',
      cell: (row: StaffProfile) => formatDate(row.joinDate),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row: StaffProfile) => (
        <div className="flex space-x-2">
          <Link href={`/office/staff/${row.id}`}>
            <Button
              variant="outline"
              size="sm"
              className="p-1"
              title="View Details"
            >
              <PencilSquareIcon className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/office/staff/${row.id}/reset-password`}>
            <Button
              variant="outline"
              size="sm"
              className="p-1"
              title="Reset Password"
            >
              <KeyIcon className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Staff Management</h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all staff members in the system including their details and status.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Link href="/office/staff/create">
              <Button variant="primary" className="flex items-center">
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Add Staff
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-md bg-red-50 p-4">
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

        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                {loading ? (
                  <div className="p-6 text-center">Loading staff data...</div>
                ) : staff.length === 0 ? (
                  <div className="p-6 text-center">No staff members found.</div>
                ) : (
                  <Table
                    columns={columns}
                    data={staff}
                    keyField="id"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default StaffListPage;