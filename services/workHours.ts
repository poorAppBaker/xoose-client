// services/workhours.ts
import { apiRequest } from './api';
import { WorkHours } from '@/types/workHours';

// WorkHours API service

/**
 * Fetch workhours by manager
 */
export const fetchWorkHoursByManager = async (): Promise<WorkHours[]> => {
  const response = await apiRequest<{ status: string; data: WorkHours[] }>(`/workhours/manager`);
  return response.data;
};

/**
 * Fetch workhours by employee
 */
export const fetchWorkHoursByEmployee = async (): Promise<WorkHours[]> => {
  const response = await apiRequest<{ status: string; data: WorkHours[] }>(`/workhours/employee`);
  return response.data;
};

/**
 * Add a new workhours
 * @param workhours WorkHours data (without id or createdBy)
 */
export const addWorkHours = async (workhours: Omit<WorkHours, '_id' | 'createdBy'>): Promise<WorkHours> => {
  const response = await apiRequest<{ status: string; data: WorkHours }>('/workhours', 'POST', workhours);
  return response.data;
};

/**
 * Update an existing workhours
 * @param id WorkHours ID
 * @param updates Partial workhours data to update
 */
export const updateWorkHours = async (id: string, updates: Partial<WorkHours>): Promise<WorkHours> => {
  const response = await apiRequest<{ status: string; data: WorkHours }>(`/workhours/${id}`, 'PUT', updates);
  return response.data;
};

/**
 * Soft delete a single workhours record
 * @param id WorkHours ID
 */
export const deleteWorkHours = async (id: string): Promise<{ message: string; deletedCount: number; deletedIds: string[] }> => {
  const response = await apiRequest<{ 
    status: string; 
    message: string; 
    data: { deletedCount: number; deletedIds: string[] } 
  }>(`/workhours/${id}`, 'DELETE');
  
  return {
    message: response.message,
    deletedCount: response.data.deletedCount,
    deletedIds: response.data.deletedIds
  };
};

/**
 * Soft delete multiple workhours records (bulk operation)
 * @param ids Array of WorkHours IDs
 */
export const deleteWorkHoursBulk = async (ids: string[]): Promise<{ message: string; deletedCount: number; deletedIds: string[] }> => {
  const response = await apiRequest<{ 
    status: string; 
    message: string; 
    data: { deletedCount: number; deletedIds: string[] } 
  }>('/workhours/bulk', 'DELETE', { ids });
  
  return {
    message: response.message,
    deletedCount: response.data.deletedCount,
    deletedIds: response.data.deletedIds
  };
};

/**
 * Restore a single soft deleted workhours record
 * @param id WorkHours ID
 */
export const restoreWorkHours = async (id: string): Promise<{ message: string; restoredCount: number; restoredIds: string[] }> => {
  const response = await apiRequest<{ 
    status: string; 
    message: string; 
    data: { restoredCount: number; restoredIds: string[] } 
  }>(`/workhours/restore/${id}`, 'PATCH');
  
  return {
    message: response.message,
    restoredCount: response.data.restoredCount,
    restoredIds: response.data.restoredIds
  };
};

/**
 * Restore multiple soft deleted workhours records (bulk operation)
 * @param ids Array of WorkHours IDs
 */
export const restoreWorkHoursBulk = async (ids: string[]): Promise<{ message: string; restoredCount: number; restoredIds: string[] }> => {
  const response = await apiRequest<{ 
    status: string; 
    message: string; 
    data: { restoredCount: number; restoredIds: string[] } 
  }>('/workhours/restore/bulk', 'PATCH', { ids });
  
  return {
    message: response.message,
    restoredCount: response.data.restoredCount,
    restoredIds: response.data.restoredIds
  };
};