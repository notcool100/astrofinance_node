import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { toast } from 'react-toastify';
import MainLayout from '@/components/layout/MainLayout';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

type CenterFormProps = {
    name: string;
    code: string;
    address: string;
    meetingDay: number;
};

const CenterFormPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const isEdit = id && id !== 'new';
    const queryClient = useQueryClient();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<CenterFormProps>();

    const { data: center, isLoading } = useQuery(['center', id], async () => {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/centers/${id}`);
        return data;
    }, {
        enabled: !!isEdit,
        onSuccess: (data) => reset(data)
    });

    const mutation = useMutation(async (data: CenterFormProps) => {
        if (isEdit) {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/centers/${id}`, data);
        } else {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/centers`, data);
        }
    }, {
        onSuccess: () => {
            toast.success(`Center ${isEdit ? 'updated' : 'created'} successfully`);
            queryClient.invalidateQueries('centers');
            router.push('/admin/centers');
        },
        onError: () => {
            toast.error(`Failed to ${isEdit ? 'update' : 'create'} center`);
        }
    });

    const onSubmit = (data: CenterFormProps) => {
        // Ensure meetingDay is number
        data.meetingDay = Number(data.meetingDay);
        mutation.mutate(data);
    };

    if (isEdit && isLoading) return <MainLayout title="Edit Center"><div>Loading...</div></MainLayout>;

    return (
        <MainLayout title={isEdit ? 'Edit Center' : 'Create Center'}>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">{isEdit ? 'Edit Center' : 'Create Center'}</h1>
            </div>

            <Card>
                <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Center Name</label>
                            <input
                                {...register('name', { required: 'Name is required' })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            />
                            {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Center Code</label>
                            <input
                                {...register('code', { required: 'Code is required' })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            />
                            {errors.code && <span className="text-red-500 text-xs">{errors.code.message}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Address</label>
                            <input
                                {...register('address', { required: 'Address is required' })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            />
                            {errors.address && <span className="text-red-500 text-xs">{errors.address.message}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Meeting Day (1=Sun, 7=Sat)</label>
                            <select
                                {...register('meetingDay', { required: true })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            >
                                <option value="1">Sunday</option>
                                <option value="2">Monday</option>
                                <option value="3">Tuesday</option>
                                <option value="4">Wednesday</option>
                                <option value="5">Thursday</option>
                                <option value="6">Friday</option>
                                <option value="7">Saturday</option>
                            </select>
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

export default CenterFormPage;
