import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage/zustand';

interface OnboardingState {
  completed: boolean;
  currentStep: number;
  userData: {
    firstName: string;
    lastName: string;
    notificationsEnabled: boolean;
  };

  // Actions
  setCompleted: (completed: boolean) => void;
  setCurrentStep: (step: number) => void;
  updateUserData: (data: Partial<OnboardingState['userData']>) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  
  // Computed
  isLastStep: () => boolean;
  canProceed: () => boolean;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      completed: false,
      currentStep: 0,
      userData: {
        firstName: '',
        lastName: '',
        notificationsEnabled: true,
      },

      setCompleted: (completed: boolean) => {
        set({ completed });
      },

      setCurrentStep: (step: number) => {
        set({ currentStep: step });
      },

      updateUserData: (data: Partial<OnboardingState['userData']>) => {
        set((state) => ({
          userData: { ...state.userData, ...data },
        }));
      },

      completeOnboarding: () => {
        set({ 
          completed: true,
          currentStep: 0,
        });
      },

      resetOnboarding: () => {
        set({
          completed: false,
          currentStep: 0,
          userData: {
            firstName: '',
            lastName: '',
            notificationsEnabled: true,
          },
        });
      },
      
      isLastStep: () => {
        return get().currentStep >= 2; // 0-indexed, 3 steps total
      },
      
      canProceed: () => {
        const { userData, currentStep } = get();
        // First step requires first name
        if (currentStep === 0) {
          return userData.firstName.trim().length > 0;
        }
        return true;
      },
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        completed: state.completed,
        userData: state.userData,
      }),
    }
  )
);
