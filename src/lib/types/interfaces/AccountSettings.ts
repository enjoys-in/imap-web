import { QuotaResponse } from "./QuotaResponse";

export interface UserMailAccountSettings {
    email: string;
    settings: AccountSettings;
    updatedAt?: number;
}
export interface AccountSettings {
    notifications: {
        communication_emails: boolean;
        marketing_emails: boolean;
        social_emails: boolean;
        security_emails: boolean;
    };
    security: {
        password: string;
        password_confirmation: string;
    },
    user: {
        display_name: string;
        first_name: string;
        last_name: string;
    },
    timezone: string;
    personalization: { theme: 'dark' | 'light', layout: 'grid' | 'list' | '2-column' },
    display: { showMeetings: false, showRightSidebar: false, showCalendar: false, showQuota: false },
    account: {
        quota: QuotaResponse,
        sync: {
            last_synced_at: string;
            sync_status: string;
            sync_error: string;

        }
        auto_sync: {
            enabled: boolean;
            interval: number;
        }
        configuration: {
            imap: boolean
            smtp: boolean
        },
        
        signature: [
            {
                key: string;
                line: string;
            }
        ]
    }

}