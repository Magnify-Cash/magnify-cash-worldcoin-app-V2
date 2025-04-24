
import React, { createContext, useContext, useState, ReactNode } from 'react';

type NavigationType = 'lender' | 'borrower' | null;

interface NavigationContextType {
  userType: NavigationType;
  setUserType: (type: NavigationType) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [userType, setUserType] = useState<NavigationType>(null);

  return (
    <NavigationContext.Provider value={{ userType, setUserType }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
