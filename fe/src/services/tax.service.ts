import apiService from './api';

export interface TaxType {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface TaxRate {
  id: string;
  taxTypeId: string;
  rate: number;
  effectiveFrom: string;
}

export const getTaxTypes = async (): Promise<TaxType[]> => {
  return apiService.get<TaxType[]>('/tax/types');
};

export const createTaxType = async (data: Partial<TaxType>): Promise<TaxType> => {
  return apiService.post<TaxType>('/tax/types', data);
};

export const updateTaxType = async (id: string, data: Partial<TaxType>): Promise<TaxType> => {
  return apiService.put<TaxType>(`/tax/types/${id}`, data);
};

export const deleteTaxType = async (id: string): Promise<{ message: string }> => {
  return apiService.delete<{ message: string }>(`/tax/types/${id}`);
};

export const getTaxRates = async (): Promise<TaxRate[]> => {
  return apiService.get<TaxRate[]>('/tax/rates');
};

export const createTaxRate = async (data: Partial<TaxRate>): Promise<TaxRate> => {
  return apiService.post<TaxRate>('/tax/rates', data);
};

export const updateTaxRate = async (id: string, data: Partial<TaxRate>): Promise<TaxRate> => {
  return apiService.put<TaxRate>(`/tax/rates/${id}`, data);
};

export const deleteTaxRate = async (id: string): Promise<{ message: string }> => {
  return apiService.delete<{ message: string }>(`/tax/rates/${id}`);
};
