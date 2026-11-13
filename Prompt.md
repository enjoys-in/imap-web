clone and inspect both repositories first, rather than relying only on their README files. The actual C# source code is where the valuable synchronization and email-handling logic lives.

# Project: Browser-Based Outlook Clone — React Migration

## Reference Repository

https://github.com/pentest30/outlook-clone

## Additional UI Reference

https://github.com/Megabit/BlazoriseOutlookClone

## Objective

Analyze both repositories and build a complete browser-based Outlook-style email client using Next.js, React, and TypeScript.

The primary reference is `pentest30/outlook-clone`. Study its architecture, features, business logic, email handling, data models, workflows, and UI before implementing anything.

The second repository is an additional visual reference for Outlook's web interface and Fluent UI styling.

**Important:** Do not port Avalonia UI or C# directly. Reimplement the application natively using React and TypeScript.

This must be a browser-based application. Do not use Electron, Tauri, or desktop-specific frameworks.

## Technology Stack

### Frontend
- Next.js (App Router)
- React
- TypeScript (strict mode)
- Tailwind CSS
- shadcn/ui
- Lucide React
- Zustand for application state
- TanStack Query for server state
- TanStack Virtual for large email lists

### Backend (Dont Create Bakend we have already only ui)
- Node.js
- TypeScript
- Fastify or Next.js API routes
- PostgreSQL
- Drizzle ORM
- Redis
- BullMQ for background jobs
- WebSocket or SSE for real-time updates

### Email Infrastructure
- IMAP: ImapFlow
- SMTP: Nodemailer
- Email parsing: Mailparser
- Calendar: ical.js
- HTML email rendering: Sandboxed iframe

## Features to Implement

### 1. Email Accounts
- Multiple email accounts
- IMAP/SMTP configuration
- Account switching
- Account connection status
- Authentication and credential management
- Support custom IMAP/SMTP servers

### 2. Mail Folders
- Inbox
- Sent
- Drafts
- Archive
- Deleted
- Spam
- Custom folders
- Folder counts and unread counts

### 3. Email Management
- Read and unread emails
- Send and receive emails
- Reply and reply all
- Forward emails
- Delete and archive
- Star and flag messages
- Move emails between folders
- Bulk actions
- Attachments
- Email threading/conversations

### 4. Compose Email
- Rich text editor
- To, CC and BCC
- Multiple recipients
- Attachments
- Draft autosave
- Reply and forwarding support
- HTML and plain-text emails

### 5. Email Synchronization
- Background IMAP synchronization
- IMAP IDLE support
- Incremental synchronization
- Folder synchronization
- Message flags synchronization
- Attachment downloading
- Retry and error handling
- Multiple account synchronization

### 6. Search
- Full-text email search
- Search by sender
- Search by recipient
- Search by subject
- Search by date
- Search by attachments
- Search filters

### 7. Calendar
- Calendar views
- Day, week and month views
- Create and edit events
- Invitations
- Recurring events
- ICS import/export

### 8. Offline Support
- IndexedDB for browser-side caching
- Offline email viewing
- Cached attachments
- Pending action queue
- Synchronization when connectivity returns

### 9. Notifications
- New email notifications
- WebSocket/SSE updates
- Browser notifications with permission
- Unread count updates

### 10. UI/UX

Recreate a professional Outlook-style interface.

Include:
- Left navigation sidebar
- Account switcher
- Mail folder navigation
- Top toolbar
- Search bar
- Email list
- Email preview pane
- Message actions
- Compose window
- Calendar interface
- Settings page
- Light and dark themes
- Responsive layout

Follow Fluent UI 2 design principles. Keep the interface clean, professional, and close to Microsoft Outlook.

## Architecture Requirements

Use a clear separation between frontend, backend, email synchronization, and database layers.

Suggested structure:

```text
outlook-web/
├── apps/
│   ├── web/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── stores/
│   │   ├── hooks/
│   │   └── lib/
│   └── server/
│       ├── modules/
│       │   ├── accounts/
│       │   ├── emails/
│       │   ├── folders/
│       │   ├── attachments/
│       │   ├── search/
│       │   ├── calendar/
│       │   └── notifications/
│       ├── workers/
│       ├── services/
│       └── integrations/
├── packages/
│   ├── database/
│   ├── shared/
│   └── types/
├── docker-compose.yml
└── README.md
```

## Important Engineering Requirements

1. Study the original repository thoroughly before implementation.
2. Create a feature mapping between the original C# implementation and the new TypeScript implementation.
3. Preserve the original application's functionality wherever possible.
4. Do not create a static UI mockup. Implement functional interactions.
5. Do not use hardcoded email data as the final implementation.
6. Use proper database schemas and migrations.
7. Never expose IMAP/SMTP credentials to the browser.
8. Encrypt stored email account credentials.
9. Sanitize incoming HTML emails and render them in sandboxed iframes.
10. Implement proper error handling, retries, and synchronization recovery.
11. Support multiple accounts and isolate their data.
12. Use pagination or virtualization for large email lists.
13. Make the application Docker-ready.
14. Provide environment variable examples.
15. Write meaningful tests for important workflows.

## Implementation Strategy

Work in phases:

**Phase 1:** Repository analysis, architecture documentation, feature mapping and UI implementation.

**Phase 2:** Database schema, account management and authentication.

**Phase 3:** IMAP synchronization and email storage.

**Phase 4:** SMTP sending, compose, attachments and conversations.

**Phase 5:** Search, folders, filters and bulk actions.

**Phase 6:** Calendar, offline support and notifications.

**Phase 7:** Testing, optimization, Docker deployment and documentation.

Do not stop after Phase 1. Continue implementing the actual application.

Maintain a progress document (`IMPLEMENTATION.md`) documenting completed features, pending work, architectural decisions and known limitations.

## Final Goal

Deliver a production-oriented, browser-based Outlook clone built with Next.js and TypeScript.

The result should have the functionality of the original C# application, but with a completely native React frontend and Node.js backend.

Prioritize correctness, maintainability, security, performance, and visual fidelity.