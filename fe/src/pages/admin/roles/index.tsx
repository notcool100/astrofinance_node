import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import Button from '@/components/common/Button';
import { Role, getAllRoles } from '@/services/role.service';

const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getAllRoles();
        setRoles(data);
      } catch (e: any) {
        setError(e.message || 'Failed to load roles');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <ProtectedRoute adminOnly>
      <MainLayout>
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="sm:flex sm:items-center mb-6">
            <div className="sm:flex-auto">
              <h1 className="text-2xl font-semibold text-gray-900">Roles & Permissions</h1>
              <p className="mt-2 text-sm text-gray-700">Manage admin roles and their permissions.</p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <Link href="/admin/roles/new">
                <Button variant="primary">Create Role</Button>
              </Link>
            </div>
          </div>

          {error && <div className="text-red-600 mb-4">{error}</div>}

          {loading ? (
            <div>Loading...</div>
          ) : roles.length === 0 ? (
            <div>No roles found.</div>
          ) : (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Name</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">System</th>
                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {roles.map((r) => (
                    <tr key={r.id}>
                      <td className="px-3 py-4 text-sm text-gray-900">{r.name}</td>
                      <td className="px-3 py-4 text-sm text-gray-500">{r.isSystem ? 'Yes' : 'No'}</td>
                      <td className="px-3 py-4 text-sm text-right">
                        <Link href={`/admin/roles/${r.id}`} className="text-primary-600 hover:underline">Manage</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default RolesPage;
