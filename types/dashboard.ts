// types/dashboard.ts
export interface Appointment {
    _id: string;
    title: string;
    date: string; // ISO string
    description?: string;
    createdBy: string; // User ID
}

export interface DashboardState {
    allAppointments: Appointment[];
    appointments: Appointment[];
    isLoadingAppointments: boolean;
    error: string | null;

    // Methods
    fetchAllAppointments: () => Promise<Appointment[]>;
    fetchAppointments: (date: string) => Promise<Appointment[]>;
    addAppointment: (appointment: Omit<Appointment, '_id' | 'createdBy'>) => Promise<Appointment>;
    updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<Appointment>;
    deleteAppointment: (id: string) => Promise<void>;
}