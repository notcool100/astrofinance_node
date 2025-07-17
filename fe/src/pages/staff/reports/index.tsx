import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Select from '@/components/common/Select';
import DatePicker from '@/components/common/DatePicker';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import {
  DocumentArrowDownIcon,
  ChartBarIcon,
  TableCellsIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

// Mock data service
const fetchReportTypes = async () => {
  // This would be replaced with an actual API call
  // return apiService.get('/staff/reports/types');
  
  // Mock data for now
  return [
    {
      id: '1',
      name: 'Loan Disbursement Report',
      description: 'Report on all loans disbursed within a time period',
      availableFormats: ['PDF', 'EXCEL', 'CSV'],
    },
    {
      id: '2',
      name: 'Loan Collection Report',
      description: 'Report on loan repayments collected within a time period',
      availableFormats: ['PDF', 'EXCEL', 'CSV'],
    },
    {
      id: '3',
      name: 'User Registration Report',
      description: 'Report on new user registrations within a time period',
      availableFormats: ['PDF', 'EXCEL'],
    },
    {
      id: '4',
      name: 'Loan Application Status Report',
      description: 'Report on the status of loan applications within a time period',
      availableFormats: ['PDF', 'EXCEL', 'CSV'],
    },
    {
      id: '5',
      name: 'Overdue Loans Report',
      description: 'Report on loans with overdue payments',
      availableFormats: ['PDF', 'EXCEL', 'CSV'],
    },
  ];
};

// Mock data service for recent reports
const fetchRecentReports = async () => {
  // This would be replaced with an actual API call
  // return apiService.get('/staff/reports/recent');
  
  // Mock data for now
  return [
    {
      id: '1',
      name: 'Loan Disbursement Report - May 2023',
      type: 'Loan Disbursement Report',
      format: 'PDF',
      createdAt: '2023-06-01T10:30:00Z',
      createdBy: 'John Doe',
      downloadUrl: '#',
    },
    {
      id: '2',
      name: 'Loan Collection Report - May 2023',
      type: 'Loan Collection Report',
      format: 'EXCEL',
      createdAt: '2023-06-01T11:45:00Z',
      createdBy: 'John Doe',
      downloadUrl: '#',
    },
    {
      id: '3',
      name: 'User Registration Report - Q2 2023',
      type: 'User Registration Report',
      format: 'PDF',
      createdAt: '2023-07-02T09:15:00Z',
      createdBy: 'Jane Smith',
      downloadUrl: '#',
    },
    {
      id: '4',
      name: 'Overdue Loans Report - June 2023',
      type: 'Overdue Loans Report',
      format: 'CSV',
      createdAt: '2023-07-01T14:20:00Z',
      createdBy: 'John Doe',
      downloadUrl: '#',
    },
  ];
};

const StaffReports = () => {
  const router = useRouter();
  const [selectedReportType, setSelectedReportType] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedFormat, setSelectedFormat] = useState('PDF');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Fetch report types
  const { data: reportTypes, isLoading: isLoadingReportTypes } = useQuery(
    'reportTypes',
    fetchReportTypes
  );
  
  // Fetch recent reports
  const { data: recentReports, isLoading: isLoadingRecentReports } = useQuery(
    'recentReports',
    fetchRecentReports
  );
  
  // Get selected report type details
  const selectedReport = reportTypes?.find(report => report.id === selectedReportType);
  
  // Handle report generation
  const handleGenerateReport = async () => {
    if (!selectedReportType || !startDate || !endDate) {
      alert('Please select a report type, start date, and end date');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // This would be replaced with an actual API call
      // const response = await apiService.post('/staff/reports/generate', {
      //   reportTypeId: selectedReportType,
      //   startDate: startDate.toISOString(),
      //   endDate: endDate.toISOString(),
      //   format: selectedFormat,
      // });
      
      // For now, just simulate a successful report generation
      setTimeout(() => {
        alert('Report generated successfully!');
        setIsGenerating(false);
      }, 2000);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
      setIsGenerating(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const isLoading = isLoadingReportTypes || isLoadingRecentReports;
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute staffOnly>
      <MainLayout title="Reports">
        <div className="space-y-6">
          {/* Generate Report Card */}
          <Card>
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Generate Report</h2>
              <p className="mt-1 text-sm text-gray-500">
                Select report parameters to generate a new report.
              </p>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label htmlFor="reportType" className="block text-sm font-medium text-gray-700">
                    Report Type
                  </label>
                  <Select
                    id="reportType"
                    name="reportType"
                    value={selectedReportType}
                    onChange={(e) => setSelectedReportType(e.target.value)}
                    options={
                      reportTypes?.map((type) => ({
                        value: type.id,
                        label: type.name,
                      })) || []
                    }
                    placeholder="Select report type"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <DatePicker
                    id="startDate"
                    selected={startDate}
                    onChange={setStartDate}
                    maxDate={endDate || undefined}
                    placeholderText="Select start date"
                    className="mt-1 w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <DatePicker
                    id="endDate"
                    selected={endDate}
                    onChange={setEndDate}
                    minDate={startDate || undefined}
                    placeholderText="Select end date"
                    className="mt-1 w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="format" className="block text-sm font-medium text-gray-700">
                    Format
                  </label>
                  <Select
                    id="format"
                    name="format"
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    options={
                      selectedReport?.availableFormats.map((format) => ({
                        value: format,
                        label: format,
                      })) || [
                        { value: 'PDF', label: 'PDF' },
                        { value: 'EXCEL', label: 'Excel' },
                        { value: 'CSV', label: 'CSV' },
                      ]
                    }
                    disabled={!selectedReport}
                    className="mt-1"
                  />
                </div>
              </div>
              
              {selectedReport && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-700">{selectedReport.description}</p>
                </div>
              )}
              
              <div className="mt-6 flex justify-end">
                <Button
                  variant="primary"
                  onClick={handleGenerateReport}
                  isLoading={isGenerating}
                  disabled={!selectedReportType || !startDate || !endDate}
                  className="flex items-center"
                >
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  Generate Report
                </Button>
              </div>
            </div>
          </Card>
          
          {/* Recent Reports Card */}
          <Card>
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Recent Reports</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // This would be replaced with an actual API call to refresh the list
                    // queryClient.invalidateQueries('recentReports');
                  }}
                  className="flex items-center"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Report Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Format
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Created
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Created By
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentReports?.map((report) => (
                    <tr key={report.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {report.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {report.format}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(report.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.createdBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a
                          href={report.downloadUrl}
                          className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                        >
                          <DocumentArrowDownIcon className="h-5 w-5 mr-1" />
                          Download
                        </a>
                      </td>
                    </tr>
                  ))}
                  
                  {recentReports?.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                        No recent reports found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
          
          {/* Report Templates Card */}
          <Card>
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Report Templates</h2>
              <p className="mt-1 text-sm text-gray-500">
                Quick access to commonly used report templates.
              </p>
            </div>
            
            <div className="p-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <TableCellsIcon className="h-6 w-6 text-primary-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">Daily Collection Report</h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Summary of all collections made today
                    </p>
                    <button
                      className="mt-2 inline-flex items-center text-xs font-medium text-primary-600 hover:text-primary-500"
                      onClick={() => {
                        // Set up the form with predefined values for this template
                        const today = new Date();
                        setSelectedReportType('2'); // Loan Collection Report
                        setStartDate(today);
                        setEndDate(today);
                        setSelectedFormat('PDF');
                      }}
                    >
                      Generate Now
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <TableCellsIcon className="h-6 w-6 text-primary-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">Monthly Disbursement Report</h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Summary of all loans disbursed this month
                    </p>
                    <button
                      className="mt-2 inline-flex items-center text-xs font-medium text-primary-600 hover:text-primary-500"
                      onClick={() => {
                        // Set up the form with predefined values for this template
                        const today = new Date();
                        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                        setSelectedReportType('1'); // Loan Disbursement Report
                        setStartDate(firstDayOfMonth);
                        setEndDate(today);
                        setSelectedFormat('PDF');
                      }}
                    >
                      Generate Now
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <TableCellsIcon className="h-6 w-6 text-primary-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">Current Overdue Loans</h3>
                    <p className="mt-1 text-xs text-gray-500">
                      List of all loans with overdue payments
                    </p>
                    <button
                      className="mt-2 inline-flex items-center text-xs font-medium text-primary-600 hover:text-primary-500"
                      onClick={() => {
                        // Set up the form with predefined values for this template
                        setSelectedReportType('5'); // Overdue Loans Report
                        setStartDate(null);
                        setEndDate(null);
                        setSelectedFormat('EXCEL');
                      }}
                    >
                      Generate Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default StaffReports;