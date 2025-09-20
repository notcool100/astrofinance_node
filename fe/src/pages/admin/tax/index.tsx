import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import Button from '@/components/common/Button';
import { getTaxTypes, getTaxRates, TaxType, TaxRate } from '@/services/tax.service';

const TaxSettingsPage: React.FC = () => {
  const [types, setTypes] = useState<TaxType[]>([]);
  const [rates, setRates] = useState<TaxRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [t, r] = await Promise.all([getTaxTypes(), getTaxRates()]);
        setTypes(t);
        setRates(r);
      } catch (e: any) {
        setError(e.message || 'Failed to load tax settings');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <ProtectedRoute adminOnly>
      <MainLayout>
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Tax Settings</h1>

          {error && <div className="text-red-600 mb-4">{error}</div>}

          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="font-semibold mb-2">Tax Types</h2>
                <ul className="divide-y divide-gray-200 bg-white shadow rounded">
                  {types.map(tt => (
                    <li key={tt.id} className="p-3">
                      <div className="font-medium">{tt.name}</div>
                      <div className="text-sm text-gray-500">{tt.code}</div>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="font-semibold mb-2">Tax Rates</h2>
                <ul className="divide-y divide-gray-200 bg-white shadow rounded max-h-[60vh] overflow-auto">
                  {rates.map(tr => (
                    <li key={tr.id} className="p-3 flex justify-between">
                      <span>{tr.taxTypeId}</span>
                      <span className="text-gray-500">{tr.rate}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default TaxSettingsPage;
