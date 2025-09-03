export interface WorkHours {
  _id?: string;
  date: Date;
  location: string;
  hours: number;
  description?: string;
  employeeName?: string;
  employee?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }
  createdAt?: Date;
  deletedByUser?: boolean;
  deletedByManager?: boolean;
  deletedAt?: string | Date | null;
}


export interface WorkHoursState {
  workHours: WorkHours[];
  isLoading: boolean;
  error: string | null;

  // Methods
  fetchWorkHoursByManager: () => Promise<WorkHours[]>;
  fetchWorkHoursByEmployee: () => Promise<WorkHours[]>;
  addWorkHours: (workHours: Omit<WorkHours, '_id' | 'createdAt'>) => Promise<WorkHours>;
  updateWorkHours: (id: string, updates: Partial<WorkHours>) => Promise<WorkHours>;
  deleteWorkHours: (id: string[]) => Promise<void>;
}