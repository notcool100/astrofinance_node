import React from 'react';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { fetchStaffUserDetails } from '@/services/users.service';
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline';

const UserDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Fetch user details
  const { data, isLoading, error } = useQuery(
    ['userDetails', id],
    () => fetchStaffUserDetails(id as string),
    {
      enabled: isAuthenticated && !!id,
      retry: 1
    }
  );

  const handleBack = () => {
    router.push('/staff/users');
  };

  const handleEdit = () => {
    router.push(`/staff/users/${id}/edit`);
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <ProtectedRoute staffOnly>
        <MainLayout title="User Details">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  if (error || !data) {
    return (
      <ProtectedRoute staffOnly>
        <MainLayout title="User Details">
          <Card>
            <div className="p-6 text-center">
              <h3 className="text-lg font-medium text-gray-900">Error Loading User</h3>
              <p className="mt-2 text-sm text-gray-500">
                {error instanceof Error ? error.message : 'Failed to load user details.'}
              </p>
              <div className="mt-6">
                <Button variant="primary" onClick={handleBack}>
                  Back to Users
                </Button>
              </div>
            </div>
          </Card>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const { user } = data;

  return (
    <ProtectedRoute staffOnly>
      <MainLayout title={`User: ${user.fullName}`}>
        <div className="space-y-6">
          {/* Header with actions */}
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={handleBack} className="flex items-center">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Users
            </Button>
            <Button variant="primary" onClick={handleEdit} className="flex items-center">
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit User
            </Button>
          </div>

          {/* User Profile */}
          <Card title="User Profile">
            <div className="p-6">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 flex justify-center md:justify-start">
                  <div className="h-32 w-32 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-800 text-3xl font-medium">
                      {user.fullName.split(' ').map(name => name[0]).join('')}
                    </span>
                  </div>
                </div>
                <div className="md:w-2/3 mt-6 md:mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                      <p className="mt-1 text-sm text-gray-900">{user.fullName}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Email</h3>
                      <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Contact Number</h3>
                      <p className="mt-1 text-sm text-gray-900">{user.contactNumber}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Status</h3>
                      <div className="mt-1">
                        <Badge
                          color={user.isActive ? 'green' : 'red'}
                          text={user.isActive ? 'Active' : 'Inactive'}
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Address</h3>
                      <p className="mt-1 text-sm text-gray-900">{user.address || 'Not provided'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Date of Birth</h3>
                      <p className="mt-1 text-sm text-gray-900">
                        {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Created At</h3>
                      <p className="mt-1 text-sm text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                      <p className="mt-1 text-sm text-gray-900">{new Date(user.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Loans */}
          <Card title="Loans">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loan Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Outstanding
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {user.loans && user.loans.length > 0 ? (
                    user.loans.map((loan) => (
                      <tr key={loan.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {loan.loanType.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${loan.principalAmount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${loan.outstandingPrincipal.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            color={
                              loan.status === 'ACTIVE'
                                ? 'green'
                                : loan.status === 'PENDING'
                                ? 'yellow'
                                : loan.status === 'COMPLETED'
                                ? 'blue'
                                : 'red'
                            }
                            text={loan.status}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(loan.startDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(loan.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <a
                            href={`/staff/loans/${loan.id}`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            View
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                        No loans found for this user.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Loan Applications */}
          <Card title="Loan Applications">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Application ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {user.loanApplications && user.loanApplications.length > 0 ? (
                    user.loanApplications.map((application) => (
                      <tr key={application.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {application.id.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${application.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            color={
                              application.status === 'APPROVED'
                                ? 'green'
                                : application.status === 'PENDING'
                                ? 'yellow'
                                : application.status === 'REJECTED'
                                ? 'red'
                                : 'gray'
                            }
                            text={application.status}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(application.appliedDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <a
                            href={`/staff/applications/${application.id}`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            View
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        No loan applications found for this user.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Documents */}
          <Card title="Documents">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Upload Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {user.documents && user.documents.length > 0 ? (
                    user.documents.map((document) => (
                      <tr key={document.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {document.documentType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {document.fileName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(document.uploadDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <a
                            href={document.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-900 mr-4"
                          >
                            View
                          </a>
                          <a
                            href={document.fileUrl}
                            download
                            className="text-primary-600 hover:text-primary-900"
                          >
                            Download
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                        No documents found for this user.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};



export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await import('next-i18next/serverSideTranslations').then(m => 
        m.serverSideTranslations(locale, ['common', 'user', 'auth'])
      )),
    },
  };
}

export default UserDetailPage;
