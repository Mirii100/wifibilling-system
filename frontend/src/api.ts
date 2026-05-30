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
