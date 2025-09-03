// types/auth.ts
import { User } from "./auth";

export interface TeamState {
    teamMembers: User[];
    isLoading: boolean;
    error: string | null;
    fetchTeamMembers: () => Promise<User[]>;
    addTeamMember: (email: string) => Promise<User[]>;
    removeTeamMember: (userId: string) => Promise<User[]>;
}