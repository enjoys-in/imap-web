import { Metadata } from 'next';
import { LoginView } from '@/components/auth/LoginView';

export const metadata: Metadata = {
  title: 'Sign In & Account Setup — AirSend',
  description: 'Sign in to AirSend Webmail or configure a new IMAP & SMTP email account with automatic XML autodiscovery.',
};

export default function LoginPage() {
  return <LoginView />;
}
