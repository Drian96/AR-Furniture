export interface SignupContextType {
    email: string;
    setEmail: (email: string) => void;
    isEmailVerified: boolean;
    setIsEmailVerified: (verified: boolean) => void;
    currentStep: number;
    setCurrentStep: (step: number) => void;
    resetSignup: () => void;
  }
  
  export interface ApiResponse {
    success: boolean;
    error?: string;
    message?: string;
  }
  
  export interface VerificationRequest {
    email: string;
  }
  
  export interface VerificationCodeRequest {
    email: string;
    code: string;
  }
  
  export interface RegistrationRequest {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
  }