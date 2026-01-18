import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import MainLayout from '@/components/layout/MainLayout';
import Button from '@/components/common/Button';
import Table from '@/components/common/Table';
import Card from '@/components/common/Card';
import Modal from '@/components/common/Modal';
import { toast } from 'react-toastify';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const AdminGroupsPage = () => {
    const router = useRouter();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<any>(null);

    const { data: groups, isLoading, refetch } = useQuery('groups', async () => {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/groups`);
        return data;
    });

    const handleDelete = async () => {
        if (!selectedGroup) return;
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/groups/${selectedGroup.id}`);
            toast.success('Group deleted successfully');
            setIsDeleteModalOpen(false);
            refetch();
        } catch (error) {
            toast.error('Failed to delete group');
        }
    };

    const columns: any[] = [
        { Header: 'Name', accessor: 'name' },
        { Header: 'Code', accessor: 'code' },
        { Header: 'Center', accessor: (row: any) => row.center?.name || 'N/A' },
        { Header: 'Members', accessor: (row: any) => row.users?.length || 0 },
        {
            Header: 'Actions',
            accessor: 'id',
            Cell: ({ row }: any) => (
                <div className="flex space-x-2">
                    <button
                        onClick={() => router.push(`/admin/groups/${row.original.id}`)}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        <FiEdit2 />
                    </button>
                    <button
                        onClick={() => {
                            setSelectedGroup(row.original);
                            setIsDeleteModalOpen(true);
                        }}
                        className="text-red-600 hover:text-red-800"
                    >
                        <FiTrash2 />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <MainLayout title="Group Management">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Groups</h1>
                    <p className="text-gray-600">Manage borrower groups</p>
                </div>
                <Button
                    variant="primary"
                    icon={<FiPlus />}
                    onClick={() => router.push('/admin/groups/new')}
                >
                    Create Group
                </Button>
            </div>

            <Card>
                {isLoading ? (
                    <div className="p-4 text-center">Loading...</div>
                ) : (
                    <Table
                        columns={columns}
                        data={groups || []}
                        keyField="id"
                    />
                )}
            </Card>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Group"
            >
                <div className="p-4">
                    <p>Are you sure you want to delete <strong>{selectedGroup?.name}</strong>?</p>
                    <p className="text-sm text-red-500 mt-2">This action cannot be undone.</p>
                    <div className="mt-4 flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                        <Button variant="danger" onClick={handleDelete}>Delete</Button>
                    </div>
                </div>
            </Modal>
        </MainLayout>
    );
};

export async function getServerSideProps({ locale }: { locale: string }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
        },
    };
}

export default AdminGroupsPage;
