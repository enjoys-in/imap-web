import React from 'react'
import { MailList } from "../_components/mail"
import { SpotToolbar } from "../_components/SpotToolbar"
 
const template = ({ children }: { children: React.ReactNode }) => {
    
    return (
        <div>
            <SpotToolbar />
            <MailList >
                {children}
            </MailList>
        </div>
    )
}

export default template