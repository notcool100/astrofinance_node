import Dexie, { Table } from 'dexie';

export interface Center {
    id: string;
    name: string;
    code: string;
    address: string;
    meetingDay: number;
}

export interface Group {
    id: string;
    name: string;
    code: string;
    centerId: string;
}

export interface Client {
    id: string;
    fullName: string;
    contactNumber: string;
    groupId: string;
    accounts: any[]; // User's accounts
}

export interface CollectionSession {
    id?: number; // Auto-increment for local indexing
    offlineId: string; // GUID
    staffId: string;
    centerId: string;
    startedAt: string;
    endedAt?: string;
    status: 'OPEN' | 'SUBMITTED' | 'SYNCED';
    latitude?: number;
    longitude?: number;
}

export interface CollectionEntry {
    id?: number;
    offlineId: string;
    sessionId: string; // Links to offlineId of session
    userId: string;
    accountId: string;
    transactionType: 'DEPOSIT' | 'LOAN_REPAYMENT' | 'WITHDRAWAL';
    amount: number;
    notes?: string;
    collectedAt: string;
    latitude?: number;
    longitude?: number;
    isSynced: boolean;
}

export interface CollectionAttendance {
    id?: number;
    offlineId: string;
    sessionId: string;
    userId: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    notes?: string;
    isSynced: boolean;
}

export class OfflineDatabase extends Dexie {
    centers!: Table<Center>;
    groups!: Table<Group>;
    clients!: Table<Client>;
    sessions!: Table<CollectionSession>;
    entries!: Table<CollectionEntry>;
    attendance!: Table<CollectionAttendance>;

    constructor() {
        super('AstroFinanceOfflineDB');
        this.version(1).stores({
            centers: 'id, code',
            groups: 'id, centerId, code',
            clients: 'id, groupId',
            sessions: '++id, offlineId, centerId, status',
            entries: '++id, offlineId, sessionId, userId, isSynced',
            attendance: '++id, offlineId, sessionId, userId, isSynced'
        });
    }
}

export const db = new OfflineDatabase();
