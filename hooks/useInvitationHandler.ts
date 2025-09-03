// hooks/useInvitationHandler.ts
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import useAuthStore from '@/store/authStore';
import {
  parseInvitationLink,
  saveInvitationData,
  getInvitationData,
  clearInvitationData,
  InvitationData
} from '@/utils/invitationUtils';
import { accpetInvitationTeamMember } from '@/services/team';
import { accpetInvitationWorksite } from '@/services/worksite';

export const useInvitationHandler = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const user = useAuthStore(state => state.user);
  const router = useRouter();

  // Handle deep linking when app is opened via invitation link
  useEffect(() => {
    const handleInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        await handleInvitationLink(initialUrl);
      } else {
        setIsProcessing(true);
      }
    };

    const handleUrlChange = async (event: { url: string }) => {
      await handleInvitationLink(event.url);
    };

    handleInitialURL();

    const subscription = Linking.addEventListener('url', handleUrlChange);
    return () => subscription?.remove();
  }, []);

  // Process saved invitation data when user logs in
  useEffect(() => {
    if (user) {
      processInvitationAfterLogin();
    }
  }, [user]);

  const handleInvitationLink = async (url: string) => {
    const invitationData = parseInvitationLink(url);

    if (!invitationData) {
      console.log('Invalid invitation link');
      setIsProcessing(true);
      return;
    }

    console.log('Invitation data:', invitationData);

    // Save invitation data
    await saveInvitationData(invitationData);

    // Handle based on user status and invitation type
    if (!user) {
      // User not logged in
      setIsProcessing(true);
      router.push('/(auth)/login');
    } else {
      // User is already logged in
      await processInvitation(invitationData);
    }
  };

  const processInvitationAfterLogin = async () => {
    const invitationData = await getInvitationData();

    if (invitationData && user) {
      await processInvitation(invitationData);
    }
  };

  const processInvitation = async (invitationData: InvitationData) => {
    if (!user) return;


    try {
      try {
        await accpetInvitationTeamMember(invitationData.managerId);
      } catch (error) {
        console.error('Failed to accept the team invitaion', error)
      }
      // If there's a worksite, add user to worksite as well
      if (invitationData.worksiteId) {
        try {
          await accpetInvitationWorksite(invitationData.managerId, invitationData.worksiteId);
        } catch (error) {
          console.error('Failed to accept the worksite invitaion', error)
        }
      }

      // Clear invitation data after processing
      await clearInvitationData();

      // Redirect based on invitation type and user role
      if (invitationData.worksiteId) {
        // If invited to specific worksite, redirect to worksites
        console.log('invitationData.worksiteId', invitationData.worksiteId);
        console.log(`/worksite/${invitationData.worksiteId}`);
        router.replace(`/worksite/${invitationData.worksiteId}`);
      } else {
        // General team invitation
        if (user.role === 'manager') {
          router.replace('/(tabs)/dashboard');
        } else {
          router.replace('/(tabs)/worksites');
        }
      }

      setIsProcessing(true);
    } catch (error) {
      console.error('Error processing invitation:', error);
    } finally {
      setIsProcessing(true);
    }
  };

  return {
    isProcessing,
    processInvitationAfterLogin,
  };
};