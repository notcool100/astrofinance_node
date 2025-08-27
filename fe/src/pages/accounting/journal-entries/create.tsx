import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { PlusIcon, MinusIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import MainLayout from '../../../components/layout/MainLayout';
import ProtectedRoute from '../../../components/common/ProtectedRoute';
import Button from '../../../components/common/Button';
import chartOfAccountsService, { Account } from '../../../services/chart-of-accounts.service';
import journalEntryService, { EntryLineInput } from '../../../services/journal-entry.service';

const CreateJournalEntryPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [formData, setFormData] = useState({
    entryDate: new Date().toISOString().split('T')[0],
    reference: '',
    description: '',
  });
  const [debitEntries, setDebitEntries] = useState<EntryLineInput[]>([
    { accountId: '', amount: '', description: '' }
  ]);
  const [creditEntries, setCreditEntries] = useState<EntryLineInput[]>([
    { accountId: '', amount: '', description: '' }
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const activeAccounts = await chartOfAccountsService.getAllAccounts(undefined, true);
      setAccounts(activeAccounts);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to fetch accounts');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleDebitEntryChange = (index: number, field: keyof EntryLineInput, value: string) => {
    const updatedEntries = [...debitEntries];
    updatedEntries[index] = {
      ...updatedEntries[index],
      [field]: value
    };
    setDebitEntries(updatedEntries);
    
    // Clear error
    const errorKey = `debit_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const handleCreditEntryChange = (index: number, field: keyof EntryLineInput, value: string) => {
    const updatedEntries = [...creditEntries];
    updatedEntries[index] = {
      ...updatedEntries[index],
      [field]: value
    };
    setCreditEntries(updatedEntries);
    
    // Clear error
    const errorKey = `credit_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const addDebitEntry = () => {
    setDebitEntries([...debitEntries, { accountId: '', amount: '', description: '' }]);
  };

  const removeDebitEntry = (index: number) => {
    if (debitEntries.length > 1) {
      const updatedEntries = [...debitEntries];
      updatedEntries.splice(index, 1);
      setDebitEntries(updatedEntries);
    }
  };

  const addCreditEntry = () => {
    setCreditEntries([...creditEntries, { accountId: '', amount: '', description: '' }]);
  };

  const removeCreditEntry = (index: number) => {
    if (creditEntries.length > 1) {
      const updatedEntries = [...creditEntries];
      updatedEntries.splice(index, 1);
      setCreditEntries(updatedEntries);
    }
  };

  const calculateTotalDebit = () => {
    return debitEntries.reduce((total, entry) => {
      const amount = parseFloat(entry.amount as string) || 0;
      return total + amount;
    }, 0);
  };

  const calculateTotalCredit = () => {
    return creditEntries.reduce((total, entry) => {
      const amount = parseFloat(entry.amount as string) || 0;
      return total + amount;
    }, 0);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.entryDate) {
      newErrors.entryDate = 'Entry date is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    // Validate debit entries
    debitEntries.forEach((entry, index) => {
      if (!entry.accountId) {
        newErrors[`debit_${index}_accountId`] = 'Account is required';
      }
      
      if (!entry.amount) {
        newErrors[`debit_${index}_amount`] = 'Amount is required';
      } else if (isNaN(parseFloat(entry.amount as string)) || parseFloat(entry.amount as string) <= 0) {
        newErrors[`debit_${index}_amount`] = 'Amount must be a positive number';
      }
    });
    
    // Validate credit entries
    creditEntries.forEach((entry, index) => {
      if (!entry.accountId) {
        newErrors[`credit_${index}_accountId`] = 'Account is required';
      }
      
      if (!entry.amount) {
        newErrors[`credit_${index}_amount`] = 'Amount is required';
      } else if (isNaN(parseFloat(entry.amount as string)) || parseFloat(entry.amount as string) <= 0) {
        newErrors[`credit_${index}_amount`] = 'Amount must be a positive number';
      }
    });
    
    // Check if debits equal credits
    const totalDebit = calculateTotalDebit();
    const totalCredit = calculateTotalCredit();
    
    if (totalDebit !== totalCredit) {
      newErrors.balance = 'Total debit must equal total credit';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setLoading(true);
    try {
      await journalEntryService.createJournalEntry({
        entryDate: formData.entryDate,
        reference: formData.reference || undefined,
        description: formData.description,
        debitEntries,
        creditEntries
      });
      
      toast.success('Journal entry created successfully');
      router.push('/accounting/journal-entries');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create journal entry');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/accounting/journal-entries');
  };

  const formatAmount = (amount: number) => {
    const formattedNumber = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    return `Rs ${formattedNumber}`;
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-6">
            <Button
              variant="secondary"
              className="mr-4"
              onClick={() => router.push('/accounting/journal-entries')}
            >
              <ArrowLeftIcon className="h-5 w-5 mr-1" />
              Back to Journal Entries
            </Button>
            <h1 className="text-2xl font-semibold text-gray-900">Create Journal Entry</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Journal Entry Details
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="entryDate" className="block text-sm font-medium text-gray-700">
                      Entry Date *
                    </label>
                    <input
                      type="date"
                      name="entryDate"
                      id="entryDate"
                      value={formData.entryDate}
                      onChange={handleChange}
                      className={`mt-1 block w-full border ${
                        errors.entryDate ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                    {errors.entryDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.entryDate}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="reference" className="block text-sm font-medium text-gray-700">
                      Reference
                    </label>
                    <input
                      type="text"
                      name="reference"
                      id="reference"
                      value={formData.reference}
                      onChange={handleChange}
                      placeholder="Optional reference number or code"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Enter a description for this journal entry"
                      className={`mt-1 block w-full border ${
                        errors.description ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Debit Entries
                  </h3>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={addDebitEntry}
                    className="flex items-center"
                  >
                    <PlusIcon className="h-5 w-5 mr-1" />
                    Add Debit Entry
                  </Button>
                </div>
              </div>
              <div className="px-4 py-5 sm:p-6">
                {debitEntries.map((entry, index) => (
                  <div key={`debit-${index}`} className="mb-4 p-4 border border-gray-200 rounded-md">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-md font-medium text-gray-700">Debit Entry #{index + 1}</h4>
                      {debitEntries.length > 1 && (
                        <Button
                          type="button"
                          variant="danger"
                          onClick={() => removeDebitEntry(index)}
                          className="flex items-center"
                          size="sm"
                        >
                          <MinusIcon className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor={`debit-account-${index}`} className="block text-sm font-medium text-gray-700">
                          Account *
                        </label>
                        <select
                          id={`debit-account-${index}`}
                          value={entry.accountId}
                          onChange={(e) => handleDebitEntryChange(index, 'accountId', e.target.value)}
                          className={`mt-1 block w-full border ${
                            errors[`debit_${index}_accountId`] ? 'border-red-300' : 'border-gray-300'
                          } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                        >
                          <option value="">Select Account</option>
                          {accounts.map(account => (
                            <option key={account.id} value={account.id}>
                              {account.accountCode} - {account.name}
                            </option>
                          ))}
                        </select>
                        {errors[`debit_${index}_accountId`] && (
                          <p className="mt-1 text-sm text-red-600">{errors[`debit_${index}_accountId`]}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor={`debit-amount-${index}`} className="block text-sm font-medium text-gray-700">
                          Amount *
                        </label>
                        <input
                          type="number"
                          id={`debit-amount-${index}`}
                          value={entry.amount}
                          onChange={(e) => handleDebitEntryChange(index, 'amount', e.target.value)}
                          step="0.01"
                          min="0.01"
                          placeholder="0.00"
                          className={`mt-1 block w-full border ${
                            errors[`debit_${index}_amount`] ? 'border-red-300' : 'border-gray-300'
                          } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                        />
                        {errors[`debit_${index}_amount`] && (
                          <p className="mt-1 text-sm text-red-600">{errors[`debit_${index}_amount`]}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor={`debit-description-${index}`} className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <input
                          type="text"
                          id={`debit-description-${index}`}
                          value={entry.description}
                          onChange={(e) => handleDebitEntryChange(index, 'description', e.target.value)}
                          placeholder="Optional description"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-4 text-right">
                  <p className="text-sm font-medium text-gray-700">
                    Total Debit: <span className="text-gray-900">{formatAmount(calculateTotalDebit())}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Credit Entries
                  </h3>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={addCreditEntry}
                    className="flex items-center"
                  >
                    <PlusIcon className="h-5 w-5 mr-1" />
                    Add Credit Entry
                  </Button>
                </div>
              </div>
              <div className="px-4 py-5 sm:p-6">
                {creditEntries.map((entry, index) => (
                  <div key={`credit-${index}`} className="mb-4 p-4 border border-gray-200 rounded-md">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-md font-medium text-gray-700">Credit Entry #{index + 1}</h4>
                      {creditEntries.length > 1 && (
                        <Button
                          type="button"
                          variant="danger"
                          onClick={() => removeCreditEntry(index)}
                          className="flex items-center"
                          size="sm"
                        >
                          <MinusIcon className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor={`credit-account-${index}`} className="block text-sm font-medium text-gray-700">
                          Account *
                        </label>
                        <select
                          id={`credit-account-${index}`}
                          value={entry.accountId}
                          onChange={(e) => handleCreditEntryChange(index, 'accountId', e.target.value)}
                          className={`mt-1 block w-full border ${
                            errors[`credit_${index}_accountId`] ? 'border-red-300' : 'border-gray-300'
                          } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                        >
                          <option value="">Select Account</option>
                          {accounts.map(account => (
                            <option key={account.id} value={account.id}>
                              {account.accountCode} - {account.name}
                            </option>
                          ))}
                        </select>
                        {errors[`credit_${index}_accountId`] && (
                          <p className="mt-1 text-sm text-red-600">{errors[`credit_${index}_accountId`]}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor={`credit-amount-${index}`} className="block text-sm font-medium text-gray-700">
                          Amount *
                        </label>
                        <input
                          type="number"
                          id={`credit-amount-${index}`}
                          value={entry.amount}
                          onChange={(e) => handleCreditEntryChange(index, 'amount', e.target.value)}
                          step="0.01"
                          min="0.01"
                          placeholder="0.00"
                          className={`mt-1 block w-full border ${
                            errors[`credit_${index}_amount`] ? 'border-red-300' : 'border-gray-300'
                          } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                        />
                        {errors[`credit_${index}_amount`] && (
                          <p className="mt-1 text-sm text-red-600">{errors[`credit_${index}_amount`]}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor={`credit-description-${index}`} className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <input
                          type="text"
                          id={`credit-description-${index}`}
                          value={entry.description}
                          onChange={(e) => handleCreditEntryChange(index, 'description', e.target.value)}
                          placeholder="Optional description"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-4 text-right">
                  <p className="text-sm font-medium text-gray-700">
                    Total Credit: <span className="text-gray-900">{formatAmount(calculateTotalCredit())}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Balance</h3>
                    <p className="text-sm text-gray-500">Total debits must equal total credits</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-medium text-gray-900">
                      Debit: {formatAmount(calculateTotalDebit())}
                    </p>
                    <p className="text-lg font-medium text-gray-900">
                      Credit: {formatAmount(calculateTotalCredit())}
                    </p>
                    <p className={`text-lg font-bold ${calculateTotalDebit() === calculateTotalCredit() ? 'text-green-600' : 'text-red-600'}`}>
                      Difference: {formatAmount(Math.abs(calculateTotalDebit() - calculateTotalCredit()))}
                    </p>
                    {errors.balance && (
                      <p className="mt-1 text-sm text-red-600">{errors.balance}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Journal Entry'}
              </Button>
            </div>
          </form>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default CreateJournalEntryPage;