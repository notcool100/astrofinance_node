import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

// Create axios instance
const api = axios.create({
	baseURL: API_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor for adding auth token
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("token");
		if (token && config.headers) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error),
);

// Response interceptor for handling responses and errors
api.interceptors.response.use(
	(response) => {
		// Log successful responses for debugging
		console.log(`API Response [${response.status}]:`, response.config.url);

		// Handle 304 Not Modified - this shouldn't happen as an error with axios
		// but we'll check it here just in case
		if (response.status === 304) {
			console.log("304 Not Modified response detected");
		}

		return response;
	},
	(error: AxiosError) => {
		console.error("API Error:", error);
		console.error("API Error Response:", error.response);

		// Handle session expiration
		if (error.response?.status === 401) {
			// Clear local storage and redirect to login if not already there
			if (
				typeof window !== "undefined" &&
				!window.location.pathname.includes("/login")
			) {
				localStorage.removeItem("token");
				localStorage.removeItem("user");
				window.location.href = "/login";
			}
		}
		return Promise.reject(error);
	},
);

// Generic request function
const request = async <T>(config: AxiosRequestConfig): Promise<T> => {
	try {
		const response: AxiosResponse<T> = await api(config);
		console.log("API response data:", response.data);
		return response.data;
	} catch (error) {
		console.error("API request error:", error);
		if (axios.isAxiosError(error)) {
			const serverError = error as AxiosError<{
				error: { message: string; code: string; details?: any };
			}>;
			if (serverError && serverError.response) {
				console.error("Server error response:", serverError.response.data);
				throw new Error(
					serverError.response.data?.error?.message ||
						"An unexpected error occurred",
				);
			}
		}
		throw new Error("Network error");
	}
};

// API service methods
export const apiService = {
	get: <T>(url: string, params?: any) => {
		console.log("API GET request:", url, params);
		return request<T>({ method: "GET", url, params });
	},
	post: <T>(url: string, data?: any) =>
		request<T>({ method: "POST", url, data }),
	put: <T>(url: string, data?: any) => request<T>({ method: "PUT", url, data }),
	delete: <T>(url: string) => request<T>({ method: "DELETE", url }),
	upload: <T>(url: string, formData: FormData) =>
		request<T>({
			method: "POST",
			url,
			data: formData,
			headers: {
				"Content-Type": "multipart/form-data",
			},
		}),
};

export default apiService;
