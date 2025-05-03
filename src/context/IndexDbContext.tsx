import React, { createContext } from 'react';
import { db, airsendDB } from '@/db';

interface IndexDbContextProps {
    db: typeof db
    airsendDB: typeof airsendDB
}

export const IndexDbContext = createContext<IndexDbContextProps | undefined>(undefined);


export const IndexDbProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
    // The MailContext provider with optimistic updates
    return (
        <IndexDbContext.Provider value={{ db, airsendDB }}>
            {children}
        </IndexDbContext.Provider>
    );
};
