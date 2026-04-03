'use client';

import { UserProvider, useUser } from '@/contexts/UserContext';
import LoginModal from '@/components/LoginModal';

function UserAuthWrapper({ children }: { children: React.ReactNode }) {
  const { showLoginModal, setShowLoginModal, login } = useUser();
  
  return (
    <>
      {children}
      <LoginModal 
        open={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
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
