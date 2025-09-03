import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';

export interface InvitationData {
  managerId: string;
  worksiteId?: string;
}

const INVITATION_STORAGE_KEY = 'invitation_data';

export const parseInvitationLink = (url: string): InvitationData | null => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Check if it's an invitation link: /invite/:managerId
    const inviteMatch = pathname.match(/\/invite\/(.+)/);
    if (!inviteMatch) return null;
    
    const managerId = inviteMatch[1];
    console.log('url', url);
    const worksiteId = urlObj.searchParams.get('worksiteId');
    
    if (!managerId) return null;
    
    return {
      managerId,
      ...(worksiteId && { worksiteId })
    };
  } catch (error) {
    console.error('Error parsing invitation link:', error);
    return null;
  }
};

export const saveInvitationData = async (data: InvitationData): Promise<void> => {
  try {
    await AsyncStorage.setItem(INVITATION_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving invitation data:', error);
  }
};

export const getInvitationData = async (): Promise<InvitationData | null> => {
  try {
    const data = await AsyncStorage.getItem(INVITATION_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting invitation data:', error);
    return null;
  }
};

export const clearInvitationData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(INVITATION_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing invitation data:', error);
  }
};