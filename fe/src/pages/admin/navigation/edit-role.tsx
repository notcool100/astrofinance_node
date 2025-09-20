import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import Button from '@/components/common/Button';
import { getAllRoles, Role } from '@/services/role.service';
import { fetchAllNavigationItems, NavigationItem, assignNavigationToRole } from '@/services/navigation.service';

const EditRoleNavigationPage: React.FC = () => {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [r, i] = await Promise.all([getAllRoles(), fetchAllNavigationItems()]);
        setRoles(r);
        setItems(i);
      } catch (e: any) {
        setError(e.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleItem = (id: string) => {
    setSelectedItemIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSave = async () => {
    if (!selectedRoleId) {
      setError('Select a role');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await assignNavigationToRole(selectedRoleId, selectedItemIds);
      router.push('/admin/navigation');
    } catch (e: any) {
      setError(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
      <MainLayout>
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Assign Navigation to Role</h1>
          {error && <div className="text-red-600 mb-4">{error}</div>}
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded shadow">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Role</label>
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value="">-- Select --</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <div className="mt-4">
                  <Button variant="primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>

              <div className="md:col-span-2 bg-white p-4 rounded shadow max-h-[70vh] overflow-auto">
                <h2 className="font-semibold mb-3">Navigation Items</h2>
                <ul className="space-y-2">
                  {items.map((it) => (
                    <li key={it.id} className="border rounded p-3">
                      <div className="flex items-center gap-2">
                        <input
                          id={it.id}
                          type="checkbox"
                          checked={selectedItemIds.includes(it.id)}
                          onChange={() => toggleItem(it.id)}
                        />
                        <label htmlFor={it.id} className="text-sm">
                          {it.label} — <span className="text-gray-500">{it.url}</span>
                        </label>
                      </div>
                      {it.children && it.children.length > 0 && (
                        <ul className="ml-6 mt-2 space-y-1">
                          {it.children.map((c) => (
                            <li key={c.id} className="flex items-center gap-2">
                              <input
                                id={c.id}
                                type="checkbox"
                                checked={selectedItemIds.includes(c.id)}
                                onChange={() => toggleItem(c.id)}
                              />
                              <label htmlFor={c.id} className="text-sm">
                                {c.label} — <span className="text-gray-500">{c.url}</span>
                              </label>
                            </li>
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
  );
};

export default EditRoleNavigationPage;
