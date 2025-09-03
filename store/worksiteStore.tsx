// store/worksiteStore.ts
import { create } from 'zustand';
import * as worksiteService from '../services/worksite';
import { WorksiteState, Worksite, Note, TeamMember, File } from '../types/worksite';

const useWorksiteStore = create<WorksiteState>((set, get) => ({
    worksites: [],
    currentWorksite: null,
    notes: [],
    isLoading: false,
    isLoadingNotes: false,
    error: null,

    // Fetch all worksites
    fetchWorksites: async () => {
        try {
            set({ isLoading: true, error: null });

            const data = await worksiteService.fetchWorksites();

            set({ worksites: data, isLoading: false });
            return data;
        } catch (error: any) {
            const errMsg = error?.response?.data?.message || 'Failed to fetch worksites';
            set({ isLoading: false, error: errMsg });
            throw new Error(errMsg);
        }
    },

    // Fetch single worksite
    fetchWorksite: async (id: string) => {
        try {
            set({ isLoading: true, error: null });

            const worksite = await worksiteService.fetchWorksite(id);

            set({ currentWorksite: worksite, isLoading: false });
            return worksite;
        } catch (error: any) {
            const errMsg = error?.response?.data?.message || 'Failed to fetch worksite';
            set({ isLoading: false, error: errMsg });
            throw new Error(errMsg);
        }
    },

    // Add new worksite
    addWorksite: async (worksite: Omit<Worksite, '_id' | 'createdAt' | 'teamMembers'>) => {
        try {
            set({ isLoading: true, error: null });

            const newWorksite = await worksiteService.addWorksite(worksite);

            set(state => ({
                worksites: [...state.worksites, newWorksite],
                isLoading: false
            }));
            return newWorksite;
        } catch (error: any) {
            const errMsg = error?.response?.data?.message || 'Failed to add worksite';
            set({ isLoading: false, error: errMsg });
            throw new Error(errMsg);
        }
    },

    // Update worksite
    updateWorksite: async (id: string, updates: Partial<Worksite>) => {
        try {
            set({ isLoading: true, error: null });

            const updatedWorksite = await worksiteService.updateWorksite(id, updates);

            set(state => ({
                worksites: state.worksites.map(site =>
                    site._id === id ? updatedWorksite : site
                ),
                currentWorksite: state.currentWorksite?._id === id ? updatedWorksite : state.currentWorksite,
                isLoading: false
            }));
            return updatedWorksite;
        } catch (error: any) {
            const errMsg = error?.response?.data?.message || 'Failed to update worksite';
            set({ isLoading: false, error: errMsg });
            throw new Error(errMsg);
        }
    },

    // Delete worksite
    deleteWorksite: async (id: string) => {
        try {
            set({ isLoading: true, error: null });

            await worksiteService.deleteWorksite(id);

            set(state => ({
                worksites: state.worksites.filter(site => site._id !== id),
                currentWorksite: state.currentWorksite?._id === id ? null : state.currentWorksite,
                isLoading: false
            }));
            return Promise.resolve();
        } catch (error: any) {
            const errMsg = error?.response?.data?.message || 'Failed to delete worksite';
            set({ isLoading: false, error: errMsg });
            throw new Error(errMsg);
        }
    },

    // Fetch worksite notes
    fetchNotes: async (worksiteId: string, isPrivate: boolean = false) => {
        try {
            set({ isLoadingNotes: true, error: null });

            const notes = await worksiteService.fetchNotes(worksiteId, isPrivate);

            set({ notes, isLoadingNotes: false });
            return notes;
        } catch (error: any) {
            const errMsg = error?.response?.data?.message || 'Failed to fetch notes';
            set({ isLoadingNotes: false, error: errMsg });
            throw new Error(errMsg);
        }
    },

    // Add note to worksite
    addNote: async (worksiteId: string, note: Omit<Note, '_id' | 'createdAt' | 'createdBy' | 'worksiteId'>) => {
        try {
            set({ isLoadingNotes: true, error: null });

            const newNote = await worksiteService.addNote(worksiteId, note);

            set(state => ({
                notes: [...state.notes, newNote],
                isLoadingNotes: false
            }));
            return newNote;
        } catch (error: any) {
            const errMsg = error?.response?.data?.message || 'Failed to add note';
            set({ isLoadingNotes: false, error: errMsg });
            throw new Error(errMsg);
        }
    },

    // Delete note
    deleteNote: async (worksiteId: string, noteId: string) => {
        try {
            set({ isLoadingNotes: true, error: null });

            await worksiteService.deleteNote(worksiteId, noteId);

            set(state => ({
                notes: state.notes.filter(note => note._id !== noteId),
                isLoadingNotes: false
            }));
            return Promise.resolve();
        } catch (error: any) {
            const errMsg = error?.response?.data?.message || 'Failed to delete note';
            set({ isLoadingNotes: false, error: errMsg });
            throw new Error(errMsg);
        }
    },

    // Update note
    updateNote: async (worksiteId: string, noteId: string, updates: Partial<Note>) => {
        try {
            set({ isLoadingNotes: true, error: null });

            const updatedNote = await worksiteService.updateNote(worksiteId, noteId, updates);

            set(state => ({
                notes: state.notes.map(note =>
                    note._id === noteId ? updatedNote : note
                ),
                isLoadingNotes: false
            }));

            return updatedNote;
        } catch (error: any) {
            const errMsg = error?.response?.data?.message || 'Failed to update note';
            set({ isLoadingNotes: false, error: errMsg });
            throw new Error(errMsg);
        }
    },

    // Add files to note
    addFilesToNote: async (worksiteId: string, noteId: string, fileObjects: any[]) => {
        try {
            set({ isLoadingNotes: true, error: null });

            // Create FormData for file upload
            const formData = new FormData();
            fileObjects.forEach(file => {
                formData.append('files', file);
            });

            // Upload files using the service
            const updatedFiles = await worksiteService.addNoteFiles(worksiteId, noteId, formData);
            console.log("updatedFiles", updatedFiles);

            // Update the notes state
            set(state => ({
                notes: state.notes.map(_note =>
                    _note._id === noteId ? {
                        ..._note,
                        files: [...updatedFiles]
                    } : _note
                ),
                isLoadingNotes: false
            }));

            return updatedFiles;
        } catch (error: any) {
            const errMsg = error?.response?.data?.message || 'Failed to add files to note';
            set({
                isLoadingNotes: false,
                error: errMsg
            });
            throw new Error(errMsg);
        }
    },

    // Delete file from note
    deleteFileFromNote: async (worksiteId: string, noteId: string, fileId: string) => {
        try {
            set({ isLoadingNotes: true, error: null });

            // Delete file using the service
            await worksiteService.deleteNoteFile(worksiteId, noteId, fileId);

            // Update the local note state
            set(state => {
                const updatedNotes = state.notes.map(note => {
                    if (note._id === noteId && note.files) {
                        return {
                            ...note,
                            files: note.files.filter(file => file._id !== fileId)
                        };
                    }
                    return note;
                });
                return {
                    notes: updatedNotes,
                    isLoadingNotes: false
                };
            });

            return Promise.resolve();
        } catch (error: any) {
            const errMsg = error?.response?.data?.message || 'Failed to delete file from note';
            set({
                isLoadingNotes: false,
                error: errMsg
            });
            throw new Error(errMsg);
        }
    },

    getAvailableTeamMembers: async (worksiteId: string) => {
        try {
            const members = await worksiteService.getAvailableTeamMembers(worksiteId);

            return members;
        } catch (error: any) {
            const errMsg = error?.response?.data?.message || 'Failed to fetch the available members';
            throw new Error(errMsg);
        }
    },

    // Add team member to worksite
    addTeamMembers: async (worksiteId: string, emails: string[]) => {
        try {
            set({ isLoading: true, error: null });

            const { worksite: updatedWorksite, results } = await worksiteService.addTeamMembers(worksiteId, emails);

            set(state => ({
                worksites: state.worksites.map(site =>
                    site._id === worksiteId ? updatedWorksite : site
                ),
                currentWorksite: state.currentWorksite?._id === worksiteId ? updatedWorksite : state.currentWorksite,
                isLoading: false
            }));
            return updatedWorksite;
        } catch (error: any) {
            const errMsg = error?.response?.data?.message || 'Failed to add team member';
            set({ isLoading: false, error: errMsg });
            throw new Error(errMsg);
        }
    },

    // Add team member to worksite
    addTeamMember: async (worksiteId: string, email: string) => {
        try {
            set({ isLoading: true, error: null });

            const updatedWorksite = await worksiteService.addTeamMember(worksiteId, email);

            set(state => ({
                worksites: state.worksites.map(site =>
                    site._id === worksiteId ? updatedWorksite : site
                ),
                currentWorksite: state.currentWorksite?._id === worksiteId ? updatedWorksite : state.currentWorksite,
                isLoading: false
            }));
            return updatedWorksite;
        } catch (error: any) {
            const errMsg = error?.response?.data?.message || 'Failed to add team member';
            set({ isLoading: false, error: errMsg });
            throw new Error(errMsg);
        }
    },

    // Remove team member from worksite
    removeTeamMember: async (worksiteId: string, userId: string) => {
        try {
            set({ isLoading: true, error: null });

            const updatedWorksite = await worksiteService.removeTeamMember(worksiteId, userId);

            set(state => ({
                worksites: state.worksites.map(site =>
                    site._id === worksiteId ? updatedWorksite : site
                ),
                currentWorksite: state.currentWorksite?._id === worksiteId ? updatedWorksite : state.currentWorksite,
                isLoading: false
            }));
            return updatedWorksite;
        } catch (error: any) {
            const errMsg = error?.response?.data?.message || 'Failed to remove team member';
            set({ isLoading: false, error: errMsg });
            throw new Error(errMsg);
        }
    },
}));

export default useWorksiteStore;