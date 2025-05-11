import React from 'react';
import { Button } from '@/components/ui/button';
import { Forward as MailForward } from 'lucide-react';

const EmailForwardingSection = () => {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-medium mb-2">Forward emails</h2>
      <p className="text-gray-400 mb-1">
        Automatically forward emails to another email address.
      </p>
      <a 
        href="#" 
        className="text-blue-500 hover:text-blue-400 transition-colors text-sm inline-block mb-6"
      >
        Learn more
      </a>
      
      <Button
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-4 py-2 flex items-center gap-2 text-sm font-normal"
      >
        <MailForward size={18} className="text-white" />
        Set up email forwarding
      </Button>
    </div>
  );
};

export default EmailForwardingSection;