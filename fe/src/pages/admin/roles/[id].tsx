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

  useEffect(() => {
    if (!id || typeof id !== 'string') return;
    (async () => {
      try {
        setLoading(true);
        const [r, perms] = await Promise.all([
          getRoleById(id),
          getAllPermissions(),
        ]);
        setRole(r);
        setName((r as any).name || '');
        setDescription((r as any).description || '');
        setPermissionsByModule(perms);
        const currentPermIds = ((r as any).permissions || []).map((p: any) => p.permissionId || p.permission?.id);
        setSelectedPermissionIds(currentPermIds.filter(Boolean));
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
      await updateRole(id, { name, description });
      await updateRolePermissions(id, selectedPermissionIds);
      router.push('/admin/roles');
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

  return (
    <ProtectedRoute adminOnly={true}>
      <MainLayout>
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Role Details</h1>

          {error && <div className="text-red-600 mb-4">{error}</div>}
          {loading ? (
            <div>Loading...</div>
          ) : role ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 bg-white p-4 rounded shadow">
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
                <div className="flex gap-3">
                  <Button variant="primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  {!((role as any).isSystem) && (
                    <Button variant="outline" onClick={handleDelete}>
                      Delete
                    </Button>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 bg-white p-4 rounded shadow">
                <h2 className="font-semibold mb-3">Permissions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(permissionsByModule).map(([module, perms]) => (
                    <div key={module} className="border rounded p-3">
                      <div className="font-medium mb-2">{module}</div>
                      <ul className="space-y-2">
                        {perms.map((perm) => (
                          <li key={perm.id} className="flex items-center gap-2">
                            <input
                              id={perm.id}
                              type="checkbox"
                              checked={selectedPermissionIds.includes(perm.id)}
                              onChange={() => togglePermission(perm.id)}
                            />
                            <label htmlFor={perm.id} className="text-sm">
                              {perm.action} - <span className="text-gray-500">{perm.code}</span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
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
