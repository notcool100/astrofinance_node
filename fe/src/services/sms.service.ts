import apiService from "./api";

export interface SmsTemplate {
	id: string;
	name: string;
	category: string;
	content: string;
	variables?: Record<string, string>;
	characterCount: number;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	smsEventId?: string;
	smsEvents?: SmsEvent[];
}

export interface SmsEvent {
	id: string;
	eventCode: string;
	description: string;
	isActive: boolean;
}

export const getSmsTemplates = async (): Promise<SmsTemplate[]> => {
	return apiService.get<SmsTemplate[]>("/notification/sms/templates");
};

export const getSmsTemplateById = async (id: string): Promise<SmsTemplate> => {
	return apiService.get<SmsTemplate>(`/notification/sms/templates/${id}`);
};

export const createSmsTemplate = async (
	data: Partial<SmsTemplate>,
): Promise<SmsTemplate> => {
	return apiService.post<SmsTemplate>("/notification/sms/templates", data);
};

export const updateSmsTemplate = async (
	id: string,
	data: Partial<SmsTemplate>,
): Promise<SmsTemplate> => {
	return apiService.put<SmsTemplate>(`/notification/sms/templates/${id}`, data);
};

export const deleteSmsTemplate = async (
	id: string,
): Promise<{ message: string }> => {
	return apiService.delete<{ message: string }>(
		`/notification/sms/templates/${id}`,
	);
};

export const getSmsEvents = async (): Promise<SmsEvent[]> => {
	return apiService.get<SmsEvent[]>("/notification/sms/events");
};

export const sendTestSms = async (data: {
	to: string;
	templateId: string;
	variables?: Record<string, string>;
}): Promise<{ message: string }> => {
	return apiService.post<{ message: string }>("/notification/sms/test", data);
};
