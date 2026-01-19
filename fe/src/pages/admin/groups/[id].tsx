import React from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { toast } from 'react-toastify';
import MainLayout from '@/components/layout/MainLayout';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

type GroupFormProps = {
    name: string;
    code: string;
    centerId: string;
};

const GroupFormPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const isEdit = id && id !== 'new';
    const queryClient = useQueryClient();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<GroupFormProps>();

    // Fetch Centers for Dropdown
    const { data: centers } = useQuery('centers', async () => {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/centers`);
        return data;
    });

    // Fetch Group Data if Edit
    const { isLoading } = useQuery(['group', id], async () => {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/groups/${id}`);
        return data;
    }, {
        enabled: !!isEdit,
        onSuccess: (data) => reset(data)
    });

    const mutation = useMutation(async (data: GroupFormProps) => {
        if (isEdit) {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/groups/${id}`, data);
        } else {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/groups`, data);
        }
    }, {
        onSuccess: () => {
            toast.success(`Group ${isEdit ? 'updated' : 'created'} successfully`);
            queryClient.invalidateQueries('groups');
            router.push('/admin/groups');
        },
        onError: () => {
            toast.error(`Failed to ${isEdit ? 'update' : 'create'} group`);
        }
    });

    const onSubmit = (data: GroupFormProps) => {
        mutation.mutate(data);
    };

    if (isEdit && isLoading) return <MainLayout title="Edit Group"><div>Loading...</div></MainLayout>;

    return (
        <MainLayout title={isEdit ? 'Edit Group' : 'Create Group'}>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">{isEdit ? 'Edit Group' : 'Create Group'}</h1>
            </div>

            <Card>
                <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Group Name</label>
                            <input
                                {...register('name', { required: 'Name is required' })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            />
                            {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Group Code</label>
                            <input
                                {...register('code', { required: 'Code is required' })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            />
                            {errors.code && <span className="text-red-500 text-xs">{errors.code.message}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Parent Center</label>
                            <select
                                {...register('centerId', { required: 'Center is required' })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            >
                                <option value="">Select Center</option>
                                {centers?.map((center: any) => (
                                    <option key={center.id} value={center.id}>
                                        {center.name} ({center.code})
                                    </option>
                                ))}
                            </select>
                            {errors.centerId && <span className="text-red-500 text-xs">{errors.centerId.message}</span>}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
                        <Button variant="primary" type="submit" isLoading={mutation.isLoading}>
                            {isEdit ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </form>
            </Card>
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

export default GroupFormPage;
