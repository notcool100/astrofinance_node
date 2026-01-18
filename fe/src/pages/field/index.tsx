import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import FieldLayout from '@/components/layout/FieldLayout';
import Card from '@/components/common/Card';
import { db, Center, Group } from '@/lib/db';
import { FiChevronRight, FiMapPin, FiUsers } from 'react-icons/fi';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const FieldDashboard = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [centers, setCenters] = useState<Center[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedCenter, setSelectedCenter] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const localCenters = await db.centers.toArray();
        setCenters(localCenters);
        const localGroups = await db.groups.toArray();
        setGroups(localGroups);
    };

    const filteredGroups = selectedCenter
        ? groups.filter(g => g.centerId === selectedCenter)
        : [];

    return (
        <FieldLayout title="Dashboard">
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Welcome, {user?.firstName}</h2>
                <p className="text-sm text-gray-600">Select a center to start collection.</p>
            </div>

            {!selectedCenter ? (
                <div className="space-y-3">
                    <h3 className="font-medium text-gray-700">My Centers</h3>
                    {centers.length === 0 ? (
                        <div className="text-center py-8 bg-white rounded-lg shadow">
                            <p>No centers found.</p>
                            <p className="text-sm text-gray-500">Go to Sync page to download data.</p>
                        </div>
                    ) : (
                        centers.map(center => (
                            <div
                                key={center.id}
                                onClick={() => setSelectedCenter(center.id)}
                                className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center active:bg-blue-50 transition"
                            >
                                <div>
                                    <h4 className="font-bold text-gray-800">{center.name}</h4>
                                    <div className="flex items-center text-sm text-gray-500 mt-1">
                                        <FiMapPin className="mr-1" /> {center.address}
                                    </div>
                                </div>
                                <FiChevronRight className="text-gray-400" />
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    <button
                        onClick={() => setSelectedCenter(null)}
                        className="text-sm text-blue-600 mb-2 flex items-center"
                    >
                        ← Back to Centers
                    </button>
                    <h3 className="font-medium text-gray-700">Groups in {centers.find(c => c.id === selectedCenter)?.name}</h3>
                    {filteredGroups.length === 0 ? (
                        <p className="text-gray-500 text-sm">No groups found in this center.</p>
                    ) : (
                        filteredGroups.map(group => (
                            <div
                                key={group.id}
                                onClick={() => router.push(`/field/group/${group.id}/session`)}
                                className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center active:bg-blue-50 transition"
                            >
                                <div>
                                    <h4 className="font-bold text-gray-800">{group.name}</h4>
                                    <div className="flex items-center text-sm text-gray-500 mt-1">
                                        <FiUsers className="mr-1" /> {group.code}
                                    </div>
                                </div>
                                <FiChevronRight className="text-gray-400" />
                            </div>
                        ))
                    )}
                </div>
            )}
        </FieldLayout>
    );
};

export async function getServerSideProps({ locale }: { locale: string }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common', 'auth'])),
        },
    };
}

export default FieldDashboard;
