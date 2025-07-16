import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import Button from '@/components/common/Button';
import DatePicker from '@/components/common/DatePicker';
import { createAccount, updateAccount, Account, CreateAccountData, UpdateAccountData } from '@/services/user.service';

interface AccountFormProps {
  userId?: string;
  account?: Account;
  isEdit?: boolean;
  onSuccess?: () => void;
}

const AccountForm: React.FC<AccountFormProps> = ({ 
  userId, 
  account, 
  isEdit = false,
  onSuccess 
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState<'SAVINGS' | 'LOAN' | 'FIXED_DEPOSIT'>(
    account?.accountType || 'SAVINGS'
  );
  const [interestRate, setInterestRate] = useState(account?.interestRate?.toString() || '');
  const [balance, setBalance] = useState(account?.balance?.toString() || '0');
  const [openingDate, setOpeningDate] = useState<Date>(
    account?.openingDate ? new Date(account.openingDate) : new Date()
  );
  const [status, setStatus] = useState(account?.status || 'ACTIVE');
  
  // BB Account details
  const [guardianName, setGuardianName] = useState(account?.bbAccountDetails?.guardianName || '');
  const [guardianRelation, setGuardianRelation] = useState(account?.bbAccountDetails?.guardianRelation || '');
  const [guardianContact, setGuardianContact] = useState(account?.bbAccountDetails?.guardianContact || '');
  const [guardianIdType, setGuardianIdType] = useState(account?.bbAccountDetails?.guardianIdType || 'NATIONAL_ID');
  const [guardianIdNumber, setGuardianIdNumber] = useState(account?.bbAccountDetails?.guardianIdNumber || '');
  const [bbMaturityDate, setBbMaturityDate] = useState<Date | null>(
    account?.bbAccountDetails?.maturityDate ? new Date(account.bbAccountDetails.maturityDate) : null
  );
  
  // MB Account details
  const [monthlyDepositAmount, setMonthlyDepositAmount] = useState(
    account?.mbAccountDetails?.monthlyDepositAmount?.toString() || ''
  );
  const [depositDay, setDepositDay] = useState(
    account?.mbAccountDetails?.depositDay?.toString() || '1'
  );
  const [termMonths, setTermMonths] = useState(
    account?.mbAccountDetails?.termMonths?.toString() || '12'
  );
  const [mbMaturityDate, setMbMaturityDate] = useState<Date | null>(
    account?.mbAccountDetails?.maturityDate ? new Date(account.mbAccountDetails.maturityDate) : null
  );
  
  // Validation states
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Calculate maturity date when term months change
  useEffect(() => {
    if (accountType === 'SAVINGS' && termMonths) {
      const date = new Date(openingDate);
      date.setMonth(date.getMonth() + parseInt(termMonths));
      setMbMaturityDate(date);
    }
  }, [termMonths, openingDate, accountType]);
  
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!interestRate) {
      newErrors.interestRate = 'Interest rate is required';
    } else if (parseFloat(interestRate) < 0 || parseFloat(interestRate) > 100) {
      newErrors.interestRate = 'Interest rate must be between 0 and 100';
    }
    
    if (balance && parseFloat(balance) < 0) {
      newErrors.balance = 'Balance cannot be negative';
    }
    
    // Validate BB account details if applicable
    if (accountType === 'SAVINGS' && userId) {
      if (guardianName && guardianName.length < 3) {
        newErrors.guardianName = 'Guardian name must be at least 3 characters';
      }
      
      if (guardianContact && !/^\+?[0-9]{10,15}$/.test(guardianContact)) {
        newErrors.guardianContact = 'Guardian contact must be a valid phone number';
      }
    }
    
    // Validate MB account details if applicable
    if (accountType === 'SAVINGS' && userId) {
      if (monthlyDepositAmount && parseFloat(monthlyDepositAmount) <= 0) {
        newErrors.monthlyDepositAmount = 'Monthly deposit amount must be positive';
      }
      
      if (depositDay && (parseInt(depositDay) < 1 || parseInt(depositDay) > 31)) {
        newErrors.depositDay = 'Deposit day must be between 1 and 31';
      }
      
      if (termMonths && parseInt(termMonths) < 1) {
        newErrors.termMonths = 'Term months must be at least 1';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setLoading(true);
    
    try {
      if (isEdit && account) {
        // Update existing account
        const updateData: UpdateAccountData = {
          interestRate: parseFloat(interestRate),
          status: status as 'ACTIVE' | 'INACTIVE' | 'CLOSED' | 'FROZEN'
        };
        
        // Add BB account details if applicable
        if (account.accountType === 'SAVINGS' && guardianName) {
          updateData.bbAccountDetails = {
            guardianName,
            guardianRelation,
            guardianContact,
            guardianIdType,
            guardianIdNumber,
            maturityDate: bbMaturityDate ? bbMaturityDate.toISOString() : undefined
          };
          
          console.log('Including BB account details in update:', updateData.bbAccountDetails);
        }
        
        // Add MB account details if applicable
        if (account.accountType === 'SAVINGS' && monthlyDepositAmount) {
          updateData.mbAccountDetails = {
            monthlyDepositAmount: parseFloat(monthlyDepositAmount),
            depositDay: parseInt(depositDay),
            termMonths: parseInt(termMonths),
            maturityDate: mbMaturityDate ? mbMaturityDate.toISOString() : undefined
          };
          
          console.log('Including MB account details in update:', updateData.mbAccountDetails);
        }
        
        await updateAccount(account.id, updateData);
        toast.success('Account updated successfully');
      } else if (userId) {
        // Create new account
        const createData: CreateAccountData = {
          userId,
          accountType,
          interestRate: parseFloat(interestRate),
          openingDate: openingDate.toISOString(),
          balance: balance ? parseFloat(balance) : 0
        };
        
        // Add BB account details if applicable
        if (accountType === 'SAVINGS' && guardianName) {
          createData.bbAccountDetails = {
            guardianName,
            guardianRelation,
            guardianContact,
            guardianIdType,
            guardianIdNumber,
            maturityDate: bbMaturityDate ? bbMaturityDate.toISOString() : undefined
          };
        }
        
        // Add MB account details if applicable
        if (accountType === 'SAVINGS' && monthlyDepositAmount) {
          createData.mbAccountDetails = {
            monthlyDepositAmount: parseFloat(monthlyDepositAmount),
            depositDay: parseInt(depositDay),
            termMonths: parseInt(termMonths),
            maturityDate: mbMaturityDate ? mbMaturityDate.toISOString() : undefined
          };
        }
        
        const newAccount = await createAccount(createData);
        toast.success('Account created successfully');
        
        // Navigate to the new account or call onSuccess
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/accounts/${newAccount.id}`);
        }
      }
    } catch (error) {
      console.error('Error saving account:', error);
      toast.error('Failed to save account. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {isEdit ? 'Edit Account' : 'Create New Account'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {isEdit 
                ? 'Update the account details below.' 
                : 'Fill in the details to create a new account for this user.'}
            </p>
          </div>
          
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="grid grid-cols-6 gap-6">
              {/* Account Type */}
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="accountType" className="block text-sm font-medium text-gray-700">
                  Account Type
                </label>
                <select
                  id="accountType"
                  name="accountType"
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value as any)}
                  disabled={isEdit}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="SAVINGS">Savings</option>
                  <option value="LOAN">Loan</option>
                  <option value="FIXED_DEPOSIT">Fixed Deposit</option>
                </select>
              </div>
              
              {/* Interest Rate */}
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700">
                  Interest Rate (%)
                </label>
                <input
                  type="number"
                  name="interestRate"
                  id="interestRate"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  step="0.01"
                  min="0"
                  max="100"
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                {errors.interestRate && (
                  <p className="mt-1 text-sm text-red-600">{errors.interestRate}</p>
                )}
              </div>
              
              {/* Opening Date */}
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="openingDate" className="block text-sm font-medium text-gray-700">
                  Opening Date
                </label>
                <DatePicker
                  selected={openingDate}
                  onChange={(date) => date && setOpeningDate(date)}
                  disabled={isEdit}
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              {/* Initial Balance (only for new accounts) */}
              {!isEdit && (
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="balance" className="block text-sm font-medium text-gray-700">
                    Initial Balance
                  </label>
                  <input
                    type="number"
                    name="balance"
                    id="balance"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    step="0.01"
                    min="0"
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                  {errors.balance && (
                    <p className="mt-1 text-sm text-red-600">{errors.balance}</p>
                  )}
                </div>
              )}
              
              {/* Status (only for edit) */}
              {isEdit && (
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="FROZEN">Frozen</option>
                  </select>
                </div>
              )}
            </div>
            
            {/* BB Account Details */}
            {accountType === 'SAVINGS' && (
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">
                  Business Banking Account Details
                </h4>
                <div className="grid grid-cols-6 gap-6">
                  {/* Guardian Name */}
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="guardianName" className="block text-sm font-medium text-gray-700">
                      Guardian Name
                    </label>
                    <input
                      type="text"
                      name="guardianName"
                      id="guardianName"
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                    {errors.guardianName && (
                      <p className="mt-1 text-sm text-red-600">{errors.guardianName}</p>
                    )}
                  </div>
                  
                  {/* Guardian Relation */}
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="guardianRelation" className="block text-sm font-medium text-gray-700">
                      Guardian Relation
                    </label>
                    <input
                      type="text"
                      name="guardianRelation"
                      id="guardianRelation"
                      value={guardianRelation}
                      onChange={(e) => setGuardianRelation(e.target.value)}
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  
                  {/* Guardian Contact */}
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="guardianContact" className="block text-sm font-medium text-gray-700">
                      Guardian Contact
                    </label>
                    <input
                      type="text"
                      name="guardianContact"
                      id="guardianContact"
                      value={guardianContact}
                      onChange={(e) => setGuardianContact(e.target.value)}
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                    {errors.guardianContact && (
                      <p className="mt-1 text-sm text-red-600">{errors.guardianContact}</p>
                    )}
                  </div>
                  
                  {/* Guardian ID Type */}
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="guardianIdType" className="block text-sm font-medium text-gray-700">
                      Guardian ID Type
                    </label>
                    <select
                      id="guardianIdType"
                      name="guardianIdType"
                      value={guardianIdType}
                      onChange={(e) => setGuardianIdType(e.target.value)}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                      <option value="NATIONAL_ID">National ID</option>
                      <option value="PASSPORT">Passport</option>
                      <option value="DRIVING_LICENSE">Driving License</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  
                  {/* Guardian ID Number */}
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="guardianIdNumber" className="block text-sm font-medium text-gray-700">
                      Guardian ID Number
                    </label>
                    <input
                      type="text"
                      name="guardianIdNumber"
                      id="guardianIdNumber"
                      value={guardianIdNumber}
                      onChange={(e) => setGuardianIdNumber(e.target.value)}
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  
                  {/* BB Maturity Date */}
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="bbMaturityDate" className="block text-sm font-medium text-gray-700">
                      Maturity Date (Optional)
                    </label>
                    <DatePicker
                      selected={bbMaturityDate}
                      onChange={(date) => setBbMaturityDate(date)}
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      minDate={new Date()}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* MB Account Details */}
            {accountType === 'SAVINGS' && (
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">
                  Mobile Banking Account Details
                </h4>
                <div className="grid grid-cols-6 gap-6">
                  {/* Monthly Deposit Amount */}
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="monthlyDepositAmount" className="block text-sm font-medium text-gray-700">
                      Monthly Deposit Amount
                    </label>
                    <input
                      type="number"
                      name="monthlyDepositAmount"
                      id="monthlyDepositAmount"
                      value={monthlyDepositAmount}
                      onChange={(e) => setMonthlyDepositAmount(e.target.value)}
                      step="0.01"
                      min="0"
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                    {errors.monthlyDepositAmount && (
                      <p className="mt-1 text-sm text-red-600">{errors.monthlyDepositAmount}</p>
                    )}
                  </div>
                  
                  {/* Deposit Day */}
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="depositDay" className="block text-sm font-medium text-gray-700">
                      Deposit Day (1-31)
                    </label>
                    <input
                      type="number"
                      name="depositDay"
                      id="depositDay"
                      value={depositDay}
                      onChange={(e) => setDepositDay(e.target.value)}
                      min="1"
                      max="31"
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                    {errors.depositDay && (
                      <p className="mt-1 text-sm text-red-600">{errors.depositDay}</p>
                    )}
                  </div>
                  
                  {/* Term Months */}
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="termMonths" className="block text-sm font-medium text-gray-700">
                      Term (Months)
                    </label>
                    <input
                      type="number"
                      name="termMonths"
                      id="termMonths"
                      value={termMonths}
                      onChange={(e) => setTermMonths(e.target.value)}
                      min="1"
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                    {errors.termMonths && (
                      <p className="mt-1 text-sm text-red-600">{errors.termMonths}</p>
                    )}
                  </div>
                  
                  {/* MB Maturity Date */}
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="mbMaturityDate" className="block text-sm font-medium text-gray-700">
                      Maturity Date
                    </label>
                    <DatePicker
                      selected={mbMaturityDate}
                      onChange={(date) => setMbMaturityDate(date)}
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      minDate={new Date()}
                      disabled
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Calculated based on term months
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Saving...' : isEdit ? 'Update Account' : 'Create Account'}
        </Button>
      </div>
    </form>
  );
};

export default AccountForm;