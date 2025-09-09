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
  country?: string;
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
  
  private removeUndefined<T extends Record<string, any>>(obj: T): T {
    const cleaned: Record<string, any> = {};
    Object.keys(obj).forEach((key) => {
      const value = (obj as any)[key];
      if (value !== undefined) {
        cleaned[key] = value;
      }
    });
    return cleaned as T;
  }

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

      // Save user data to Firestore
      const userDataToSave: UserData = this.removeUndefined({
        _id: user.uid,
        email: user.email || '',
        displayName: userData.displayName || '',
        role: userData.role || 'worker',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        ...userData
      });

      await firestore().collection('users').doc(user.uid).set(userDataToSave);

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

      // Get user data from Firestore
      const userDoc = await firestore().collection('users').doc(user.uid).get();
      const userData = (userDoc.exists() ? (userDoc.data() as UserData) : null);

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
      
      if (!confirmation.verificationId) {
        throw new Error('Failed to get verification ID from confirmation');
      }
      
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
      console.log('Credential:', credential, code, verificationId);
      // If this is being called during signup completion and we don't need the code
      // (because it was already verified), we can skip the code verification
      let userCredential;
      
      if (code === '') {
        // This means we're completing signup and code was already verified
        if (this.pendingCredential) {
          console.log('Pending credential:', this.pendingCredential);
          userCredential = await auth().signInWithCredential(this.pendingCredential);
          console.log('User credential1:', userCredential);
          this.pendingCredential = null;
        } else {
          throw new Error('No pending credential found');
        }
      } else {
        // Normal code verification flow
        userCredential = await auth().signInWithCredential(credential);
        console.log('User credential2:', userCredential);
      }
      
      const user = userCredential.user;
      console.log('User:', user);

      // Check if user exists in Firestore
      let existingUserData = await this.getCurrentUserData();
      console.log('Existing user data:', existingUserData);
      
      if (!existingUserData || !existingUserData.signupCompletedAt) {
        // Create new user data for phone sign-in or complete signup
        const userDataToSave: UserData = this.removeUndefined({
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
        });
        console.log('User data to save:', userDataToSave);
        
        await firestore().collection('users').doc(user.uid).set(userDataToSave);
        console.log('User data saved:', userDataToSave);
        existingUserData = userDataToSave;
        console.log('Existing user data:', existingUserData);
      } else {
        // Update last login for existing user
        await this.updateUserData(user.uid, { lastLoginAt: new Date().toISOString() });
        console.log('Existing user data updated:', existingUserData);
      }

      return { user, userData: existingUserData };
    } catch (error: any) {
      console.error('Phone verification failed:', error);
      throw error;
    }
  }

  // Alternative method for storing credential temporarily during signup flow
  async verifyPhoneCodeForSignup(verificationId: string, code: string): Promise<{ isValid: boolean; userExists: boolean; userData?: UserData }> {
    try {
      const credential = auth.PhoneAuthProvider.credential(verificationId, code);
      
      // Test the credential without signing in
      const userCredential = await auth().signInWithCredential(credential);
      const user = userCredential.user;
      
      // Check if user already exists in Firestore
      let existingUserData: UserData | null = null;
      try {
        existingUserData = await this.getCurrentUserData();
      } catch (error) {
        console.log('No existing user data found');
      }
      
      const userExists = existingUserData && existingUserData.signupCompletedAt;
      
      // Store credential for later use and sign out immediately
      this.pendingCredential = credential;
      await auth().signOut();
      
      return { 
        isValid: true, 
        userExists: !!userExists,
        userData: existingUserData || undefined
      };
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
      const userDataToSave: UserData = this.removeUndefined({
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
      });

      await firestore().collection('users').doc(user.uid).set(userDataToSave);

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
      // 
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

      const userDoc = await firestore().collection('users').doc(user.uid).get();
      return userDoc.exists() ? (userDoc.data() as UserData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  // Update user data
  async updateUserData(userId: string, updates: Partial<UserData>) {
    try {
      await firestore().collection('users').doc(userId).set(this.removeUndefined(updates), { merge: true });
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
        userData = this.removeUndefined({
          _id: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          role: 'worker' as const,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        });
        await firestore().collection('users').doc(user.uid).set(userData as UserData);
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