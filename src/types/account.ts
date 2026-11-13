export type TransportSecurity = 'None' | 'StartTls' | 'SslOnConnect';

export type AccountProviderType = 'Outlook.com' | 'Microsoft 365' | 'IMAP';

export interface Account {
  id: string;
  displayName: string;
  email: string;
  userName: string;
  imapHost: string;
  imapPort: number;
  imapSecurity: TransportSecurity;
  smtpHost: string;
  smtpPort: number;
  smtpSecurity: TransportSecurity;
  isDefault?: boolean;
  accountType?: AccountProviderType;
  requiresSignIn?: boolean;
}

export interface AccountFormData {
  displayName: string;
  email: string;
  provider: AccountProviderType;
  imapHost: string;
  imapPort: number;
  imapSecurity: TransportSecurity;
  imapUsername: string;
  imapPassword?: string;
  useSameAuth: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpSecurity: TransportSecurity;
  smtpUsername?: string;
  smtpPassword?: string;
}
