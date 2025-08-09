import apiService from './api';

export interface SmsTemplate {
  id: string;
  name: string;
  code: string;
  content: string;
  isActive: boolean;
}

export const getSmsTemplates = async (): Promise<SmsTemplate[]> => {
  return apiService.get<SmsTemplate[]>('/notification/sms/templates');
};

export const getSmsTemplateById = async (id: string): Promise<SmsTemplate> => {
  return apiService.get<SmsTemplate>(`/notification/sms/templates/${id}`);
};

export const createSmsTemplate = async (data: Partial<SmsTemplate>): Promise<SmsTemplate> => {
  return apiService.post<SmsTemplate>('/notification/sms/templates', data);
};

export const updateSmsTemplate = async (id: string, data: Partial<SmsTemplate>): Promise<SmsTemplate> => {
  return apiService.put<SmsTemplate>(`/notification/sms/templates/${id}`, data);
};

export const deleteSmsTemplate = async (id: string): Promise<{ message: string }> => {
  return apiService.delete<{ message: string }>(`/notification/sms/templates/${id}`);
};

export const getSmsEvents = async (): Promise<string[]> => {
  return apiService.get<string[]>('/notification/sms/events');
};

export const sendTestSms = async (data: { to: string; templateId: string; variables?: Record<string, string> }): Promise<{ message: string }> => {
  return apiService.post<{ message: string }>('/notification/sms/test', data);
};
