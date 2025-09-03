// services/worksite.ts
import { User } from '@/types/auth';
import { File, Note, Worksite } from '../types/worksite';
import { apiRequest, formDataRequest } from './api';

// Worksite Service - API interfaces
interface ApiResponse<T> {
  status: string;
  data: T;
  results?: number;
  message?: string;
}

// Worksite APIs
export const fetchWorksites = async (): Promise<Worksite[]> => {
  const response = await apiRequest<ApiResponse<Worksite[]>>('/worksites');
  return response.data;
};

export const fetchWorksite = async (id: string): Promise<Worksite> => {
  const response = await apiRequest<ApiResponse<Worksite>>(`/worksites/${id}`);
  return response.data;
};

export const addWorksite = async (worksite: Omit<Worksite, '_id' | 'createdAt' | 'teamMembers'>): Promise<Worksite> => {
  const response = await apiRequest<ApiResponse<Worksite>>('/worksites', 'POST', worksite);
  return response.data;
};

export const updateWorksite = async (id: string, updates: Partial<Worksite>): Promise<Worksite> => {
  const response = await apiRequest<ApiResponse<Worksite>>(`/worksites/${id}`, 'PUT', updates);
  return response.data;
};

export const deleteWorksite = async (id: string): Promise<void> => {
  await apiRequest<ApiResponse<null>>(`/worksites/${id}`, 'DELETE');
};

export const fetchNotes = async (worksiteId: string, isPrivate: boolean = false): Promise<Note[]> => {
  const response = await apiRequest<ApiResponse<Note[]>>(`/worksites/${worksiteId}/notes?private=${isPrivate}`);
  return response.data;
};

export const fetchNote = async (worksiteId: string, noteId: string): Promise<Note> => {
  const response = await apiRequest<ApiResponse<Note>>(`/worksites/${worksiteId}/notes/${noteId}`);
  return response.data;
};

export const addNote = async (worksiteId: string, note: Omit<Note, '_id' | 'status' | 'createdBy' | 'createdAt' | 'teamMembers'>): Promise<any> => {
  console.log("addNote", worksiteId);
  const formData = new FormData();
  if (note.title) formData.append('title', note.title);
  if (note.content) formData.append('content', note.content);
  if (note.isPrivate) formData.append('isPrivate', note.isPrivate.toString());
  if (note.files) {
    note.files.forEach((file: any) => {
      console.log('file', file);
      formData.append('files', file);
    });
  }
  const response = await formDataRequest<ApiResponse<any>>(
    `/worksites/${worksiteId}/notes`,
    formData
  );
  return response.data;
};

export const updateNote = async (worksiteId: string, noteId: string, updates: Partial<Note>): Promise<Note> => {
  const response = await apiRequest<ApiResponse<Note>>(`/worksites/${worksiteId}/notes/${noteId}`, 'PUT', updates);
  return response.data;
};

export const deleteNote = async (worksiteId: string, noteId: string): Promise<void> => {
  await apiRequest<ApiResponse<null>>(`/worksites/${worksiteId}/notes/${noteId}`, 'DELETE');
};

export const addNoteFiles = async (worksiteId: string, noteId: string, formData: FormData): Promise<File[]> => {
  // For file uploads, we need to use a different request format - handled in API service
  const response = await formDataRequest<ApiResponse<any>>(
    `/worksites/${worksiteId}/notes/${noteId}/files`,
    formData,
  );
  return response.data;
};

export const deleteNoteFile = async (worksiteId: string, noteId: string, fileId: string): Promise<void> => {
  await apiRequest<ApiResponse<null>>(`/worksites/${worksiteId}/notes/${noteId}/files/${fileId}`, 'DELETE');
};

export const getAvailableTeamMembers = async (worksiteId: string): Promise<any> => {
  const response = await apiRequest<ApiResponse<null>>(`/worksites/${worksiteId}/team-members/available`, 'GET');
  return response.data;
}

export const addTeamMember = async (worksiteId: string, email: string): Promise<Worksite> => {
  const response = await apiRequest<ApiResponse<Worksite>>(`/worksites/${worksiteId}/team-members`, 'POST', { email });
  return response.data;
};

export const addTeamMembers = async (worksiteId: string, emails: string[]): Promise<any> => {
  const response = await apiRequest<ApiResponse<Worksite>>(`/worksites/${worksiteId}/team-members/multiple`, 'POST', { emails });
  return response.data;
};

export const removeTeamMember = async (worksiteId: string, userId: string): Promise<Worksite> => {
  const response = await apiRequest<ApiResponse<Worksite>>(`/worksites/${worksiteId}/team-members/${userId}`, 'DELETE');
  return response.data;
};

export const accpetInvitationWorksite = async (managerId: string, worksiteId: string): Promise<Worksite> => {
  const response = await apiRequest<ApiResponse<Worksite>>(`/worksites/accept-invitation`, 'POST', {
    managerId,
    worksiteId
  });
  return response.data;
};