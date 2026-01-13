export interface FiscalYear {
    id: string;
    name: string;
    startDateBS: string;
    endDateBS: string;
    startDateAD: string; // ISO string
    endDateAD: string; // ISO string
    isCurrent: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateFiscalYearPayload {
    name: string;
    startDateBS: string;
    endDateBS: string;
    startDateAD: Date | string;
    endDateAD: Date | string;
    isCurrent?: boolean;
    isActive?: boolean;
}

export interface UpdateFiscalYearPayload {
    name?: string;
    startDateBS?: string;
    endDateBS?: string;
    startDateAD?: Date | string;
    endDateAD?: Date | string;
    isCurrent?: boolean;
    isActive?: boolean;
}
