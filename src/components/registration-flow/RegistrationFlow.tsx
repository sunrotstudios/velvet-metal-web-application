import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Step1_CreateAccount } from './Step1_CreateAccount';
import { Step2_ConnectServices } from './Step2_ConnectServices';
import { Step3_SyncLibrary } from './Step3_SyncLibrary';
import { Logo } from '../Logo';

export type RegistrationStep = 'create-account' | 'connect-services' | 'sync-library';

export function RegistrationFlow() {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('create-account');
  const navigate = useNavigate();

  const handleAccountCreated = () => {
    setCurrentStep('connect-services');
  };

  const handleServicesConnected = () => {
    setCurrentStep('sync-library');
  };

  const handleSyncComplete = () => {
    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-accent/10 p-4">
      <div className="w-full max-w-[400px] space-y-8">
        <Logo className="mx-auto" size="lg" />
        {currentStep === 'create-account' && (
          <Step1_CreateAccount onComplete={handleAccountCreated} />
        )}
        {currentStep === 'connect-services' && (
          <Step2_ConnectServices onComplete={handleServicesConnected} />
        )}
        {currentStep === 'sync-library' && (
          <Step3_SyncLibrary onComplete={handleSyncComplete} />
        )}
      </div>
    </div>
  );
}
