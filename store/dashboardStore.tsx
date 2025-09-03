// store/dashboardStore.ts
import { create } from 'zustand';
import * as appointmentService from '../services/appointment';
import { DashboardState, Appointment } from '../types/dashboard';

const useDashboardStore = create<DashboardState>((set, get) => ({
    allAppointments: [],
    appointments: [],
    isLoadingAppointments: false,
    error: null,

    fetchAllAppointments: async () => {
        try {
            set({ isLoadingAppointments: true, error: null });

            // Use the appointment service to fetch appointments
            const data = await appointmentService.fetchAllAppointments();

            set({ allAppointments: data, isLoadingAppointments: false });
            return data;
        } catch (error: any) {
            const errMsg = error?.response?.data?.message || 'Failed to fetch all appointments';
            set({
                isLoadingAppointments: false,
                error: errMsg
            });
            throw error;
        }
    },

    // Fetch appointments for a specific date
    fetchAppointments: async (date: string) => {
        try {
            set({ isLoadingAppointments: true, error: null });

            // Format date if needed (expecting YYYY-MM-DD format)
            const formattedDate = new Date(date).toISOString().split('T')[0];

            // Use the appointment service to fetch appointments for the specific date
            const data = await appointmentService.fetchAppointments(formattedDate);

            set({ appointments: data, isLoadingAppointments: false });
            return data;
        } catch (error: any) {
            const errMsg = error?.response?.data?.message || 'Failed to fetch appointments';
            set({ isLoadingAppointments: false, error: errMsg });
            throw error;
        }
    },

    // Add new appointment
    addAppointment: async (appointment: Omit<Appointment, '_id' | 'createdBy'>) => {
        try {
            set({ isLoadingAppointments: true, error: null });

            // Use the appointment service to add a new appointment
            const newAppointment = await appointmentService.addAppointment(appointment);

            // Update local state
            set(state => ({
                allAppointments: [...state.allAppointments, newAppointment],
                isLoadingAppointments: false
            }));

            return newAppointment;
        } catch (error: any) {
            const errMsg = error?.response?.data?.message || 'Failed to add appointment';
            set({
                isLoadingAppointments: false,
                error: errMsg
            });
            throw error;
        }
    },

    // Update existing appointment
    updateAppointment: async (id: string, updates: Partial<Appointment>) => {
        try {
            set({ isLoadingAppointments: true, error: null });

            // Use the appointment service to update the appointment
            const updatedAppointment = await appointmentService.updateAppointment(id, updates);

            // Update local state
            set(state => ({
                appointments: state.appointments.map(app =>
                    app._id === id ? updatedAppointment : app
                ),
                isLoadingAppointments: false
            }));

            return updatedAppointment;
        } catch (error: any) {
            const errMsg = error?.response?.data?.message || 'Failed to update appointment';
            set({
                isLoadingAppointments: false,
                error: errMsg
            });
            throw error;
        }
    },

    // Delete appointment
    deleteAppointment: async (id: string) => {
        try {
            set({ isLoadingAppointments: true, error: null });

            // Use the appointment service to delete the appointment
            await appointmentService.deleteAppointment(id);

            // Update local state
            set(state => ({
                allAppointments: state.allAppointments.filter(app => app._id !== id),
                isLoadingAppointments: false
            }));
        } catch (error: any) {
            const errMsg = error?.response?.data?.message || 'Failed to delete appointment';
            set({
                isLoadingAppointments: false,
                error: errMsg
            });
            throw error;
        }
    },
}));

export default useDashboardStore;