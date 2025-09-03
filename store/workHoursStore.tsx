// store/workHoursStore.ts
import { create } from 'zustand';
import * as workHoursService from '../services/workHours';
import { WorkHours, WorkHoursState } from '../types/workHours';

const useWorkHoursStore = create<WorkHoursState>((set, get) => ({
    workHours: [],
    isLoading: false,
    error: null,

    // Fetch workHours by manager
    fetchWorkHoursByManager: async () => {
        try {
            set({ isLoading: true, error: null });

            const data = await workHoursService.fetchWorkHoursByManager();

            set({ workHours: data, isLoading: false });
            return data;

        } catch (error: any) {
            const errMsg = error?.response?.data?.message || 'Failed to fetch workHours';
            set({ isLoading: false, error: errMsg });
            throw error;
        }
    },

    // Fetch workHours by employee
    fetchWorkHoursByEmployee: async () => {
        try {
            set({ isLoading: true, error: null });

            // Use the workHours service to fetch workHours for the specific date
            const data = await workHoursService.fetchWorkHoursByEmployee();

            set({ workHours: data, isLoading: false });
            return data;
        } catch (error: any) {
            const errMsg = error?.response?.data?.message || 'Failed to fetch workHours';
            set({ isLoading: false, error: errMsg });
            throw error;
        }
    },

    // Add new workHours
    addWorkHours: async (workHours: Omit<WorkHours, '_id' | 'createdBy'>) => {
        try {
            set({ isLoading: true, error: null });

            // Use the workHours service to add a new workHours
            const newWorkHours = await workHoursService.addWorkHours(workHours);
            console.log('newWorkHours', newWorkHours);

            // Update local state
            set(state => ({
                workHours: [...state.workHours, newWorkHours],
                isLoading: false
            }));

            return newWorkHours;
        } catch (error: any) {
            const errMsg = error?.response?.data?.message || 'Failed to add workHours';
            set({
                isLoading: false,
                error: errMsg
            });
            throw error;
        }
    },

    // Update existing workHours
    updateWorkHours: async (id: string, updates: Partial<WorkHours>) => {
        try {
            set({ isLoading: true, error: null });

            // Use the workHours service to update the workHours
            const updatedWorkHours = await workHoursService.updateWorkHours(id, updates);

            // Update local state
            set(state => ({
                workHours: state.workHours.map(app =>
                    app._id === id ? updatedWorkHours : app
                ),
                isLoading: false
            }));

            return updatedWorkHours;
        } catch (error: any) {
            const errMsg = error?.response?.data?.message || 'Failed to update workHours';
            set({
                isLoading: false,
                error: errMsg
            });
            throw error;
        }
    },

    // Delete workHours (matches the existing component interface)
    deleteWorkHours: async (ids: string[]) => {
        try {
            set({ isLoading: true, error: null });

            // Use bulk delete if multiple IDs, single delete if one ID
            if (ids.length > 1) {
                await workHoursService.deleteWorkHoursBulk(ids);
            } else {
                await workHoursService.deleteWorkHours(ids[0]);
            }

            // Remove from local state (since the component expects them to be gone)
            set(state => ({
                workHours: state.workHours.filter(wh => !ids.includes(wh._id || '')),
                isLoading: false
            }));

        } catch (error: any) {
            const errMsg = error?.response?.data?.message || 'Failed to delete workHours';
            set({
                isLoading: false,
                error: errMsg
            });
            throw error;
        }
    },
}));

export default useWorkHoursStore;