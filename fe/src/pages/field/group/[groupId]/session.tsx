import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import { FiCheck, FiX, FiDollarSign, FiSave, FiMapPin } from 'react-icons/fi';
import FieldLayout from '@/components/layout/FieldLayout';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { db, Client, CollectionSession, CollectionEntry, CollectionAttendance } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

type Tab = 'ATTENDANCE' | 'COLLECTION';

const CollectionSessionPage = () => {
    const router = useRouter();
    const { groupId } = router.query;
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState<Tab>('ATTENDANCE');
    const [clients, setClients] = useState<Client[]>([]);
    const [session, setSession] = useState<CollectionSession | null>(null);
    const [attendance, setAttendance] = useState<Record<string, string>>({});
    const [entries, setEntries] = useState<CollectionEntry[]>([]);

    // Modal State
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [collectionAmount, setCollectionAmount] = useState('');
    const [collectionNote, setCollectionNote] = useState('');
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);

    useEffect(() => {
        if (groupId) {
            loadSessionData();
            getCurrentLocation();
        }
    }, [groupId]);

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => console.error('Error getting location', error)
            );
        }
    };

    const loadSessionData = async () => {
        const clientsData = await db.clients.where('groupId').equals(groupId as string).toArray();
        setClients(clientsData);

        const today = new Date().toISOString().split('T')[0];

        if (clientsData.length > 0) {
            const group = await db.groups.get(groupId as string);
            if (group) {
                const storedSessionId = localStorage.getItem(`OPEN_SESSION_${group.centerId}`);
                if (storedSessionId) {
                    const sess = await db.sessions.where('offlineId').equals(storedSessionId).first();
                    if (sess) {
                        setSession(sess);
                        loadEntriesAndAttendance(sess.offlineId);
                        return;
                    }
                }

                const newSession: CollectionSession = {
                    offlineId: uuidv4(),
                    staffId: user?.id || 'unknown',
                    centerId: group.centerId,
                    startedAt: new Date().toISOString(),
                    status: 'OPEN',
                    latitude: location?.lat,
                    longitude: location?.lng
                };
                await db.sessions.add(newSession);
                localStorage.setItem(`OPEN_SESSION_${group.centerId}`, newSession.offlineId);
                setSession(newSession);
            }
        }
    };

    const loadEntriesAndAttendance = async (sessionId: string) => {
        const att = await db.attendance.where('sessionId').equals(sessionId).toArray();
        const attMap: Record<string, string> = {};
        att.forEach(a => attMap[a.userId] = a.status);
        setAttendance(attMap);

        const ent = await db.entries.where('sessionId').equals(sessionId).toArray();
        setEntries(ent);
    };

    const markAttendance = async (clientId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
        if (!session) return;

        const attRecord: CollectionAttendance = {
            offlineId: uuidv4(),
            sessionId: session.offlineId,
            userId: clientId,
            status: status,
            isSynced: false
        };

        const existing = await db.attendance
            .where({ sessionId: session.offlineId, userId: clientId })
            .first();

        if (existing) {
            await db.attendance.update(existing.id!, { status });
        } else {
            await db.attendance.add(attRecord);
        }

        setAttendance(prev => ({ ...prev, [clientId]: status }));
    };

    const handleSaveCollection = async () => {
        if (!selectedClient || !session || !collectionAmount) return;

        const account = selectedClient.accounts[0];

        const newEntry: CollectionEntry = {
            offlineId: uuidv4(),
            sessionId: session.offlineId,
            userId: selectedClient.id,
            accountId: account?.id || 'unknown',
            transactionType: 'DEPOSIT',
            amount: parseFloat(collectionAmount),
            notes: collectionNote,
            collectedAt: new Date().toISOString(),
            latitude: location?.lat,
            longitude: location?.lng,
            isSynced: false
        };

        await db.entries.add(newEntry);
        setEntries(prev => [...prev, newEntry]);
        setSelectedClient(null);
        setCollectionAmount('');
        setCollectionNote('');
        toast.success('Saved');
    };

    const submitSession = async () => {
        if (!session) return;
        await db.sessions.update(session.id!, {
            status: 'SUBMITTED',
            endedAt: new Date().toISOString()
        });
        localStorage.removeItem(`OPEN_SESSION_${session.centerId}`);
        toast.success('Session Submitted!');
        router.push('/field');
    };

    return (
        <FieldLayout title="Collection Session">
            <div className="bg-white sticky top-16 z-10 shadow-sm">
                <div className="flex border-b">
                    <button
                        className={`flex-1 py-3 text-center font-medium ${activeTab === 'ATTENDANCE' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('ATTENDANCE')}
                    >
                        Attendance
                    </button>
                    <button
                        className={`flex-1 py-3 text-center font-medium ${activeTab === 'COLLECTION' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('COLLECTION')}
                    >
                        Collection
                    </button>
                </div>
            </div>

            <div className="pb-20 pt-4">
                {activeTab === 'ATTENDANCE' && (
                    <div className="space-y-2">
                        {clients.map(client => (
                            <div key={client.id} className="bg-white p-3 rounded shadow-sm flex justify-between items-center">
                                <div className="flex-1">
                                    <h4 className="font-bold">{client.fullName}</h4>
                                    <p className="text-xs text-gray-500">{client.contactNumber}</p>
                                </div>
                                <div className="flex space-x-1">
                                    <button
                                        onClick={() => markAttendance(client.id, 'PRESENT')}
                                        className={`px-3 py-1 rounded text-sm ${attendance[client.id] === 'PRESENT' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 text-gray-500'}`}
                                    >
                                        P
                                    </button>
                                    <button
                                        onClick={() => markAttendance(client.id, 'ABSENT')}
                                        className={`px-3 py-1 rounded text-sm ${attendance[client.id] === 'ABSENT' ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-gray-100 text-gray-500'}`}
                                    >
                                        A
                                    </button>
                                    <button
                                        onClick={() => markAttendance(client.id, 'LATE')}
                                        className={`px-3 py-1 rounded text-sm ${attendance[client.id] === 'LATE' ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' : 'bg-gray-100 text-gray-500'}`}
                                    >
                                        L
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'COLLECTION' && (
                    <div className="space-y-2">
                        {clients.map(client => {
                            const clientEntries = entries.filter(e => e.userId === client.id);
                            const totalCollected = clientEntries.reduce((sum, e) => sum + e.amount, 0);

                            return (
                                <div key={client.id} className="bg-white p-3 rounded shadow-sm flex justify-between items-center">
                                    <div className="flex-1">
                                        <h4 className="font-bold">{client.fullName}</h4>
                                        {totalCollected > 0 && (
                                            <span className="text-green-600 text-sm font-medium">Paid: {totalCollected}</span>
                                        )}
                                    </div>
                                    <Button
                                        size="sm"
                                        variant={totalCollected > 0 ? "outline" : "primary"}
                                        onClick={() => setSelectedClient(client)}
                                    >
                                        <FiDollarSign /> {totalCollected > 0 ? 'Add More' : 'Collect'}
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t">
                <Button className="w-full" onClick={submitSession} disabled={!session}>
                    <FiSave className="mr-2" /> Finish & Submit Session
                </Button>
            </div>

            <Modal
                isOpen={!!selectedClient}
                onClose={() => setSelectedClient(null)}
                title={`Collect from ${selectedClient?.fullName}`}
            >
                <div className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Amount</label>
                        <input
                            type="number"
                            value={collectionAmount}
                            onChange={(e) => setCollectionAmount(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-lg p-2 border"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Notes</label>
                        <input
                            type="text"
                            value={collectionNote}
                            onChange={(e) => setCollectionNote(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline" onClick={() => setSelectedClient(null)}>Cancel</Button>
                        <Button variant="primary" onClick={handleSaveCollection}>Save</Button>
                    </div>
                </div>
            </Modal>

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

export default CollectionSessionPage;
