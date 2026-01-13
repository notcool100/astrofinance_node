import apiService from './api';
import { FiscalYear, CreateFiscalYearPayload, UpdateFiscalYearPayload } from '../types/fiscal-year';

class FiscalYearService {
    private readonly baseUrl = 'system/fiscal-years';

    async getAllFiscalYears(): Promise<FiscalYear[]> {
        return apiService.get<FiscalYear[]>(this.baseUrl);
    }

    async getFiscalYearById(id: string): Promise<FiscalYear> {
        return apiService.get<FiscalYear>(`${this.baseUrl}/${id}`);
    }

    async getCurrentFiscalYear(): Promise<FiscalYear> {
        return apiService.get<FiscalYear>(`${this.baseUrl}/current`);
    }

    async createFiscalYear(data: CreateFiscalYearPayload): Promise<FiscalYear> {
        return apiService.post<FiscalYear>(this.baseUrl, data);
    }

    async updateFiscalYear(id: string, data: UpdateFiscalYearPayload): Promise<FiscalYear> {
        return apiService.put<FiscalYear>(`${this.baseUrl}/${id}`, data);
    }

    async deleteFiscalYear(id: string): Promise<void> {
        return apiService.delete(`${this.baseUrl}/${id}`);
    }
}

export default new FiscalYearService();
