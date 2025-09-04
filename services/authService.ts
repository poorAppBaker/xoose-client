// services/authService.ts
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithCredential,
  AuthCredential,
  PhoneAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  updateEmail
} from 'firebase/auth';
import { ref, set, get, child, update } from 'firebase/database';
import { auth, database } from '../config/firebase';

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
  private recaptchaVerifier: RecaptchaVerifier | null = null;
  private pendingCredential: any = null;

  // Initialize reCAPTCHA for phone auth
  initializeRecaptcha(containerId: string = 'recaptcha-container') {
    try {
      if (this.recaptchaVerifier) {
        this.recaptchaVerifier.clear();
      }
      
      this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA solved');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
        }
      });

      return this.recaptchaVerifier;
    } catch (error) {
      console.error('Failed to initialize reCAPTCHA:', error);
      throw error;
    }
  }

  // Sign up with email and password
  async signUp(email: string, password: string, userData: Partial<UserData>) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update user profile
      if (userData.displayName) {
        await updateProfile(user, {
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

      await set(ref(database, `users/${user.uid}`), userDataToSave);

      return { user, userData: userDataToSave };
    } catch (error) {
      throw error;
    }
  }

  // Sign in with email and password
  async signIn(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update last login time
      await this.updateUserData(user.uid, { lastLoginAt: new Date().toISOString() });

      // Get user data from database
      const userDataSnapshot = await get(child(ref(database), `users/${user.uid}`));
      const userData = userDataSnapshot.val();

      return { user, userData };
    } catch (error) {
      throw error;
    }
  }

  // Send phone verification code
  async signInWithPhoneNumber(phoneNumber: string): Promise<string> {
    try {
      if (!this.recaptchaVerifier) {
        throw new Error('reCAPTCHA not initialized. Call initializeRecaptcha() first.');
      }

      console.log('Sending verification code to:', phoneNumber);
      
      const confirmationResult = await signInWithPhoneNumber(
        auth, 
        phoneNumber, 
        this.recaptchaVerifier
      );
      
      console.log('Verification code sent successfully');
      return confirmationResult.verificationId;
    } catch (error: any) {
      console.error('Failed to send verification code:', error);
      
      // Clean up reCAPTCHA on error
      if (this.recaptchaVerifier) {
        this.recaptchaVerifier.clear();
        this.recaptchaVerifier = null;
      }
      
      throw error;
    }
  }

  // Verify phone code and complete authentication
  async verifyPhoneCode(verificationId: string, code: string, userData?: Partial<UserData>) {
    try {
      const credential = PhoneAuthProvider.credential(verificationId, code);
      
      // If this is being called during signup completion and we don't need the code
      // (because it was already verified), we can skip the code verification
      let userCredential;
      
      if (code === '') {
        // This means we're completing signup and code was already verified
        if (this.pendingCredential) {
          userCredential = await signInWithCredential(auth, this.pendingCredential);
          this.pendingCredential = null;
        } else {
          throw new Error('No pending credential found');
        }
      } else {
        // Normal code verification flow
        userCredential = await signInWithCredential(auth, credential);
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
        
        await set(ref(database, `users/${user.uid}`), userDataToSave);
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
      const credential = PhoneAuthProvider.credential(verificationId, code);
      
      // Test the credential without signing in
      const userCredential = await signInWithCredential(auth, credential);
      
      // Store credential for later use and sign out immediately
      this.pendingCredential = credential;
      await signOut(auth);
      
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

      const userCredential = await signInWithCredential(auth, this.pendingCredential);
      const user = userCredential.user;

      // Add email if provided
      if (userData.email && userData.email !== user.email) {
        try {
          await updateEmail(user, userData.email);
        } catch (emailError) {
          console.warn('Failed to update email:', emailError);
        }
      }

      // Update profile
      if (userData.displayName) {
        await updateProfile(user, {
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

      await set(ref(database, `users/${user.uid}`), userDataToSave);

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
      await signOut(auth);
      if (this.recaptchaVerifier) {
        this.recaptchaVerifier.clear();
        this.recaptchaVerifier = null;
      }
      this.pendingCredential = null;
    } catch (error) {
      throw error;
    }
  }

  // Get current user data
  async getCurrentUserData(): Promise<UserData | null> {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      const userDataSnapshot = await get(child(ref(database), `users/${user.uid}`));
      return userDataSnapshot.val();
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  // Update user data
  async updateUserData(userId: string, updates: Partial<UserData>) {
    try {
      await update(ref(database, `users/${userId}`), updates);
    } catch (error) {
      throw error;
    }
  }

  // Reset password
  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  }

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: User | null, userData: UserData | null) => void): () => void {
    return onAuthStateChanged(auth, async (user) => {
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
  async signInWithGoogle(credential: AuthCredential) {
    try {
      const userCredential = await signInWithCredential(auth, credential);
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
        await set(ref(database, `users/${user.uid}`), userData);
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
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
      this.recaptchaVerifier = null;
    }
    this.pendingCredential = null;
  }
}

export default new AuthService();