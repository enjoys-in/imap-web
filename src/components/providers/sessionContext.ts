'use client';

import { createContext, useContext } from 'react';
import { Account } from '@/types';

export interface SessionContextType {
  account: Account | null;
  accounts: Account[];
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  statusText: string;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
  clearSession: () => void;
}

export const SessionContext = createContext<SessionContextType>({
  account: null,
  accounts: [],
  user: null,
  isAuthenticated: false,
  isLoading: true,
  statusText: '',
  refreshSession: async () => {},
  logout: async () => {},
  clearSession: () => {},
});

export function useSession() {
  return useContext(SessionContext);
}
