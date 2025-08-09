import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import Button from '@/components/common/Button';
import { fetchNavigationGroups, fetchAllNavigationItems, NavigationGroup, NavigationItem } from '@/services/navigation.service';

const NavigationManagementPage: React.FC = () => {
  const [groups, setGroups] = useState<NavigationGroup[]>([]);
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [g, i] = await Promise.all([
          fetchNavigationGroups(),
          fetchAllNavigationItems(),
        ]);
        setGroups(g);
        setItems(i as any);
      } catch (e: any) {
        setError(e.message || 'Failed to load navigation');
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
              <h1 className="text-2xl font-semibold text-gray-900">Navigation Management</h1>
              <p className="mt-2 text-sm text-gray-700">View groups and items. (CRUD to be extended)</p>
            </div>
          </div>

          {error && <div className="text-red-600 mb-4">{error}</div>}
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="font-semibold mb-2">Groups</h2>
                <ul className="divide-y divide-gray-200 bg-white shadow rounded">
                  {groups.map(g => (
                    <li key={g.id} className="p-3 flex justify-between">
                      <span>{g.name}</span>
                      <span className="text-gray-500">Order: {g.order}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="font-semibold mb-2">Items</h2>
                <ul className="divide-y divide-gray-200 bg-white shadow rounded max-h-[60vh] overflow-auto">
                  {items.map(it => (
                    <li key={it.id} className="p-3">
                      <div className="flex justify-between">
                        <span>{it.label}</span>
                        <span className="text-gray-500">{it.url}</span>
                      </div>
                      {it.children && it.children.length > 0 && (
                        <ul className="ml-4 mt-2 text-sm text-gray-600 list-disc">
                          {it.children.map(c => (
                            <li key={c.id}>{c.label} — {c.url}</li>
                          ))}
                        </ul>
                      )}
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

export default NavigationManagementPage;
