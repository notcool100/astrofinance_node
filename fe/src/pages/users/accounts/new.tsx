import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import AccountForm from '@/components/modules/users/AccountForm';
import { getAllUsers, User } from '@/services/user.service';
import { toast } from 'react-toastify';

const NewAccountPage: React.FC = () => {
  const router = useRouter();
  const { userId } = router.query;
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(
    typeof userId === 'string' ? userId : undefined
  );
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  useEffect(() => {
    if (userId && typeof userId === 'string') {
      setSelectedUserId(userId);
    }
    fetchUsers();
  }, [userId]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user => 
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.contactNumber.includes(searchTerm) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers(1, 100, '', 'true');
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link href="/accounts">
              <Button variant="outline" className="flex items-center">
                <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Back to Accounts
              </Button>
            </Link>
          </div>

          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Create New Account</h1>

          {!selectedUserId ? (
            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Select User</h2>
              <p className="text-sm text-gray-500 mb-4">
                First, select the user for whom you want to create an account.
              </p>

              <div className="mb-4">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                  Search Users
                </label>
                <input
                  type="text"
                  name="search"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, or phone number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>

              {loading ? (
                <div className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary-400 border-r-transparent"></div>
                  <p className="mt-4 text-gray-700">Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">No users found. Try a different search term.</p>
                </div>
              ) : (
                <div className="mt-4 max-h-96 overflow-y-auto">
                  <ul className="divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <li key={user.id} className="py-4">
                        <button
                          onClick={() => setSelectedUserId(user.id)}
                          className="w-full text-left hover:bg-gray-50 p-2 rounded-md transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">{user.fullName}</h3>
                              <div className="text-sm text-gray-500 mt-1">
                                <p>{user.contactNumber}</p>
                                {user.email && <p>{user.email}</p>}
                              </div>
                            </div>
                            <div>
                              <Badge
                                color={
                                  user.userType === 'SB' ? 'blue' :
                                  user.userType === 'BB' ? 'green' : 'purple'
                                }
                                text={
                                  user.userType === 'SB' ? 'Savings Bank' :
                                  user.userType === 'BB' ? 'Business Banking' : 'Mobile Banking'
                                }
                              />
                            </div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <AccountForm 
              userId={selectedUserId} 
              onSuccess={() => router.push('/accounts')}
            />
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default NewAccountPage;