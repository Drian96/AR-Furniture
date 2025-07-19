import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { SignupContextType } from '../../../types/auth';

const SignupContext = createContext<SignupContextType | undefined>(undefined);

export const useSignup = (): SignupContextType => {
  const context = useContext(SignupContext);
  if (!context) {
    throw new Error('useSignup must be used within SignupProvider');
  }
  return context;
};

interface SignupProviderProps {
  children: ReactNode;
}

export const SignupProvider: React.FC<SignupProviderProps> = ({ children }) => {
  const [email, setEmail] = useState<string>('');
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);

  const resetSignup = (): void => {
    setEmail('');
    setIsEmailVerified(false);
    setCurrentStep(1);
  };

  const value: SignupContextType = {
    email,
    setEmail,
    isEmailVerified,
    setIsEmailVerified,
    currentStep,
    setCurrentStep,
    resetSignup
  };

  return (
    <SignupContext.Provider value={value}>
      {children}
    </SignupContext.Provider>
  );
};