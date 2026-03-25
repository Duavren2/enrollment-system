import api from '../utils/api';

export const getAssessment = async (studentId: string) => {
  const res = await api.get(`/payments/assessment/${studentId}`);
  return res.data;
};

export const listPayments = async (studentId: string) => {
  const res = await api.get(`/payments/student/${studentId}`);
  return res.data;
};

export const getApprovedPayments = async (studentId: string) => {
  const res = await api.get(`/payments/approved/${studentId}`);
  return res.data;
};

export const addPayment = async (studentId: string, payload: any) => {
  const res = await api.post(`/payments/student/${studentId}`, payload);
  return res.data;
};

export const downloadReceipt = async (paymentId: number | string) => {
  const res = await api.get(`/payments/receipt/${paymentId}`, { responseType: 'blob' });
  return res.data;
};

export const generateReceipt = async (paymentId: number | string) => {
  const res = await api.post(`/payments/receipt/generate/${paymentId}`);
  return res.data;
};

export default { getAssessment, listPayments, getApprovedPayments, addPayment, downloadReceipt, generateReceipt };
