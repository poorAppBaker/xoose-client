// store/signupStore.ts
import { create } from 'zustand';
import { Country } from '@/components/common/PhoneNumberInput';

export interface SignupFormData {
  // Language selection
  selectedCountry: Country | null;
  
  // Phone verification
  phoneNumber: string;
  fullPhoneNumber: string;
  verificationId: string | null;
  
  // Personal info
  name: string;
  surname: string;
  dob: Date | null;
  gender: string | null;
  email: string;
  confirmEmail: string;
  profileImage: string | null;
  
  // Agreements
  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreeMarketing: boolean;
}

interface SignupState extends SignupFormData {
  // Loading states
  isLoading: boolean;
  isSendingCode: boolean;
  isVerifyingCode: boolean;
  isSubmitting: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  setSelectedCountry: (country: Country | null) => void;
  setPhoneNumber: (phone: string, fullPhone: string, country: Country) => void;
  setVerificationId: (id: string | null) => void;
  setPersonalInfo: (data: Partial<Pick<SignupFormData, 'name' | 'surname' | 'dob' | 'gender' | 'email' | 'confirmEmail' | 'profileImage'>>) => void;
  setAgreements: (data: Partial<Pick<SignupFormData, 'agreeTerms' | 'agreePrivacy' | 'agreeMarketing'>>) => void;
  setLoading: (loading: boolean) => void;
  setSendingCode: (loading: boolean) => void;
  setVerifyingCode: (loading: boolean) => void;
  setSubmitting: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: SignupFormData = {
  selectedCountry: null,
  phoneNumber: '',
  fullPhoneNumber: '',
  verificationId: null,
  name: '',
  surname: '',
  dob: null,
  gender: null,
  email: '',
  confirmEmail: '',
  profileImage: null,
  agreeTerms: false,
  agreePrivacy: false,
  agreeMarketing: false,
};

export const useSignupStore = create<SignupState>((set, get) => ({
  ...initialState,
  
  // Loading states
  isLoading: false,
  isSendingCode: false,
  isVerifyingCode: false,
  isSubmitting: false,
  error: null,
  
  // Actions
  setSelectedCountry: (country) => {
    set({ selectedCountry: country, error: null });
  },
  
  setPhoneNumber: (phone, fullPhone, country) => {
    set({ 
      phoneNumber: phone,
      fullPhoneNumber: fullPhone,
      selectedCountry: country,
      error: null 
    });
  },
  
  setVerificationId: (id) => {
    set({ verificationId: id, error: null });
  },
  
  setPersonalInfo: (data) => {
    set({ ...data, error: null });
  },
  
  setAgreements: (data) => {
    set({ ...data, error: null });
  },
  
  setLoading: (loading) => {
    set({ isLoading: loading });
  },
  
  setSendingCode: (loading) => {
    set({ isSendingCode: loading });
  },
  
  setVerifyingCode: (loading) => {
    set({ isVerifyingCode: loading });
  },
  
  setSubmitting: (loading) => {
    set({ isSubmitting: loading });
  },
  
  setError: (error) => {
    set({ error });
  },
  
  reset: () => {
    set({
      ...initialState,
      isLoading: false,
      isSendingCode: false,
      isVerifyingCode: false,
      isSubmitting: false,
      error: null,
    });
  },
}));