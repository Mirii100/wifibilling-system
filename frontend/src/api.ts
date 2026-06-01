import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getPackages = () => api.get('/core/packages/');
export const initiateStkPush = (phoneNumber: string, packageId: number) => 
  api.post('/payments/stk-push/', { phone_number: phoneNumber, package_id: packageId });

export const login = (credentials: any) => api.post('/core/login/', credentials);
export const register = (data: any) => api.post('/core/register/', data);
export const updateProfile = (data: any) => api.put('/core/profile/', data);
export const changePassword = (data: any) => api.post('/core/change-password/', data);
export const getMyPlans = (username: string) => api.post('/core/my-plans/', { username });

// Admin APIs
export const getAdminStats = () => api.get('/core/admin/stats/');
export const getSubscribers = () => api.get('/core/admin/subscribers/');
export const getExpiringSubscribers = () => api.get('/core/admin/subscribers/expiring/');
export const getTransactions = () => api.get('/core/admin/transactions/');
export const getSystemSettings = () => api.get('/core/admin/settings/');
export const updateSystemSettings = (data: any) => api.patch('/core/admin/settings/', data);
export const getSessions = () => api.get('/core/admin/sessions/');
export const exportTransactions = () => `${API_BASE_URL}/core/admin/transactions/export/`;
export const addSubscriber = (data: any) => api.post('/core/admin/subscribers/', data);
export const updateSubscriber = (id: number, data: any) => api.patch(`/core/admin/subscribers/${id}/`, data);
export const deleteSubscriber = (id: number) => api.delete(`/core/admin/subscribers/${id}/`);

// Package Management APIs
export const createPackage = (data: any) => api.post('/core/packages/', data);
export const updatePackage = (id: number, data: any) => api.patch(`/core/packages/${id}/`, data);
export const deletePackage = (id: number) => api.delete(`/core/packages/${id}/`);
