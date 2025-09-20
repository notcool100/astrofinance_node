import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import Button from '@/components/common/Button';
import { 
  createNavigationItem, 
  fetchNavigationGroups, 
  fetchAllNavigationItems,
  NavigationGroup,
  NavigationItem
} from '@/services/navigation.service';

const CreateNavigationItemPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    label: '',
    icon: '',
    url: '',
    order: 1,
    parentId: '',
    groupId: '',
    isActive: true
  });
  const [groups, setGroups] = useState<NavigationGroup[]>([]);
  const [parentItems, setParentItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [groupsData, itemsData] = await Promise.all([
          fetchNavigationGroups(),
          fetchAllNavigationItems()
        ]);
        setGroups(groupsData);
        setParentItems(itemsData.filter(item => !item.parentId)); // Only top-level items can be parents
      } catch (e: any) {
        setError(e.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.label.trim()) {
      setError('Item label is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      await createNavigationItem({
        label: formData.label.trim(),
        icon: formData.icon.trim() || undefined,
        url: formData.url.trim() || undefined,
        order: formData.order,
        parentId: formData.parentId || undefined,
        groupId: formData.groupId || undefined,
        isActive: formData.isActive
      });

      router.push('/admin/navigation');
    } catch (e: any) {
      setError(e.message || 'Failed to create navigation item');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute adminOnly>
        <MainLayout>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute adminOnly>
      <MainLayout>
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="sm:flex sm:items-center mb-6">
            <div className="sm:flex-auto">
              <h1 className="text-2xl font-semibold text-gray-900">Create Navigation Item</h1>
              <p className="mt-2 text-sm text-gray-700">
                Create a new navigation item that can be assigned to roles
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </div>

          <div className="max-w-2xl">
            <div className="bg-white shadow rounded-lg">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="label" className="block text-sm font-medium text-gray-700">
                    Item Label *
                  </label>
                  <input
                    type="text"
                    id="label"
                    name="label"
                    value={formData.label}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="e.g., User Management"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    The display name for this navigation item
                  </p>
                </div>

                <div>
                  <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                    URL/Path
                  </label>
                  <input
                    type="text"
                    id="url"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="e.g., /admin/users"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    The route path users will navigate to (leave empty for menu headers)
                  </p>
                </div>

                <div>
                  <label htmlFor="icon" className="block text-sm font-medium text-gray-700">
                    Icon Name
                  </label>
                  <input
                    type="text"
                    id="icon"
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="e.g., users, dashboard, settings"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Material Design icon name (optional)
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="groupId" className="block text-sm font-medium text-gray-700">
                      Navigation Group
                    </label>
                    <select
                      id="groupId"
                      name="groupId"
                      value={formData.groupId}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    >
                      <option value="">-- No Group --</option>
                      {groups.map(group => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="parentId" className="block text-sm font-medium text-gray-700">
                      Parent Item
                    </label>
                    <select
                      id="parentId"
                      name="parentId"
                      value={formData.parentId}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    >
                      <option value="">-- No Parent --</option>
                      {parentItems.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="order" className="block text-sm font-medium text-gray-700">
                    Display Order *
                  </label>
                  <input
                    type="number"
                    id="order"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    min="1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Items are displayed in ascending order within their group
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                  <span className="ml-2 text-sm text-gray-500">
                    (Only active items are displayed in navigation)
                  </span>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={saving}
                  >
                    {saving ? 'Creating...' : 'Create Item'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default CreateNavigationItemPage;
