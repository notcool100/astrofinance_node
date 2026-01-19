import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { syncService } from '../services/syncService';
import OfflineIndicator from '../components/OfflineIndicator';

export default function PwaTest() {
    const [centers, setCenters] = useState<any[]>([]);
    const [status, setStatus] = useState('Idle');

    const loadLocalData = async () => {
        const localCenters = await db.centers.toArray();
        setCenters(localCenters);
    };

    useEffect(() => {
        loadLocalData();
    }, []);

    const handleDownload = async () => {
        setStatus('Downloading...');
        const result = await syncService.downloadData();
        if (result) {
            setStatus('Download Success');
            loadLocalData();
        } else {
            setStatus('Download Failed');
        }
    };

    const handleUpload = async () => {
        setStatus('Uploading...');
        const result: any = await syncService.uploadData();
        if (result.success) {
            setStatus(`Upload Success: ${result.count} sessions synced`);
        } else {
            setStatus('Upload Failed');
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">PWA & Offline Test</h1>
            <OfflineIndicator />

            <div className="mb-4 space-x-2">
                <button onClick={handleDownload} className="bg-blue-500 text-white px-4 py-2 rounded">
                    Sync Download
                </button>
                <button onClick={handleUpload} className="bg-green-500 text-white px-4 py-2 rounded">
                    Sync Upload
                </button>
            </div>

            <div className="mb-4">
                <strong>Status:</strong> {status}
            </div>

            <h2 className="text-xl font-bold">Local Centers in Dexie ({centers.length})</h2>
            <pre className="bg-gray-100 p-2 mt-2 rounded">
                {JSON.stringify(centers, null, 2)}
            </pre>
        </div>
    );
}
