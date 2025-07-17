import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { BellIcon, MoonIcon, SunIcon, LanguageIcon } from '@heroicons/react/24/outline';

// Form validation schema for notification settings
const notificationSchema = yup.object().shape({
  emailNotifications: yup.boolean(),
  smsNotifications: yup.boolean(),
  pushNotifications: yup.boolean(),
  loanApplications: yup.boolean(),
  loanApprovals: yup.boolean(),
  paymentReminders: yup.boolean(),
  systemUpdates: yup.boolean(),
});

// Form validation schema for appearance settings
const appearanceSchema = yup.object().shape({
  theme: yup.string().required('Theme is required'),
  fontSize: yup.string().required('Font size is required'),
  language: yup.string().required('Language is required'),
  compactMode: yup.boolean(),
});

interface NotificationFormData {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  loanApplications: boolean;
  loanApprovals: boolean;
  paymentReminders: boolean;
  systemUpdates: boolean;
}

interface AppearanceFormData {
  theme: string;
  fontSize: string;
  language: string;
  compactMode: boolean;
}

const StaffSettings = () => {
  const [activeTab, setActiveTab] = useState('notifications');
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);
  const [isUpdatingAppearance, setIsUpdatingAppearance] = useState(false);
  const [notificationSuccess, setNotificationSuccess] = useState(false);
  const [appearanceSuccess, setAppearanceSuccess] = useState(false);
  
  // Notification form setup
  const {
    register: registerNotification,
    handleSubmit: handleSubmitNotification,
    formState: { errors: notificationErrors },
  } = useForm({
    resolver: yupResolver(notificationSchema),
    defaultValues: {
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: false,
      loanApplications: true,
      loanApprovals: true,
      paymentReminders: true,
      systemUpdates: false,
    },
  });
  
  // Appearance form setup
  const {
    register: registerAppearance,
    handleSubmit: handleSubmitAppearance,
    formState: { errors: appearanceErrors },
  } = useForm({
    resolver: yupResolver(appearanceSchema),
    defaultValues: {
      theme: 'light',
      fontSize: 'medium',
      language: 'en',
      compactMode: false,
    },
  });
  
  // Handle notification settings update
  const onUpdateNotifications = async (data: any) => {
    // Type assertion to ensure we have the expected properties
    const notificationData: NotificationFormData = {
      emailNotifications: !!data.emailNotifications,
      smsNotifications: !!data.smsNotifications,
      pushNotifications: !!data.pushNotifications,
      loanApplications: !!data.loanApplications,
      loanApprovals: !!data.loanApprovals,
      paymentReminders: !!data.paymentReminders,
      systemUpdates: !!data.systemUpdates,
    };
    setIsUpdatingNotifications(true);
    setNotificationSuccess(false);
    
    try {
      // This would be replaced with an actual API call
      // await settingsService.updateNotificationSettings(notificationData);
      
      // For now, just simulate a successful update
      console.log('Notification settings updated:', notificationData);
      
      setNotificationSuccess(true);
      setTimeout(() => setNotificationSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      alert('Failed to update notification settings. Please try again.');
    } finally {
      setIsUpdatingNotifications(false);
    }
  };
  
  // Handle appearance settings update
  const onUpdateAppearance = async (data: any) => {
    // Type assertion to ensure we have the expected properties
    const appearanceData: AppearanceFormData = {
      theme: data.theme,
      fontSize: data.fontSize,
      language: data.language,
      compactMode: !!data.compactMode,
    };
    setIsUpdatingAppearance(true);
    setAppearanceSuccess(false);
    
    try {
      // This would be replaced with an actual API call
      // await settingsService.updateAppearanceSettings(appearanceData);
      
      // For now, just simulate a successful update
      console.log('Appearance settings updated:', appearanceData);
      
      setAppearanceSuccess(true);
      setTimeout(() => setAppearanceSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating appearance settings:', error);
      alert('Failed to update appearance settings. Please try again.');
    } finally {
      setIsUpdatingAppearance(false);
    }
  };
  
  return (
    <ProtectedRoute staffOnly>
      <MainLayout title="Settings">
        <div className="space-y-6">
          <Card>
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  className={`py-4 px-6 border-b-2 font-medium text-sm ${
                    activeTab === 'notifications'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('notifications')}
                >
                  <BellIcon className="h-5 w-5 inline mr-2" />
                  Notification Settings
                </button>
                <button
                  className={`py-4 px-6 border-b-2 font-medium text-sm ${
                    activeTab === 'appearance'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('appearance')}
                >
                  <SunIcon className="h-5 w-5 inline mr-2" />
                  Appearance Settings
                </button>
              </nav>
            </div>
            
            <div className="p-6">
              {activeTab === 'notifications' ? (
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Notification Settings</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Configure how and when you receive notifications.
                  </p>
                  
                  {notificationSuccess && (
                    <div className="mt-4 p-4 rounded-md bg-green-50">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-green-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-green-800">
                            Notification settings updated successfully!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmitNotification(onUpdateNotifications)} className="mt-6 space-y-6">
                    <div>
                      <h3 className="text-md font-medium text-gray-900">Notification Channels</h3>
                      <div className="mt-4 space-y-4">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="emailNotifications"
                              type="checkbox"
                              className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                              {...registerNotification('emailNotifications')}
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="emailNotifications" className="font-medium text-gray-700">
                              Email Notifications
                            </label>
                            <p className="text-gray-500">Receive notifications via email.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="smsNotifications"
                              type="checkbox"
                              className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                              {...registerNotification('smsNotifications')}
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="smsNotifications" className="font-medium text-gray-700">
                              SMS Notifications
                            </label>
                            <p className="text-gray-500">Receive notifications via SMS.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="pushNotifications"
                              type="checkbox"
                              className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                              {...registerNotification('pushNotifications')}
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="pushNotifications" className="font-medium text-gray-700">
                              Push Notifications
                            </label>
                            <p className="text-gray-500">Receive push notifications in the browser.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-md font-medium text-gray-900">Notification Types</h3>
                      <div className="mt-4 space-y-4">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="loanApplications"
                              type="checkbox"
                              className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                              {...registerNotification('loanApplications')}
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="loanApplications" className="font-medium text-gray-700">
                              Loan Applications
                            </label>
                            <p className="text-gray-500">Notifications about new loan applications.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="loanApprovals"
                              type="checkbox"
                              className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                              {...registerNotification('loanApprovals')}
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="loanApprovals" className="font-medium text-gray-700">
                              Loan Approvals
                            </label>
                            <p className="text-gray-500">Notifications about loan approval status changes.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="paymentReminders"
                              type="checkbox"
                              className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                              {...registerNotification('paymentReminders')}
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="paymentReminders" className="font-medium text-gray-700">
                              Payment Reminders
                            </label>
                            <p className="text-gray-500">Notifications about upcoming and overdue payments.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="systemUpdates"
                              type="checkbox"
                              className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                              {...registerNotification('systemUpdates')}
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="systemUpdates" className="font-medium text-gray-700">
                              System Updates
                            </label>
                            <p className="text-gray-500">Notifications about system updates and maintenance.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-5">
                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          variant="primary"
                          isLoading={isUpdatingNotifications}
                        >
                          Save Settings
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              ) : (
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Appearance Settings</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Customize the appearance of the application.
                  </p>
                  
                  {appearanceSuccess && (
                    <div className="mt-4 p-4 rounded-md bg-green-50">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-green-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-green-800">
                            Appearance settings updated successfully!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmitAppearance(onUpdateAppearance)} className="mt-6 space-y-6">
                    <div>
                      <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
                        Theme
                      </label>
                      <div className="mt-1">
                        <select
                          id="theme"
                          className="form-select block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                          {...registerAppearance('theme')}
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="system">System Default</option>
                        </select>
                      </div>
                      {appearanceErrors.theme && (
                        <p className="mt-2 text-sm text-red-600">{appearanceErrors.theme.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="fontSize" className="block text-sm font-medium text-gray-700">
                        Font Size
                      </label>
                      <div className="mt-1">
                        <select
                          id="fontSize"
                          className="form-select block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                          {...registerAppearance('fontSize')}
                        >
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                        </select>
                      </div>
                      {appearanceErrors.fontSize && (
                        <p className="mt-2 text-sm text-red-600">{appearanceErrors.fontSize.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                        Language
                      </label>
                      <div className="mt-1">
                        <select
                          id="language"
                          className="form-select block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                          {...registerAppearance('language')}
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                          <option value="zh">Chinese</option>
                        </select>
                      </div>
                      {appearanceErrors.language && (
                        <p className="mt-2 text-sm text-red-600">{appearanceErrors.language.message}</p>
                      )}
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="compactMode"
                          type="checkbox"
                          className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                          {...registerAppearance('compactMode')}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="compactMode" className="font-medium text-gray-700">
                          Compact Mode
                        </label>
                        <p className="text-gray-500">Use a more compact layout to fit more content on screen.</p>
                      </div>
                    </div>
                    
                    <div className="pt-5">
                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          variant="primary"
                          isLoading={isUpdatingAppearance}
                        >
                          Save Settings
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default StaffSettings;