'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { registerQueryClient } from '@/lib/queryClientRef';

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => {
    const created = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 2,
          refetchOnWindowFocus: false,
        },
      },
    });
    registerQueryClient(created);
    return created;
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
