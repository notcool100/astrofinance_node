
async function main() {
    const baseUrl = 'http://localhost:5000/api';
    console.log('Verifying Offline API endpoints...');

    // 1. Test Download API
    try {
        console.log('Testing GET /sync/data...');
        // @ts-ignore
        const response = await fetch(`${baseUrl}/sync/data`);
        if (!response.ok) throw new Error(`Status ${response.status}`);

        const data: any = await response.json();
        console.log('Response Status:', response.status);
        console.log('Centers found:', data.centers.length);
        if (data.centers.length > 0) {
            console.log('First Center Name:', data.centers[0].name);
            if (data.centers[0].groups.length > 0) {
                console.log('First Group Name:', data.centers[0].groups[0].name);
            }
        }
    } catch (error: any) {
        console.error('Download API Failed:', error.message);
        process.exit(1);
    }

    // 2. Test Upload API
    try {
        console.log('\nTesting POST /sync/upload...');

        // Fetch fresh data to get IDs
        // @ts-ignore
        const downloadRes = await fetch(`${baseUrl}/sync/data`);
        const downloadData: any = await downloadRes.json();

        if (downloadData.centers.length === 0) {
            console.log('No centers found to test upload with.');
            return;
        }

        const center = downloadData.centers[0];
        const group = center.groups[0];
        const targetUser = group.users[0];
        const targetAccount = targetUser.accounts[0];

        const payload = {
            session: {
                id: `OFFLINE-SESSION-${Date.now()}`,
                staffId: center.staffId,
                centerId: center.id,
                startedAt: new Date().toISOString(),
                endedAt: new Date().toISOString(),
                latitude: 27.7172,
                longitude: 85.3240
            },
            entries: [
                {
                    id: `ENTRY-${Date.now()}`,
                    userId: targetUser.id,
                    accountId: targetAccount.id,
                    transactionType: 'DEPOSIT',
                    amount: 500,
                    notes: 'Test offline collection with GPS',
                    collectedAt: new Date().toISOString(),
                    latitude: 27.7172,
                    longitude: 85.3240
                }
            ],
            attendance: [
                {
                    id: `ATT-${Date.now()}`,
                    userId: targetUser.id,
                    status: 'PRESENT',
                    notes: 'On time'
                }
            ]
        };

        // @ts-ignore
        const response = await fetch(`${baseUrl}/sync/upload`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Status ${response.status}: ${errText}`);
        }

        const data: any = await response.json();
        console.log('Response Status:', response.status);
        console.log('Upload Result:', data);

        if (data.processedEntries !== 1) {
            throw new Error('Expected 1 processed entry');
        }

    } catch (error: any) {
        console.error('Upload API Failed:', error.message);
        process.exit(1);
    }

    console.log('\nVerification Successful!');
}

main();
