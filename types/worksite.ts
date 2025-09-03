// types/worksite.ts

import { User } from "./auth";

// Team Member model
export interface TeamMember {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
}

// File model for note attachments
export interface File {
    _id: string;
    url: string;
    type: 'image' | 'document' | 'pdf' | 'other' | string;
    name: string;
    size: number;
    key?: string; // S3 key (if using AWS S3)
}

// Note model for worksite notes
export interface Note {
    _id: string;
    title: string;
    content: string;
    isPrivate: boolean;
    createdBy: string; // User ID
    createdAt: string; // ISO string
    files?: File[];
}

// Worksite model
export interface Worksite {
    _id: string;
    name: string;
    location: string;
    status: 'ongoing' | 'completed' | 'paused';
    createdAt: string; // ISO string
    teamMembers: TeamMember[];
    createdBy?: string | { id: string; firstName: string; lastName: string; email: string }; // User ID or populated user
}

// Worksite state for Zustand store
export interface WorksiteState {
    worksites: Worksite[];
    currentWorksite: Worksite | null;
    notes: Note[];
    isLoading: boolean;
    isLoadingNotes: boolean;
    error: string | null;

    // Methods
    fetchWorksites: () => Promise<Worksite[]>;
    fetchWorksite: (id: string) => Promise<Worksite>;
    addWorksite: (worksite: Omit<Worksite, '_id' | 'createdAt' | 'teamMembers'>) => Promise<Worksite>;
    updateWorksite: (id: string, updates: Partial<Worksite>) => Promise<Worksite>;
    deleteWorksite: (id: string) => Promise<void>;

    fetchNotes: (worksiteId: string, isPrivate?: boolean) => Promise<Note[]>;
    addNote: (worksiteId: string, note: Omit<Note, '_id' | 'createdAt' | 'createdBy' | 'worksiteId'>) => Promise<Note>;
    updateNote: (worksiteId: string, noteId: string, updates: Partial<Note>) => Promise<Note>;
    deleteNote: (worksiteId: string, noteId: string) => Promise<void>;

    addFilesToNote: (worksiteId: string, noteId: string, files: File[]) => Promise<File[]>;
    deleteFileFromNote: (worksiteId: string, noteId: string, fileId: string) => Promise<void>;

    getAvailableTeamMembers: (worksiteId: string) => Promise<User[]>;
    addTeamMember: (worksiteId: string, email: string) => Promise<Worksite>;
    addTeamMembers: (worksiteId: string, emails: string[]) => Promise<Worksite>;
    removeTeamMember: (worksiteId: string, userId: string) => Promise<Worksite>;
}