import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const syncService = {
    // 1. Download Data: Fetch from API and populate local DB
    downloadData: async () => {
        try {
            // In real app, pass current user/staff ID
            const response = await fetch(`${API_URL}/sync/data`);
            if (!response.ok) throw new Error('Download failed');

            const data = await response.json();

            await db.transaction('rw', db.centers, db.groups, db.clients, async () => {
                // Clear existing reference data
                await db.centers.clear();
                await db.groups.clear();
                await db.clients.clear();

                // Populate Centers
                await db.centers.bulkAdd(data.centers.map((c: any) => ({
                    id: c.id,
                    name: c.name,
                    code: c.code,
                    address: c.address,
                    meetingDay: c.meetingDay
                })));

                // Populate Groups & Clients (flattened)
                for (const center of data.centers) {
                    if (center.groups) {
                        await db.groups.bulkAdd(center.groups.map((g: any) => ({
                            id: g.id,
                            name: g.name,
                            code: g.code,
                            centerId: center.id
                        })));

                        for (const group of center.groups) {
                            if (group.users) {
                                await db.clients.bulkAdd(group.users.map((u: any) => ({
                                    id: u.id,
                                    fullName: u.fullName,
                                    contactNumber: u.contactNumber,
                                    groupId: group.id,
                                    accounts: u.accounts || []
                                })));
                            }
                        }
                    }
                }
            });
            console.log('Download complete');
            return true;
        } catch (error) {
            console.error('Sync download error:', error);
            return false;
        }
    },

    // 2. Upload Data: Send local sessions to API
    uploadData: async () => {
        try {
            const pendingSessions = await db.sessions
                .where('status')
                .equals('SUBMITTED')
                .toArray();

            if (pendingSessions.length === 0) return { success: true, count: 0 };

            const syncResults = [];

            for (const session of pendingSessions) {
                const entries = await db.entries.where('sessionId').equals(session.offlineId).toArray();
                const attendance = await db.attendance.where('sessionId').equals(session.offlineId).toArray();

                const payload = {
                    session: {
                        id: session.offlineId,
                        staffId: session.staffId,
                        centerId: session.centerId,
                        startedAt: session.startedAt,
                        endedAt: session.endedAt,
                        latitude: session.latitude,
                        longitude: session.longitude
                    },
                    entries: entries.map(e => ({
                        id: e.offlineId,
                        userId: e.userId,
                        accountId: e.accountId,
                        transactionType: e.transactionType,
                        amount: e.amount,
                        notes: e.notes,
                        collectedAt: e.collectedAt,
                        latitude: e.latitude,
                        longitude: e.longitude
                    })),
                    attendance: attendance.map(a => ({
                        id: a.offlineId,
                        userId: a.userId,
                        status: a.status,
                        notes: a.notes
                    }))
                };

                const response = await fetch(`${API_URL}/sync/upload`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    const data = await response.json();

                    // Update Local Status
                    await db.sessions.update(session.id!, { status: 'SYNCED' });
                    await db.entries.where('sessionId').equals(session.offlineId).modify({ isSynced: true });
                    await db.attendance.where('sessionId').equals(session.offlineId).modify({ isSynced: true });

                    // Log this sync
                    syncResults.push({
                        sessionId: session.offlineId,
                        timestamp: new Date().toISOString(),
                        stats: data.stats // { session, entries, attendance }
                    });
                }
            }

            // Save Sync History to LocalStorage (Append to list, keep last 10)
            const currentHistory = JSON.parse(localStorage.getItem('SYNC_HISTORY') || '[]');
            const newHistory = [...syncResults, ...currentHistory].slice(0, 10);
            localStorage.setItem('SYNC_HISTORY', JSON.stringify(newHistory));

            return { success: true, count: syncResults.length, details: syncResults };

        } catch (error) {
            console.error('Sync upload error:', error);
            return { success: false, error };
        }
    }
};
