import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  subject?: string;
  body: string;
  isCustom?: boolean;
}

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: 'tmpl-meeting-followup',
    name: 'Meeting Follow-up & Next Steps',
    description: 'Recap meeting highlights, agreed outcomes, and assigned action items',
    body: `Hi {{name}},

Thank you for meeting with me today!

Here is a quick summary of what we discussed:
• Discussion highlight 1
• Discussion highlight 2

Next steps:
• Action item 1 (Target: this week)
• Action item 2

Please let me know if I missed anything.

Best regards,
{{my_name}}`,
  },
  {
    id: 'tmpl-acknowledgment',
    name: 'Quick Thanks & Acknowledgment',
    description: 'Polite, immediate confirmation that you received the email',
    body: `Hi {{name}},

Thank you for sending this over! I have received your message and will review the details shortly.

I'll follow up with you as soon as I have an update.

Best,
{{my_name}}`,
  },
  {
    id: 'tmpl-status-update',
    name: 'Project Status Update',
    description: 'Structured progress report with completed, in-progress, and blockers',
    body: `Hi {{name}},

Here is a quick status update on our current deliverables:

✅ Completed:
• Item 1 completed
• Item 2 signed off

🔄 In Progress:
• Item 3 (on schedule)

⚠️ Blockers / Dependencies:
• None at this time

Let me know if you have any questions!

Best regards,
{{my_name}}`,
  },
  {
    id: 'tmpl-intro',
    name: 'Introduction / Request a Chat',
    description: 'Warm introductory outreach suggesting a quick sync',
    body: `Hi {{name}},

I hope you're having a productive week.

I wanted to reach out regarding our shared work on {{subject}}. Would you have 15–20 minutes this week for a brief call to align on our roadmap?

Looking forward to hearing from you.

Best,
{{my_name}}`,
  },
];

export function replaceTemplateVariables(
  templateBody: string,
  vars: {
    recipientName?: string;
    senderName?: string;
    subject?: string;
    date?: string;
  }
): string {
  const safeName = vars.recipientName?.trim() || 'there';
  const safeSender = vars.senderName?.trim() || '';
  const safeSubject = vars.subject?.trim() || 'our topic';
  const safeDate = vars.date || new Date().toLocaleDateString();

  return templateBody
    .replace(/\{\{name\}\}/gi, safeName)
    .replace(/\{\{recipient_name\}\}/gi, safeName)
    .replace(/\{\{my_name\}\}/gi, safeSender)
    .replace(/\{\{sender_name\}\}/gi, safeSender)
    .replace(/\{\{subject\}\}/gi, safeSubject)
    .replace(/\{\{date\}\}/gi, safeDate);
}

interface EmailTemplatesState {
  templates: EmailTemplate[];
  addTemplate: (name: string, body: string, description?: string, subject?: string) => void;
  deleteTemplate: (id: string) => void;
  resetDefaults: () => void;
}

export const useEmailTemplatesStore = create<EmailTemplatesState>()(
  persist(
    (set) => ({
      templates: DEFAULT_TEMPLATES,
      addTemplate: (name, body, description, subject) =>
        set((state) => ({
          templates: [
            ...state.templates,
            {
              id: `custom-tmpl-${Date.now()}`,
              name,
              body,
              description: description || 'Custom email template',
              subject,
              isCustom: true,
            },
          ],
        })),
      deleteTemplate: (id) =>
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        })),
      resetDefaults: () => set({ templates: DEFAULT_TEMPLATES }),
    }),
    {
      name: 'airsend_email_templates',
    }
  )
);
