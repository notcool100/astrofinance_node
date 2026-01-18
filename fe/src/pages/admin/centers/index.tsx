import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiMapPin } from 'react-icons/fi';
import MainLayout from '@/components/layout/MainLayout';
import Button from '@/components/common/Button';
import Table from '@/components/common/Table';
import Card from '@/components/common/Card';
import Modal from '@/components/common/Modal';
import { toast } from 'react-toastify';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const AdminCentersPage = () => {
    const router = useRouter();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCenter, setSelectedCenter] = useState<any>(null);

    const { data: centers, isLoading, refetch } = useQuery('centers', async () => {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/centers`);
        return data;
    });

    const handleDelete = async () => {
        if (!selectedCenter) return;
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/centers/${selectedCenter.id}`);
            toast.success('Center deleted successfully');
            setIsDeleteModalOpen(false);
            refetch();
        } catch (error) {
            toast.error('Failed to delete center');
        }
    };

    const columns: any[] = [
        { Header: 'Name', accessor: 'name' },
        { Header: 'Code', accessor: 'code' },
        { Header: 'Address', accessor: 'address' },
        { Header: 'Groups', accessor: (row: any) => row.groups?.length || 0 },
        {
            Header: 'Actions',
            accessor: 'id',
            Cell: ({ row }: any) => (
                <div className="flex space-x-2">
                    <button
                        onClick={() => router.push(`/admin/centers/${row.original.id}`)}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        <FiEdit2 />
                    </button>
                    <button
                        onClick={() => {
                            setSelectedCenter(row.original);
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
        <MainLayout title="Center Management">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Centers</h1>
                    <p className="text-gray-600">Manage all collection centers</p>
                </div>
                <Button
                    variant="primary"
                    icon={<FiPlus />}
                    onClick={() => router.push('/admin/centers/new')}
                >
                    Create Center
                </Button>
            </div>

            <Card>
                {isLoading ? (
                    <div className="p-4 text-center">Loading...</div>
                ) : (
                    <Table
                        columns={columns}
                        data={centers || []}
                        keyField="id"
                    />
                )}
            </Card>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Center"
            >
                <div className="p-4">
                    <p>Are you sure you want to delete <strong>{selectedCenter?.name}</strong>?</p>
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

export default AdminCentersPage;
