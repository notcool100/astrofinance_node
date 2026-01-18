import { uploadData } from '../modules/sync/sync.service';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function run() {
    console.log('--- Starting Sync Robustness Verification (Direct Service Call) ---');

    // Fetch valid IDs
    const staff = await prisma.staff.findFirst();
    const center = await prisma.center.findFirst();
    const user = await prisma.user.findFirst();
    const account = await prisma.userAccount.findFirst();

    if (!staff || !center || !user) {
        console.error('❌ Missing seed data (Staff, Center, or User). Run seed script first.');
        process.exit(1);
    }

    console.log(`Using Staff: ${staff.id}, Center: ${center.id}, User: ${user.id}`);

    // 1. Create a Unique Session ID
    const offlineSessionId = uuidv4();
    const offlineEntryId = uuidv4();
    const offlineAttendanceId = uuidv4();

    const payload = {
        session: {
            id: offlineSessionId,
            staffId: staff.id,
            centerId: center.id,
            startedAt: new Date().toISOString(),
            endedAt: new Date().toISOString(),
            latitude: 12.34,
            longitude: 56.78
        },
        entries: [{
            id: offlineEntryId,
            userId: user.id,
            accountId: account?.id || 'unknown',
            transactionType: 'DEPOSIT',
            amount: 100,
            notes: 'Test Entry',
            collectedAt: new Date().toISOString(),
            latitude: 12.34,
            longitude: 56.78
        }],
        attendance: [{
            id: offlineAttendanceId,
            userId: user.id,
            status: 'PRESENT',
            notes: 'Test Attendance'
        }]
    };

    try {
        // 2. First Upload (Fresh)
        console.log('\n[1] Uploading NEW Data...');
        const data1: any = await uploadData(payload);

        console.log('Response 1:', JSON.stringify(data1, null, 2));

        if (data1.stats?.session?.status === 'ADDED' && data1.stats?.entries?.added === 1) {
            console.log('✅ First upload correctly marked as ADDED');
        } else {
            console.error('❌ Failed: Expected ADDED status');
        }

        // 3. Second Upload (Duplicate)
        console.log('\n[2] Uploading DUPLICATE Data...');
        const data2: any = await uploadData(payload);

        console.log('Response 2:', JSON.stringify(data2, null, 2));

        if (data2.stats?.session?.status === 'SKIPPED' && data2.stats?.entries?.skipped === 1) {
            console.log('✅ Duplicate upload correctly marked as SKIPPED');
        } else {
            console.error('❌ Failed: Expected SKIPPED status');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}

run();
