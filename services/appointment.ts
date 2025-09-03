// services/appointment.ts
import { apiRequest } from './api';
import { Appointment } from '../types/dashboard';

// Appointment API service

/**
 * Fetch all appointments
 */
export const fetchAllAppointments = async (): Promise<Appointment[]> => {
  const response = await apiRequest<{ status: string; data: Appointment[] }>(`/appointments`);
  return response.data;
};

/**
 * Fetch appointments for a specific date
 * @param date Date string in YYYY-MM-DD format
 */
export const fetchAppointments = async (date: string): Promise<Appointment[]> => {
  const response = await apiRequest<{ status: string; data: Appointment[] }>(`/appointments?date=${date}`);
  return response.data;
};

/**
 * Add a new appointment
 * @param appointment Appointment data (without id or createdBy)
 */
export const addAppointment = async (appointment: Omit<Appointment, '_id' | 'createdBy'>): Promise<Appointment> => {
  const response = await apiRequest<{ status: string; data: Appointment }>('/appointments', 'POST', appointment);
  return response.data;
};

/**
 * Update an existing appointment
 * @param id Appointment ID
 * @param updates Partial appointment data to update
 */
export const updateAppointment = async (id: string, updates: Partial<Appointment>): Promise<Appointment> => {
  const response = await apiRequest<{ status: string; data: Appointment }>(`/appointments/${id}`, 'PUT', updates);
  return response.data;
};

/**
 * Delete an appointment
 * @param id Appointment ID
 */
export const deleteAppointment = async (id: string): Promise<void> => {
  await apiRequest<{ status: string }>(`/appointments/${id}`, 'DELETE');
  return;
};