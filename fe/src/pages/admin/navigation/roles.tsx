import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import Button from '@/components/common/Button';
import { getAllRoles, Role } from '@/services/role.service';
import { 
  fetchAllNavigationItems, 
  NavigationItem, 
  assignNavigationToRole,
  fetchNavigationGroups,
  NavigationGroup
} from '@/services/navigation.service';

interface RoleWithNavigation extends Role {
  navigation?: Array<{
    navigationItem: NavigationItem;
  }>;
}

const RoleNavigationAssignmentPage: React.FC = () => {
  const router = useRouter();
  const [roles, setRoles] = useState<RoleWithNavigation[]>([]);
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [groups, setGroups] = useState<NavigationGroup[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const loadData = async () => {
    try {
      setLoading(true);
      const [r, i, g] = await Promise.all([
        getAllRoles(),
        fetchAllNavigationItems(),
        fetchNavigationGroups()
      ]);
      setRoles(r as RoleWithNavigation[]);
      setItems(i);
      setGroups(g);
    } catch (e: any) {
      setError(e.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedRoleId) {
      const role = roles.find(r => r.id === selectedRoleId);
      if (role && role.navigation) {
        const navIds = role.navigation.map(n => n.navigationItem.id);
        setSelectedItemIds(navIds);
      } else {
        setSelectedItemIds([]);
      }
    }
  }, [selectedRoleId, roles]);

  const toggleItem = (id: string) => {
    setSelectedItemIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const selectAllInGroup = (groupId: string) => {
    const groupItems = items.filter(item => item.groupId === groupId);
    const groupItemIds = groupItems.map(item => item.id);
    const allSelected = groupItemIds.every(id => selectedItemIds.includes(id));
    
    if (allSelected) {
      // Deselect all in group
      setSelectedItemIds(prev => prev.filter(id => !groupItemIds.includes(id)));
    } else {
      // Select all in group
      setSelectedItemIds(prev => {
        const newIds = [...prev];
        groupItemIds.forEach(id => {
          if (!newIds.includes(id)) {
            newIds.push(id);
          }
        });
        return newIds;
      });
    }
  };

  const handleSave = async () => {
    if (!selectedRoleId) {
      setError('Please select a role');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      await assignNavigationToRole(selectedRoleId, selectedItemIds);
      await loadData(); // Reload to get updated role navigation
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Failed to save navigation assignment');
    } finally {
      setSaving(false);
    }
  };

  const selectedRole = roles.find(r => r.id === selectedRoleId);
  const currentNavCount = selectedRole?.navigation?.length || 0;

  // Group items by group
  const itemsByGroup = groups.map(group => ({
    group,
    items: items.filter(item => item.groupId === group.id)
  }));

  const ungroupedItems = items.filter(item => !item.groupId);

  return (
    <ProtectedRoute adminOnly>
      <MainLayout>
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="sm:flex sm:items-center mb-6">
            <div className="sm:flex-auto">
              <h1 className="text-2xl font-semibold text-gray-900">Role Navigation Assignment</h1>
              <p className="mt-2 text-sm text-gray-700">
                Assign navigation items to roles to control what staff members can see
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <Button variant="outline" onClick={() => router.back()}>
                Back
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Role Selection */}
              <div className="lg:col-span-1">
                <div className="bg-white p-4 rounded-lg shadow">
                  <h2 className="font-semibold text-gray-900 mb-4">Select Role</h2>
                  <div className="space-y-2">
                    {roles.map(role => (
                      <div
                        key={role.id}
                        className={`p-3 rounded border cursor-pointer transition-colors ${
                          selectedRoleId === role.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedRoleId(role.id)}
                      >
                        <div className="font-medium">{role.name}</div>
                        {role.description && (
                          <div className="text-sm text-gray-500 mt-1">{role.description}</div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          {role.navigation?.length || 0} navigation items
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedRoleId && (
                    <div className="mt-6 pt-4 border-t">
                      <div className="text-sm text-gray-600 mb-3">
                        Current: {currentNavCount} items
                        <br />
                        Selected: {selectedItemIds.length} items
                      </div>
                      <Button
                        variant="primary"
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full"
                      >
                        {saving ? 'Saving...' : 'Save Assignment'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Items */}
              <div className="lg:col-span-3">
                <div className="bg-white p-4 rounded-lg shadow">
                  <h2 className="font-semibold text-gray-900 mb-4">
                    Navigation Items ({selectedItemIds.length} selected)
                  </h2>
                  
                  {!selectedRoleId ? (
                    <div className="text-center text-gray-500 py-8">
                      Please select a role to manage its navigation items
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                      {/* Grouped Items */}
                      {itemsByGroup.map(({ group, items: groupItems }) => (
                        <div key={group.id} className="border rounded-lg">
                          <div className="p-3 bg-gray-50 border-b flex items-center justify-between">
                            <div 
                              className="flex items-center space-x-2 cursor-pointer"
                              onClick={() => toggleGroup(group.id)}
                            >
                              <span className="text-sm">
                                {expandedGroups.has(group.id) ? '▼' : '▶'}
                              </span>
                              <h3 className="font-medium">{group.name}</h3>
                              <span className="text-sm text-gray-500">
                                ({groupItems.length} items)
                              </span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => selectAllInGroup(group.id)}
                            >
                              {groupItems.every(item => selectedItemIds.includes(item.id))
                                ? 'Deselect All'
                                : 'Select All'
                              }
                            </Button>
                          </div>
                          
                          {expandedGroups.has(group.id) && (
                            <div className="p-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {groupItems.map(item => (
                                  <label
                                    key={item.id}
                                    className="flex items-start space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedItemIds.includes(item.id)}
                                      onChange={() => toggleItem(item.id)}
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
                        </div>
                      ))}

                      {/* Ungrouped Items */}
                      {ungroupedItems.length > 0 && (
                        <div className="border rounded-lg">
                          <div className="p-3 bg-gray-50 border-b">
                            <h3 className="font-medium">Ungrouped Items ({ungroupedItems.length})</h3>
                          </div>
                          <div className="p-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {ungroupedItems.map(item => (
                                <label
                                  key={item.id}
                                  className="flex items-start space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedItemIds.includes(item.id)}
                                    onChange={() => toggleItem(item.id)}
                                    className="mt-1"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm">{item.label}</div>
                                    <div className="text-xs text-gray-500 truncate">
                                      {item.url || 'No URL'}
                                    </div>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
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



export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await import('next-i18next/serverSideTranslations').then(m => 
        m.serverSideTranslations(locale, ['common', 'user', 'auth'])
      )),
    },
  };
}

export default RoleNavigationAssignmentPage;
