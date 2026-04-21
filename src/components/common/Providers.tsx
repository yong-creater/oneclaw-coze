'use client';

import { UserProvider, useUser } from '@/contexts/UserContext';
import LoginModal from '@/components/common/LoginModal';

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
    <UserProvider>
      <UserAuthWrapper>{children}</UserAuthWrapper>
    </UserProvider>
  );
}
