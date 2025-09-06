// services/authService.ts - React Native Firebase version
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import firestore from '@react-native-firebase/firestore';

export interface UserData {
  _id: string;
  email?: string;
  phoneNumber?: string;
  displayName?: string;
  name?: string;
  surname?: string;
  dateOfBirth?: string;
  gender?: string;
  profileImage?: string;
  role: 'manager' | 'worker';
  createdAt: string;
  agreements?: {
    terms: boolean;
    privacy: boolean;
    marketing: boolean;
    agreedAt: string;
  };
  signupCompletedAt?: string;
  lastLoginAt?: string;
}

class AuthService {
  private pendingCredential: any = null;

  // Sign up with email and password
  async signUp(email: string, password: string, userData: Partial<UserData>) {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Update user profile
      if (userData.displayName) {
        await user.updateProfile({
          displayName: userData.displayName
        });
      }

      // Save user data to Realtime Database
      const userDataToSave: UserData = {
        _id: user.uid,
        email: user.email!,
        displayName: userData.displayName || '',
        role: userData.role || 'worker',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        ...userData
      };

      await database().ref(`users/${user.uid}`).set(userDataToSave);

      return { user, userData: userDataToSave };
    } catch (error) {
      throw error;
    }
  }

  // Sign in with email and password
  async signIn(email: string, password: string) {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Update last login time
      await this.updateUserData(user.uid, { lastLoginAt: new Date().toISOString() });

      // Get user data from database
      const userDataSnapshot = await database().ref(`users/${user.uid}`).once('value');
      const userData = userDataSnapshot.val();

      return { user, userData };
    } catch (error) {
      throw error;
    }
  }

  // Send phone verification code using React Native Firebase
  async signInWithPhoneNumber(phoneNumber: string): Promise<string> {
    try {
      console.log('Sending verification code to:', phoneNumber);
      
      // React Native Firebase handles reCAPTCHA automatically
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      
      console.log('Verification code sent successfully');
      return confirmation.verificationId;
    } catch (error: any) {
      console.error('Failed to send verification code:', error);
      throw error;
    }
  }

  // Verify phone code and complete authentication
  async verifyPhoneCode(verificationId: string, code: string, userData?: Partial<UserData>) {
    try {
      const credential = auth.PhoneAuthProvider.credential(verificationId, code);
      
      // If this is being called during signup completion and we don't need the code
      // (because it was already verified), we can skip the code verification
      let userCredential;
      
      if (code === '') {
        // This means we're completing signup and code was already verified
        if (this.pendingCredential) {
          userCredential = await auth().signInWithCredential(this.pendingCredential);
          this.pendingCredential = null;
        } else {
          throw new Error('No pending credential found');
        }
      } else {
        // Normal code verification flow
        userCredential = await auth().signInWithCredential(credential);
      }
      
      const user = userCredential.user;

      // Check if user exists in database
      let existingUserData = await this.getCurrentUserData();
      
      if (!existingUserData || !existingUserData.signupCompletedAt) {
        // Create new user data for phone sign-in or complete signup
        const userDataToSave: UserData = {
          _id: user.uid,
          phoneNumber: user.phoneNumber || '',
          email: userData?.email || user.email || '',
          displayName: userData?.displayName || user.displayName || '',
          name: userData?.name || '',
          surname: userData?.surname || '',
          dateOfBirth: userData?.dateOfBirth,
          gender: userData?.gender,
          profileImage: userData?.profileImage,
          role: userData?.role || 'worker',
          createdAt: existingUserData?.createdAt || new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          agreements: userData?.agreements,
          signupCompletedAt: userData?.signupCompletedAt,
          ...userData
        };
        
        await database().ref(`users/${user.uid}`).set(userDataToSave);
        existingUserData = userDataToSave;
      } else {
        // Update last login for existing user
        await this.updateUserData(user.uid, { lastLoginAt: new Date().toISOString() });
      }

      return { user, userData: existingUserData };
    } catch (error: any) {
      console.error('Phone verification failed:', error);
      throw error;
    }
  }

  // Alternative method for storing credential temporarily during signup flow
  async verifyPhoneCodeForSignup(verificationId: string, code: string): Promise<boolean> {
    try {
      const credential = auth.PhoneAuthProvider.credential(verificationId, code);
      
      // Test the credential without signing in
      const userCredential = await auth().signInWithCredential(credential);
      
      // Store credential for later use and sign out immediately
      this.pendingCredential = credential;
      await auth().signOut();
      
      return true;
    } catch (error: any) {
      console.error('Phone code verification failed:', error);
      throw error;
    }
  }

  // Complete signup with pending credential
  async completeSignupWithPhoneAuth(userData: Partial<UserData>) {
    try {
      if (!this.pendingCredential) {
        throw new Error('No pending phone credential found');
      }

      const userCredential = await auth().signInWithCredential(this.pendingCredential);
      const user = userCredential.user;

      // Add email if provided
      if (userData.email && userData.email !== user.email) {
        try {
          await user.updateEmail(userData.email);
        } catch (emailError) {
          console.warn('Failed to update email:', emailError);
        }
      }

      // Update profile
      if (userData.displayName) {
        await user.updateProfile({
          displayName: userData.displayName
        });
      }

      // Save complete user data
      const userDataToSave: UserData = {
        _id: user.uid,
        phoneNumber: user.phoneNumber || '',
        email: userData.email || user.email || '',
        displayName: userData.displayName || '',
        name: userData.name || '',
        surname: userData.surname || '',
        dateOfBirth: userData.dateOfBirth,
        gender: userData.gender,
        profileImage: userData.profileImage,
        role: userData.role || 'worker',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        agreements: userData.agreements,
        signupCompletedAt: new Date().toISOString(),
      };

      await database().ref(`users/${user.uid}`).set(userDataToSave);

      // Clear pending credential
      this.pendingCredential = null;

      return { user, userData: userDataToSave };
    } catch (error) {
      console.error('Failed to complete signup:', error);
      this.pendingCredential = null;
      throw error;
    }
  }

  // Sign out
  async signOut() {
    try {
      await auth().signOut();
      this.pendingCredential = null;
    } catch (error) {
      throw error;
    }
  }

  // Get current user data
  async getCurrentUserData(): Promise<UserData | null> {
    try {
      const user = auth().currentUser;
      if (!user) return null;

      const userDataSnapshot = await database().ref(`users/${user.uid}`).once('value');
      return userDataSnapshot.val();
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  // Update user data
  async updateUserData(userId: string, updates: Partial<UserData>) {
    try {
      await database().ref(`users/${userId}`).update(updates);
    } catch (error) {
      throw error;
    }
  }

  // Reset password
  async resetPassword(email: string) {
    try {
      await auth().sendPasswordResetEmail(email);
    } catch (error) {
      throw error;
    }
  }

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: any | null, userData: UserData | null) => void): () => void {
    return auth().onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userData = await this.getCurrentUserData();
          callback(user, userData);
        } catch (error) {
          console.error('Error getting user data:', error);
          callback(user, null);
        }
      } else {
        callback(null, null);
      }
    });
  }

  // Sign in with Google (requires additional setup)
  async signInWithGoogle(credential: any) {
    try {
      const userCredential = await auth().signInWithCredential(credential);
      const user = userCredential.user;

      // Check if user exists in database
      let userData = await this.getCurrentUserData();
      
      if (!userData) {
        // Create new user data
        userData = {
          _id: user.uid,
          email: user.email!,
          displayName: user.displayName || '',
          role: 'worker',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        await database().ref(`users/${user.uid}`).set(userData);
      } else {
        // Update last login
        await this.updateUserData(user.uid, { lastLoginAt: new Date().toISOString() });
      }

      return { user, userData };
    } catch (error) {
      throw error;
    }
  }

  // Clean up resources
  cleanup() {
    this.pendingCredential = null;
  }
}

export default new AuthService();