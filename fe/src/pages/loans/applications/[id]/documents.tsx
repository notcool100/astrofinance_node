import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import loanService, { LoanApplication, LoanDocument } from '@/services/loanService';
import { ArrowLeftIcon, DocumentArrowUpIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface DocumentType {
  id: string;
  name: string;
  description: string;
  required: boolean;
}

const DocumentStatus = {
  PENDING: 'PENDING',
  UPLOADED: 'UPLOADED',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
};

const LoanDocumentsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Fetch loan application details
  const { data: application, isLoading: isLoadingApplication, refetch: refetchApplication } = useQuery(
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

  // Fetch uploaded documents
  const { data: documents, isLoading: isLoadingDocuments, refetch: refetchDocuments } = useQuery(
    ['loanDocuments', id],
    () => loanService.getLoanDocuments(id as string),
    {
      enabled: !!id,
      onError: (error) => {
        toast.error('Failed to load documents');
        console.error('Error fetching documents:', error);
      },
    }
  );

  // Required document types
  const documentTypes: DocumentType[] = [
    {
      id: 'identity',
      name: 'Identity Proof',
      description: 'Aadhar Card, PAN Card, Passport, Voter ID, or Driving License',
      required: true,
    },
    {
      id: 'address',
      name: 'Address Proof',
      description: 'Utility Bill, Rental Agreement, Passport, or Aadhar Card',
      required: true,
    },
    {
      id: 'income',
      name: 'Income Proof',
      description: 'Salary Slips (3 months), Bank Statements (6 months), or Income Tax Returns',
      required: true,
    },
    {
      id: 'photo',
      name: 'Photograph',
      description: 'Recent passport-sized photograph',
      required: true,
    },
    {
      id: 'bank',
      name: 'Bank Statement',
      description: 'Last 6 months bank statement',
      required: true,
    },
    {
      id: 'employment',
      name: 'Employment Proof',
      description: 'Employment ID Card, Appointment Letter, or Business Registration',
      required: false,
    },
  ];

  // Mock documents for now
  const mockDocuments: LoanDocument[] = [
    {
      id: 'doc-1',
      loanApplicationId: id as string,
      documentType: 'identity',
      documentUrl: 'https://example.com/documents/identity.pdf',
      uploadDate: new Date().toISOString(),
      status: DocumentStatus.VERIFIED,
      verificationDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      verificationNotes: 'Document verified successfully',
    },
    {
      id: 'doc-2',
      loanApplicationId: id as string,
      documentType: 'address',
      documentUrl: 'https://example.com/documents/address.pdf',
      uploadDate: new Date().toISOString(),
      status: DocumentStatus.UPLOADED,
      verificationDate: null,
      verificationNotes: null,
    },
  ];

  const uploadedDocuments = documents || mockDocuments;

  const getDocumentStatus = (documentType: string) => {
    const doc = uploadedDocuments.find(d => d.documentType === documentType);
    return doc ? doc.status : null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedDocument || !uploadedFile) {
      toast.error('Please select a document to upload');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('documentType', selectedDocument.id);

      // In a real implementation, we would call the API
      // await loanService.uploadLoanDocument(id as string, formData);
      
      // Mock success
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`${selectedDocument.name} uploaded successfully`);
      setSelectedDocument(null);
      setUploadedFile(null);
      refetchDocuments();
    } catch (error) {
      toast.error('Failed to upload document');
      console.error('Error uploading document:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelUpload = () => {
    setSelectedDocument(null);
    setUploadedFile(null);
  };

  const handleSubmitAll = async () => {
    // Check if all required documents are uploaded
    const missingDocuments = documentTypes
      .filter(doc => doc.required)
      .filter(doc => !getDocumentStatus(doc.id));

    if (missingDocuments.length > 0) {
      toast.error(`Please upload all required documents: ${missingDocuments.map(d => d.name).join(', ')}`);
      return;
    }

    try {
      // In a real implementation, we would call the API
      // await loanService.submitDocuments(id as string);
      
      // Mock success
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('All documents submitted successfully');
      
      // Redirect to application status page after a delay
      setTimeout(() => {
        router.push(`/loans/applications/${id}`);
      }, 1500);
    } catch (error) {
      toast.error('Failed to submit documents');
      console.error('Error submitting documents:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoadingApplication) {
    return (
      <ProtectedRoute>
        <MainLayout title="Loan Documents">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout title="Loan Documents">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Button
                variant="secondary"
                className="mr-4"
                onClick={() => router.push(`/loans/applications/${id}`)}
              >
                <ArrowLeftIcon className="h-5 w-5 mr-1" />
                Back to Application
              </Button>
              <h1 className="text-2xl font-semibold text-gray-900">
                Upload Documents
              </h1>
            </div>
          </div>

          <Card>
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Application Information</h3>
              
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Application ID</dt>
                  <dd className="mt-1 text-sm text-gray-900">{application?.id || id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Loan Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">{application?.loanType?.name || 'Personal Loan'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Loan Amount</dt>
                  <dd className="mt-1 text-sm text-gray-900">${application?.amount.toLocaleString() || '10,000'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900">{application?.status || 'APPROVED'}</dd>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Required Documents</h3>
                <p className="text-sm text-gray-500">
                  Upload all required documents to proceed with your loan application
                </p>
              </div>

              <div className="space-y-4">
                {documentTypes.map((docType) => {
                  const status = getDocumentStatus(docType.id);
                  return (
                    <div 
                      key={docType.id} 
                      className={`border rounded-lg p-4 ${
                        status === DocumentStatus.VERIFIED 
                          ? 'border-green-200 bg-green-50' 
                          : status === DocumentStatus.REJECTED 
                            ? 'border-red-200 bg-red-50' 
                            : status === DocumentStatus.UPLOADED 
                              ? 'border-yellow-200 bg-yellow-50' 
                              : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-3">
                          {status === DocumentStatus.VERIFIED ? (
                            <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                          ) : status === DocumentStatus.REJECTED ? (
                            <XCircleIcon className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                          ) : status === DocumentStatus.UPLOADED ? (
                            <div className="h-6 w-6 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-yellow-600 text-xs font-medium">!</span>
                            </div>
                          ) : (
                            <DocumentArrowUpIcon className="h-6 w-6 text-gray-400 flex-shrink-0 mt-0.5" />
                          )}
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              {docType.name}
                              {docType.required && <span className="text-red-500 ml-1">*</span>}
                            </h4>
                            <p className="mt-1 text-xs text-gray-500">{docType.description}</p>
                            
                            {status && (
                              <div className="mt-2">
                                {status === DocumentStatus.VERIFIED ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Verified
                                  </span>
                                ) : status === DocumentStatus.REJECTED ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    Rejected
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    Pending Verification
                                  </span>
                                )}
                                
                                {uploadedDocuments.find(d => d.documentType === docType.id)?.uploadDate && (
                                  <span className="ml-2 text-xs text-gray-500">
                                    Uploaded on {formatDate(uploadedDocuments.find(d => d.documentType === docType.id)?.uploadDate || '')}
                                  </span>
                                )}
                              </div>
                            )}
                            
                            {uploadedDocuments.find(d => d.documentType === docType.id)?.verificationNotes && (
                              <p className="mt-1 text-xs text-gray-600">
                                Note: {uploadedDocuments.find(d => d.documentType === docType.id)?.verificationNotes}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          {status ? (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setSelectedDocument(docType)}
                            >
                              Replace
                            </Button>
                          ) : (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => setSelectedDocument(docType)}
                            >
                              Upload
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-end">
                <Button
                  variant="primary"
                  onClick={handleSubmitAll}
                  disabled={documentTypes.filter(doc => doc.required).some(doc => !getDocumentStatus(doc.id))}
                >
                  Submit All Documents
                </Button>
              </div>
            </div>
          </Card>

          {selectedDocument && (
            <Card>
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  Upload {selectedDocument.name}
                </h3>
                
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    {selectedDocument.description}
                  </p>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
                    <DocumentArrowUpIcon className="h-12 w-12 text-gray-400" />
                    <div className="mt-4 flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleFileChange}
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, JPG, or PNG up to 5MB
                    </p>
                  </div>
                  
                  {uploadedFile && (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <DocumentArrowUpIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{uploadedFile.name}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {uploadedFile.size < 1024 * 1024
                            ? `${Math.round(uploadedFile.size / 1024)} KB`
                            : `${Math.round(uploadedFile.size / 1024 / 1024 * 10) / 10} MB`}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="secondary"
                      onClick={handleCancelUpload}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleUpload}
                      isLoading={isUploading}
                      disabled={!uploadedFile}
                    >
                      Upload Document
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default LoanDocumentsPage;