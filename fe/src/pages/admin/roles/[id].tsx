import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import Button from '@/components/common/Button';
import {
  Role,
  getRoleById,
  updateRole,
  deleteRole,
  getAllPermissions,
  updateRolePermissions,
  Permission,
} from '@/services/role.service';
import {
  fetchAllNavigationItems,
  assignNavigationToRole,
  NavigationItem,
} from '@/services/navigation.service';

const RoleDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permissionsByModule, setPermissionsByModule] = useState<Record<string, Permission[]>>({});
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);
  const [selectedNavigationIds, setSelectedNavigationIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'permissions' | 'navigation'>('details');

  useEffect(() => {
    if (!id || typeof id !== 'string') return;
    (async () => {
      try {
        setLoading(true);
        const [r, perms, navItems] = await Promise.all([
          getRoleById(id),
          getAllPermissions(),
          fetchAllNavigationItems(),
        ]);
        setRole(r);
        setName((r as any).name || '');
        setDescription((r as any).description || '');
        setPermissionsByModule(perms);
        setNavigationItems(navItems);
        
        const currentPermIds = ((r as any).permissions || []).map((p: any) => p.permissionId || p.permission?.id);
        setSelectedPermissionIds(currentPermIds.filter(Boolean));
        
        const currentNavIds = ((r as any).navigation || []).map((n: any) => n.navigationItemId || n.navigationItem?.id);
        setSelectedNavigationIds(currentNavIds.filter(Boolean));
      } catch (e: any) {
        setError(e.message || 'Failed to load role');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSave = async () => {
    if (!id || typeof id !== 'string') return;
    try {
      setSaving(true);
      setError(null);
      
      if (activeTab === 'details') {
        await updateRole(id, { name, description });
      } else if (activeTab === 'permissions') {
        await updateRolePermissions(id, selectedPermissionIds);
      } else if (activeTab === 'navigation') {
        await assignNavigationToRole(id, selectedNavigationIds);
      }
      
      setError(null);
      // Don't redirect, stay on the page to show success
    } catch (e: any) {
      setError(e.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || typeof id !== 'string') return;
    if (!confirm('Are you sure you want to delete this role?')) return;
    try {
      await deleteRole(id);
      router.push('/admin/roles');
    } catch (e: any) {
      setError(e.message || 'Failed to delete role');
    }
  };

  const togglePermission = (permId: string) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId],
    );
  };

  const toggleNavigation = (navId: string) => {
    setSelectedNavigationIds((prev) =>
      prev.includes(navId) ? prev.filter((n) => n !== navId) : [...prev, navId],
    );
  };

  return (
    <ProtectedRoute adminOnly={true}>
      <MainLayout>
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Role Details</h1>

          {error && <div className="text-red-600 mb-4">{error}</div>}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          ) : role ? (
            <div className="bg-white shadow rounded-lg">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6">
                  {[
                    { id: 'details', label: 'Role Details', icon: '📝' },
                    { id: 'permissions', label: 'Permissions', icon: '🔐' },
                    { id: 'navigation', label: 'Navigation', icon: '🧭' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`${
                        activeTab === tab.id
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'details' && (
                  <div className="max-w-2xl">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'permissions' && (
                  <div>
                    <h2 className="font-semibold mb-4">Role Permissions ({selectedPermissionIds.length} selected)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(permissionsByModule).map(([module, perms]) => (
                        <div key={module} className="border rounded-lg p-4">
                          <div className="font-medium mb-3 text-gray-900">{module}</div>
                          <ul className="space-y-2">
                            {perms.map((perm) => (
                              <li key={perm.id} className="flex items-start gap-2">
                                <input
                                  id={perm.id}
                                  type="checkbox"
                                  checked={selectedPermissionIds.includes(perm.id)}
                                  onChange={() => togglePermission(perm.id)}
                                  className="mt-1"
                                />
                                <label htmlFor={perm.id} className="text-sm cursor-pointer">
                                  <div className="font-medium">{perm.action}</div>
                                  <div className="text-gray-500">{perm.code}</div>
                                </label>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'navigation' && (
                  <div>
                    <h2 className="font-semibold mb-4">Navigation Access ({selectedNavigationIds.length} selected)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                      {navigationItems.map((item) => (
                        <label
                          key={item.id}
                          className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedNavigationIds.includes(item.id)}
                            onChange={() => toggleNavigation(item.id)}
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{item.label}</div>
                            <div className="text-xs text-gray-500 truncate">
                              {item.url || 'No URL'}
                            </div>
                            {item.icon && (
                              <div className="text-xs text-gray-400">
                                Icon: {item.icon}
                              </div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-6 mt-6 border-t">
                  <div className="text-sm text-gray-500">
                    {activeTab === 'details' && 'Update role information'}
                    {activeTab === 'permissions' && `${selectedPermissionIds.length} permissions selected`}
                    {activeTab === 'navigation' && `${selectedNavigationIds.length} navigation items selected`}
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => router.push('/admin/roles')}>
                      Back to Roles
                    </Button>
                    <Button variant="primary" onClick={handleSave} disabled={saving}>
                      {saving ? 'Saving...' : `Save ${activeTab === 'details' ? 'Details' : activeTab === 'permissions' ? 'Permissions' : 'Navigation'}`}
                    </Button>
                    {!((role as any).isSystem) && activeTab === 'details' && (
                      <Button variant="outline" onClick={handleDelete}>
                        Delete Role
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>Role not found</div>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default RoleDetailPage;
