import { SignupProvider, useSignup } from '../components/auth/signup/SignUpContext';
import EmailEntry from '../components/auth/signup/EmailEntry';
import VerificationCode from '../components/auth/signup/VerificationCode';
import CompleteRegistration from '../components/auth/signup/CompleteRegistration';
import SignUpBG from '../assets/SignUpBG.jpg';

const SignUpContent: React.FC = () => {
  const { currentStep } = useSignup();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4"
        style={{ backgroundImage: `url(${SignUpBG})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
        >
      <div className='absolute top-7 text-dgreen font-bold text-4xl font-serif w-full'>
        <h1 className='text-center'>AR-Furniture</h1>
      </div>
      
      {currentStep === 1 && <EmailEntry />}
      {currentStep === 2 && <VerificationCode />}
      {currentStep === 3 && <CompleteRegistration />}
    </div>
  );
};

const SignUp: React.FC = () => {
  return (
    <SignupProvider>
      <SignUpContent />
    </SignupProvider>
  );
};

export default SignUp;