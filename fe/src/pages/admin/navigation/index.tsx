import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import Button from '@/components/common/Button';
import { 
  fetchNavigationGroups, 
  fetchAllNavigationItems, 
  NavigationGroup, 
  NavigationItem,
  deleteNavigationItem,
  deleteNavigationGroup
} from '@/services/navigation.service';

const NavigationManagementPage: React.FC = () => {
  const router = useRouter();
  const [groups, setGroups] = useState<NavigationGroup[]>([]);
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadData = async () => {
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
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteItem = async (id: string, label: string) => {
    if (!confirm(`Are you sure you want to delete navigation item "${label}"?`)) return;
    
    try {
      setDeleting(id);
      await deleteNavigationItem(id);
      await loadData(); // Reload data
    } catch (e: any) {
      setError(e.message || 'Failed to delete navigation item');
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteGroup = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete navigation group "${name}"? This will also delete all items in this group.`)) return;
    
    try {
      setDeleting(id);
      await deleteNavigationGroup(id);
      await loadData(); // Reload data
    } catch (e: any) {
      setError(e.message || 'Failed to delete navigation group');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <ProtectedRoute adminOnly>
      <MainLayout>
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="sm:flex sm:items-center mb-6">
            <div className="sm:flex-auto">
              <h1 className="text-2xl font-semibold text-gray-900">Navigation Management</h1>
              <p className="mt-2 text-sm text-gray-700">Manage navigation groups, items, and role assignments</p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-2">
              <Button 
                variant="primary" 
                onClick={() => router.push('/admin/navigation/create-group')}
              >
                New Group
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/admin/navigation/create-item')}
              >
                New Item
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => router.push('/admin/navigation/roles')}
              >
                Role Assignments
              </Button>
            </div>
          </div>

          {error && <div className="text-red-600 mb-4">{error}</div>}
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="font-semibold mb-2">Navigation Groups ({groups.length})</h2>
                <div className="bg-white shadow rounded overflow-hidden">
                  {groups.length === 0 ? (
                    <div className="p-4 text-gray-500 text-center">No groups found</div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {groups.map(g => (
                        <li key={g.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium text-gray-900">{g.name}</h3>
                              {g.description && (
                                <p className="text-sm text-gray-500">{g.description}</p>
                              )}
                              <p className="text-xs text-gray-400">Order: {g.order}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/admin/navigation/groups/${g.id}`)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteGroup(g.id, g.name)}
                                disabled={deleting === g.id}
                              >
                                {deleting === g.id ? 'Deleting...' : 'Delete'}
                              </Button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <div>
                <h2 className="font-semibold mb-2">Navigation Items ({items.length})</h2>
                <div className="bg-white shadow rounded max-h-[70vh] overflow-auto">
                  {items.length === 0 ? (
                    <div className="p-4 text-gray-500 text-center">No items found</div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {items.map(it => (
                        <li key={it.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium text-gray-900">{it.label}</h3>
                                {it.icon && (
                                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                    {it.icon}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">{it.url || 'No URL'}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                                <span>Order: {it.order}</span>
                                {it.groupId && (
                                  <span>Group: {groups.find(g => g.id === it.groupId)?.name || 'Unknown'}</span>
                                )}
                                <span className={it.isActive ? 'text-green-600' : 'text-red-600'}>
                                  {it.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/admin/navigation/items/${it.id}`)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteItem(it.id, it.label)}
                                disabled={deleting === it.id}
                              >
                                {deleting === it.id ? 'Deleting...' : 'Delete'}
                              </Button>
                            </div>
                          </div>
                          {it.children && it.children.length > 0 && (
                            <div className="mt-3 ml-4 border-l-2 border-gray-200 pl-4">
                              <p className="text-xs text-gray-500 mb-2">Children:</p>
                              <ul className="space-y-1">
                                {it.children.map(c => (
                                  <li key={c.id} className="text-sm text-gray-600 flex justify-between">
                                    <span>{c.label}</span>
                                    <span className="text-gray-400">{c.url}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default NavigationManagementPage;
