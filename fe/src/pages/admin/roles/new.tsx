import React, { useState } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import Button from '@/components/common/Button';
import { createRole } from '@/services/role.service';

const NewRolePage: React.FC = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await createRole({ name, description });
      router.push('/admin/roles');
    } catch (e: any) {
      setError(e.message || 'Failed to create role');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute adminOnly>
      <MainLayout>
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Create Role</h1>
          {error && <div className="text-red-600 mb-4">{error}</div>}
          <div className="bg-white p-4 rounded shadow max-w-lg">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                rows={4}
              />
            </div>
            <Button variant="primary" onClick={handleCreate} disabled={saving}>
              {saving ? 'Creating...' : 'Create'}
            </Button>
          </div>
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

export default NewRolePage;
