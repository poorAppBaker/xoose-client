// store/teamStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as teamService from '../services/team';
import { TeamState } from '@/types/team';

const useTeamStore = create<TeamState>((set, get) => ({
	teamMembers: [],
	isLoading: true,
	error: null,

	fetchTeamMembers: async () => {
		try {
			set({ isLoading: true, error: null });
			const { data } = await teamService.fetchTeamMembers();
			set({ teamMembers: data, isLoading: false, error: null });
			return data;
		} catch (error: any) {
			const errMsg = error?.response?.data?.message || 'Failed to fetch the team members';
			set({ isLoading: false, error: errMsg });
			throw error;
		}
	},

	addTeamMember: async (email: string) => {
		try {
			set({ isLoading: true, error: null });
			const { data } = await teamService.addTeamMember(email);
			set({ teamMembers: data.team, isLoading: false, error: null });
			return data;
		} catch (error: any) {
			const errMsg = error?.response?.data?.message || 'Failed to add a new member';
			set({ isLoading: false, error: errMsg });
			throw error;
		}
	},

	removeTeamMember: async (userId: string) => {
		try {
			set({ isLoading: true, error: null });
			const { data } = await teamService.removeTeamMember(userId);
			set({ teamMembers: data, isLoading: false, error: null });
			return data;
		} catch (error: any) {
			const errMsg = error?.response?.data?.message || 'Failed to remove the member';
			set({ isLoading: false, error: errMsg });
			throw error;
		}
	}
}));

export default useTeamStore;