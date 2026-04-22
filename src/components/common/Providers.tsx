'use client';

import { UserProvider, useUser } from '@/contexts/UserContext';
import LoginModal from '@/components/common/LoginModal';
import { SWRConfig } from 'swr';

function UserAuthWrapper({ children }: { children: React.ReactNode }) {
  const { showLoginModal, setShowLoginModal, login } = useUser();
  
  return (
    <>
      {children}
      <LoginModal 
        open={showLoginModal} 
        onOpenChange={setShowLoginModal}
        onSuccess={login}
      />
    </>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig 
      value={{
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        errorRetryCount: 3,
        errorRetryInterval: 5000,
      }}
    >
      <UserProvider>
        <UserAuthWrapper>{children}</UserAuthWrapper>
      </UserProvider>
    </SWRConfig>
  );
}
