import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import Button from '@/components/common/Button';
import { getSmsTemplates, SmsTemplate } from '@/services/sms.service';
import Link from 'next/link';

const SmsTemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<SmsTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getSmsTemplates();
        setTemplates(data);
      } catch (e: any) {
        setError(e.message || 'Failed to load SMS templates');
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
              <h1 className="text-2xl font-semibold text-gray-900">SMS Templates</h1>
              <p className="mt-2 text-sm text-gray-700">Manage SMS templates used for system notifications.</p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <Link href="/admin/sms/new">
                <Button variant="primary">Create Template</Button>
              </Link>
            </div>
          </div>

          {error && <div className="text-red-600 mb-4">{error}</div>}

          {loading ? (
            <div>Loading...</div>
          ) : templates.length === 0 ? (
            <div>No SMS templates found.</div>
          ) : (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Name</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Code</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {templates.map((t) => (
                    <tr key={t.id}>
                      <td className="px-3 py-4 text-sm text-gray-900">{t.name}</td>
                      <td className="px-3 py-4 text-sm text-gray-500">{t.code}</td>
                      <td className="px-3 py-4 text-sm text-gray-500">{t.isActive ? 'Yes' : 'No'}</td>
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

export default SmsTemplatesPage;
