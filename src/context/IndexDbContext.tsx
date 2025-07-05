import React, { createContext } from 'react';
import { db, idbInstance } from '@/db';

interface IndexDbContextProps {
    db: typeof db
    idbInstance: typeof idbInstance
}

export const IndexDbContext = createContext<IndexDbContextProps | undefined>(undefined);


export const IndexDbProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
    // The MailContext provider with optimistic updates
    return (
        <IndexDbContext.Provider value={{ db, idbInstance }}>
            {children}
        </IndexDbContext.Provider>
    );
};
