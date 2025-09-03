// services/team.ts
import { apiRequest } from './api';

// Team API service

export interface TeamResponse {
    data: any;
}

export const fetchTeamMembers = async (): Promise<TeamResponse> => {
    return apiRequest<TeamResponse>('/team', 'GET');
};

export const addTeamMember = async (
    email: string,
): Promise<TeamResponse> => {
    return apiRequest<TeamResponse>('/team', 'POST', {
        email
    });
};

export const removeTeamMember = async (
    userId: string,
): Promise<TeamResponse> => {
    return apiRequest<TeamResponse>(`/team/${userId}`, 'DELETE');
};

export const accpetInvitationTeamMember = async (
    managerId: string,
): Promise<TeamResponse> => {
    return apiRequest<TeamResponse>(`/team/accept-invitation`, 'POST', {
        managerId
    });
}