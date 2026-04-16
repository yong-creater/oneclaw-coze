'use client';

import { UserProvider, useUser } from '@/contexts/UserContext';
import LoginModal from '@/components/LoginModal';

function UserAuthWrapper({ children }: { children: React.ReactNode }) {
  const { showLoginModal, setShowLoginModal } = useUser();
  
  return (
    <>
      {children}
      <LoginModal 
        open={showLoginModal} 
        onOpenChange={setShowLoginModal}
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
