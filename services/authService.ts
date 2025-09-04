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
  signInWithPopup,
  RecaptchaVerifier,
  ApplicationVerifier,
  ConfirmationResult,
  signInWithCustomToken
} from 'firebase/auth';
import { ref, set, get, child } from 'firebase/database';
import { auth, database } from '../config/firebase';

export interface UserData {
  _id: string;
  email?: string;
  phoneNumber?: string;
  displayName?: string;
  role: 'manager' | 'worker';
  createdAt: string;
  // Add other user fields as needed
}

class AuthService {
  private recaptchaVerifier: RecaptchaVerifier | null = null;

  // Initialize reCAPTCHA for phone auth
  initializeRecaptcha(containerId: string = 'recaptcha-container') {
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

      // Get user data from database
      const userDataSnapshot = await get(child(ref(database), `users/${user.uid}`));
      const userData = userDataSnapshot.val();

      return { user, userData };
    } catch (error) {
      throw error;
    }
  }

  // Sign in with phone number
  async signInWithPhoneNumber(phoneNumber: string): Promise<string> {
    try {
      if (!this.recaptchaVerifier) {
        throw new Error('reCAPTCHA not initialized. Call initializeRecaptcha() first.');
      }

      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, this.recaptchaVerifier);
      return confirmationResult.verificationId;
    } catch (error) {
      throw error;
    }
  }

  // Verify phone code and complete sign in
  async verifyPhoneCode(verificationId: string, code: string, userData?: Partial<UserData>) {
    try {
      const credential = PhoneAuthProvider.credential(verificationId, code);
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      // Check if user exists in database
      let existingUserData = await this.getCurrentUserData();
      
      if (!existingUserData) {
        // Create new user data for phone sign-in
        const userDataToSave: UserData = {
          _id: user.uid,
          phoneNumber: user.phoneNumber || '',
          displayName: userData?.displayName || user.displayName || '',
          role: userData?.role || 'worker',
          createdAt: new Date().toISOString(),
          ...userData
        };
        await set(ref(database, `users/${user.uid}`), userDataToSave);
        existingUserData = userDataToSave;
      }

      return { user, userData: existingUserData };
    } catch (error) {
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
      const currentData = await this.getCurrentUserData();
      await set(ref(database, `users/${userId}`), {
        ...currentData,
        ...updates
      });
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
        };
        await set(ref(database, `users/${user.uid}`), userData);
      }

      return { user, userData };
    } catch (error) {
      throw error;
    }
  }
}

export default new AuthService();