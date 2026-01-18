import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const downloadData = async (userId: string) => {
    // Find staff associated with the user/admin
    // Assuming the userId passed is the AdminUser ID, we need to find the Staff record linked to it?
    // Or if userId is Staff ID?
    // For now, let's assume the user is authenticated as an AdminUser who is a Staff.
    // We need to find the Staff ID.

    // Implementation note: Ideally we link AdminUser to Staff.
    // For Phase 1, we'll fetch ALL accessible data or data for a specific staff if provided.

    // Let's assume the request comes with specific staffId query param or we deduce it.
    // For MVP, return all Centers and Groups for now, or filter by Staff if we can.

    // Fetch Centers (and their Groups) assigned to this staff or all active ones
    const centers = await prisma.center.findMany({
        where: { isActive: true },
        include: {
            groups: {
                where: { isActive: true },
                include: {
                    users: {
                        where: { isActive: true },
                        select: {
                            id: true,
                            fullName: true,
                            contactNumber: true,
                            // Include recent or expected installment info?
                            // For now, basic account info
                            accounts: {
                                where: { status: 'ACTIVE' },
                                select: { id: true, accountNumber: true, accountType: true, balance: true }
                            }
                        }
                    }
                }
            }
        }
    });

    return { centers };
};

export const uploadData = async (data: any) => {
    const { session, entries, attendance } = data;

    const stats = {
        session: { status: 'PENDING' as 'ADDED' | 'SKIPPED' | 'PENDING', id: '' },
        entries: { added: 0, skipped: 0 },
        attendance: { added: 0, skipped: 0 }
    };

    // 1. Create or Find Collection Session
    let collectionSession = await prisma.collectionSession.findFirst({
        where: { offlineId: session.id }
    });

    if (!collectionSession) {
        collectionSession = await prisma.collectionSession.create({
            data: {
                staffId: session.staffId,
                centerId: session.centerId,
                startedAt: session.startedAt,
                endedAt: session.endedAt,
                status: 'SUBMITTED',
                offlineId: session.id,
                latitude: session.latitude,
                longitude: session.longitude
            }
        });
        stats.session.status = 'ADDED';
    } else {
        stats.session.status = 'SKIPPED';
    }
    stats.session.id = collectionSession.id;

    // 2. Process Entries
    if (entries && Array.isArray(entries)) {
        for (const entry of entries) {
            const existing = await prisma.collectionEntry.findFirst({
                where: { offlineId: entry.id }
            });

            if (!existing) {
                await prisma.collectionEntry.create({
                    data: {
                        sessionId: collectionSession.id,
                        userId: entry.userId,
                        accountId: entry.accountId,
                        transactionType: entry.transactionType,
                        amount: entry.amount,
                        notes: entry.notes,
                        collectedAt: entry.collectedAt,
                        isSynced: true,
                        offlineId: entry.id,
                        latitude: entry.latitude,
                        longitude: entry.longitude
                    }
                });
                stats.entries.added++;
            } else {
                stats.entries.skipped++;
            }
        }
    }

    // 3. Process Attendance
    if (attendance && Array.isArray(attendance)) {
        for (const att of attendance) {
            const existing = await prisma.collectionAttendance.findFirst({
                where: { offlineId: att.id }
            });

            if (!existing) {
                await prisma.collectionAttendance.create({
                    data: {
                        sessionId: collectionSession.id,
                        userId: att.userId,
                        status: att.status,
                        notes: att.notes,
                        offlineId: att.id
                    }
                });
                stats.attendance.added++;
            } else {
                stats.attendance.skipped++;
            }
        }
    }

    return {
        success: true,
        sessionId: collectionSession.id,
        processedEntries: stats.entries.added, // Keep explicitly for backward compat if any
        processedAttendance: stats.attendance.added, // Keep explicitly for backward compat if any
        stats // Return the full detailed stats object
    };
};
