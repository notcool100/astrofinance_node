import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import loanService, { LoanApplication } from '@/services/loanService';
import { ArrowLeftIcon, DocumentArrowUpIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import DocumentUploadModal from '@/components/modals/DocumentUploadModal';

const ApplicationStatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'PENDING':
      return <Badge variant="primary">Pending</Badge>;
    case 'APPROVED':
      return <Badge variant="success">Approved</Badge>;
    case 'REJECTED':
      return <Badge variant="danger">Rejected</Badge>;
    case 'DISBURSED':
      return <Badge variant="info">Disbursed</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const LoanApplicationDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch loan application details
  const { data: application, isLoading, refetch } = useQuery(
    ['loanApplication', id],
    () => loanService.getLoanApplicationById(id as string),
    {
      enabled: !!id,
      onError: (error) => {
        toast.error('Failed to load application details');
        console.error('Error fetching application:', error);
      },
    }
  );

  // Mock data for now
  const mockApplication: LoanApplication = {
    id: id as string || 'LA-1001',
    userId: 'user-1',
    loanTypeId: '1',
    amount: 10000,
    tenure: 12,
    purpose: 'Home renovation',
    status: 'PENDING',
    applicationDate: new Date().toISOString(),
    loanType: {
      id: '1',
      name: 'Personal Loan',
      code: 'PL',
      interestType: 'FLAT',
      minAmount: 1000,
      maxAmount: 50000,
      minTenure: 3,
      maxTenure: 36,
      interestRate: 12,
      processingFeePercent: 2,
      lateFeeAmount: 500,
      isActive: true,
    },
  };

  const handleUploadDocuments = () => {
    setIsUploadModalOpen(true);
  };

  const handleDocumentUpload = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      // In a real implementation, we would call the API
      // await loanService.uploadLoanDocument(id as string, formData);
      
      // Mock success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Documents uploaded successfully');
      setIsUploadModalOpen(false);
      refetch();
    } catch (error) {
      toast.error('Failed to upload documents');
      console.error('Error uploading documents:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelApplication = async () => {
    if (!confirm('Are you sure you want to cancel this application?')) return;
    
    setIsSubmitting(true);
    try {
      // In a real implementation, we would call the API
      // await loanService.updateLoanApplicationStatus(id as string, { status: 'CANCELLED' });
      
      // Mock success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Application cancelled successfully');
      router.push('/loans/applications');
    } catch (error) {
      toast.error('Failed to cancel application');
      console.error('Error cancelling application:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Use mock data for now
  const applicationData = application || mockApplication;

  return (
    <ProtectedRoute>
      <MainLayout title={`Loan Application ${applicationData.id}`}>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Button
                variant="secondary"
                className="mr-4"
                onClick={() => router.push('/loans/applications')}
              >
                <ArrowLeftIcon className="h-5 w-5 mr-1" />
                Back to Applications
              </Button>
              <h1 className="text-2xl font-semibold text-gray-900">
                Application {applicationData.id}
              </h1>
            </div>
            <div className="flex space-x-2">
              {applicationData.status === 'APPROVED' && (
                <Button
                  variant="primary"
                  icon={<DocumentArrowUpIcon className="h-5 w-5 mr-1" />}
                  onClick={handleUploadDocuments}
                >
                  Upload Documents
                </Button>
              )}
              {applicationData.status === 'PENDING' && (
                <Button
                  variant="danger"
                  icon={<XCircleIcon className="h-5 w-5 mr-1" />}
                  onClick={handleCancelApplication}
                  isLoading={isSubmitting}
                >
                  Cancel Application
                </Button>
              )}
            </div>
          </div>

          <Card>
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Application Details</h3>
                <ApplicationStatusBadge status={applicationData.status} />
              </div>

              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Loan Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">{applicationData.loanType?.name || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Application Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(applicationData.applicationDate).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Loan Amount</dt>
                  <dd className="mt-1 text-sm text-gray-900">${applicationData.amount.toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tenure</dt>
                  <dd className="mt-1 text-sm text-gray-900">{applicationData.tenure} months</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Interest Rate</dt>
                  <dd className="mt-1 text-sm text-gray-900">{applicationData.loanType?.interestRate}% per annum</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Interest Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {applicationData.loanType?.interestType === 'FLAT' ? 'Flat Rate' : 'Reducing Balance'}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Purpose</dt>
                  <dd className="mt-1 text-sm text-gray-900">{applicationData.purpose}</dd>
                </div>
                {applicationData.notes && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Notes</dt>
                    <dd className="mt-1 text-sm text-gray-900">{applicationData.notes}</dd>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card title="Application Timeline">
            <div className="px-4 py-5 sm:p-6">
              <div className="flow-root">
                <ul className="-mb-8">
                  <li>
                    <div className="relative pb-8">
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center ring-8 ring-white">
                            <CheckCircleIcon className="h-5 w-5 text-white" aria-hidden="true" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              Application <span className="font-medium text-gray-900">submitted</span>
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {new Date(applicationData.applicationDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                  
                  {applicationData.status !== 'PENDING' && (
                    <li>
                      <div className="relative pb-8">
                        {applicationData.status === 'APPROVED' && (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                              applicationData.status === 'APPROVED' ? 'bg-green-500' : 'bg-red-500'
                            }`}>
                              {applicationData.status === 'APPROVED' ? (
                                <CheckCircleIcon className="h-5 w-5 text-white" aria-hidden="true" />
                              ) : (
                                <XCircleIcon className="h-5 w-5 text-white" aria-hidden="true" />
                              )}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                Application <span className="font-medium text-gray-900">
                                  {applicationData.status === 'APPROVED' ? 'approved' : 'rejected'}
                                </span>
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              {/* In a real app, we would use the actual approval/rejection date */}
                              {new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  )}
                  
                  {applicationData.status === 'DISBURSED' && (
                    <li>
                      <div className="relative">
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                              <CheckCircleIcon className="h-5 w-5 text-white" aria-hidden="true" />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                Loan <span className="font-medium text-gray-900">disbursed</span>
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              {/* In a real app, we would use the actual disbursement date */}
                              {new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </Card>

          {applicationData.status === 'PENDING' && (
            <Card title="What's Next?">
              <div className="px-4 py-5 sm:p-6">
                <p className="text-sm text-gray-500">
                  Your application is currently under review. This process typically takes 1-2 business days.
                  You will be notified once a decision has been made.
                </p>
                <div className="mt-4 flex items-center">
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pending Review
                  </div>
                </div>
              </div>
            </Card>
          )}

          {applicationData.status === 'APPROVED' && (
            <Card title="Next Steps">
              <div className="px-4 py-5 sm:p-6">
                <p className="text-sm text-gray-500">
                  Congratulations! Your loan application has been approved. Please upload the required documents
                  to proceed with the loan disbursement.
                </p>
                <div className="mt-4">
                  <Button
                    variant="primary"
                    icon={<DocumentArrowUpIcon className="h-5 w-5 mr-1" />}
                    onClick={handleUploadDocuments}
                  >
                    Upload Documents
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {applicationData.status === 'REJECTED' && (
            <Card title="Application Status">
              <div className="px-4 py-5 sm:p-6">
                <p className="text-sm text-gray-500">
                  We regret to inform you that your loan application has been rejected.
                  {applicationData.notes && (
                    <span> Reason: <strong>{applicationData.notes}</strong></span>
                  )}
                </p>
                <div className="mt-4">
                  <Button
                    variant="primary"
                    onClick={() => router.push('/loans/apply')}
                  >
                    Apply for a New Loan
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {applicationData.status === 'DISBURSED' && (
            <Card title="Loan Disbursed">
              <div className="px-4 py-5 sm:p-6">
                <p className="text-sm text-gray-500">
                  Your loan has been successfully disbursed. You can view the loan details and repayment schedule
                  in the Loans section.
                </p>
                <div className="mt-4">
                  <Button
                    variant="primary"
                    onClick={() => router.push('/loans')}
                  >
                    View My Loans
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        <DocumentUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUpload={handleDocumentUpload}
          isSubmitting={isSubmitting}
          requiredDocuments={[
            { id: 'identity', name: 'Identity Proof', description: 'Aadhar Card, PAN Card, Passport, etc.' },
            { id: 'address', name: 'Address Proof', description: 'Utility Bill, Rental Agreement, etc.' },
            { id: 'income', name: 'Income Proof', description: 'Salary Slips, Bank Statements, etc.' },
            { id: 'photo', name: 'Photograph', description: 'Recent passport-sized photograph' },
          ]}
        />
      </MainLayout>
    </ProtectedRoute>
  );
};

export default LoanApplicationDetailPage;