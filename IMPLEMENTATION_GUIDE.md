# FreeFlow - New Features Implementation Guide

This document explains the new features implemented for production deployment.

---

## 📧 Implemented Features

### 1. ✅ Real Email Service (Resend/SendGrid)

**Files Created:**
- [`lib/email.ts`](lib/email.ts) - Email service with Resend API integration
- [`.env.example`](.env.example) - Environment variables template
- [`src/vite-env.d.ts`](src/vite-env.d.ts) - TypeScript environment types

**Files Modified:**
- [`lib/supabase.ts`](lib/supabase.ts) - Updated to use environment variables
- [`views/SalesDetail.tsx`](views/SalesDetail.tsx) - Updated EmailModal to use real email service

**How to Use:**

1. **Get Resend API Key:**
   - Go to https://resend.com/api-keys
   - Create a new API key
   - Copy the key

2. **Configure Environment:**
   ```bash
   # Copy .env.example to .env
   cp .env.example .env
   
   # Add your Resend API key
   VITE_RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
   ```

3. **Email Features:**
   - Send invoices with PDF attachments
   - Send payment reminders
   - Send deadline reminders
   - Beautiful HTML email templates
   - Email logging to database

**Email Templates Included:**
- Invoice sending with PDF attachment
- Payment reminder for overdue invoices
- Deadline reminder for projects

---

### 2. ✅ Form Validation

**Files Created:**
- [`lib/validation.ts`](lib/validation.ts) - Comprehensive validation utilities

**Features:**
- Field-level validation
- Form-level validation
- Predefined validation schemas
- Common validation patterns (email, phone, URL)
- Input sanitization (XSS protection)
- HTML sanitization

**Validation Schemas:**
```typescript
// Client validation
ValidationSchemas.client

// Project validation
ValidationSchemas.project

// Invoice validation
ValidationSchemas.invoice

// Settings validation
ValidationSchemas.settings

// Auth validation
ValidationSchemas.auth
```

**How to Use:**
```typescript
import { validateForm, ValidationSchemas } from '../lib/validation';

// Validate a form
const result = validateForm(formData, ValidationSchemas.client);

if (!result.isValid) {
  // Show errors
  console.log(result.errors);
}

// Validate single field
import { validateField } from '../lib/validation';
const error = validateField(email, { required: true, pattern: ValidationPatterns.email });
```

**Sanitization:**
```typescript
import { sanitizeInput, sanitizeHtml } from '../lib/validation';

// Sanitize user input
const safeInput = sanitizeInput(userInput);

// Sanitize HTML content
const safeHtml = sanitizeHtml(htmlContent);
```

---

### 3. ✅ Notification System

**Files Created:**
- [`lib/notifications.ts`](lib/notifications.ts) - Complete notification system

**Features:**
- Create notifications
- Mark as read/unread
- Delete notifications
- Get unread count
- Notification types (invoice_sent, invoice_paid, invoice_overdue, project_deadline, etc.)
- Automatic notification generation
- Notification icons and colors

**Notification Types:**
```typescript
type NotificationType = 
  | 'invoice_sent'      // Invoice sent to client
  | 'invoice_paid'     // Payment received
  | 'invoice_overdue'  // Invoice is overdue
  | 'project_deadline' // Project deadline approaching
  | 'project_completed' // Project completed
  | 'client_added'     // New client added
  | 'payment_received'; // Payment received
```

**How to Use:**
```typescript
import { 
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createInvoiceSentNotification,
  checkOverdueInvoices,
  checkUpcomingDeadlines
} from '../lib/notifications';

// Create a notification
const notification = await createNotification({
  type: 'invoice_sent',
  title: 'Invoice Sent',
  message: 'Invoice #123 sent to Client',
  link: '/billing/view/123',
  metadata: { docId: '123', amount: 1000 }
});

// Mark as read
await markAsRead(notificationId);

// Get unread count
const unreadCount = getUnreadCount(notifications);

// Check for overdue invoices
const overdueNotifications = await checkOverdueInvoices(salesDocuments);

// Check for upcoming deadlines
const deadlineNotifications = await checkUpcomingDeadlines(projects);
```

**Notification UI Helpers:**
```typescript
import { 
  getNotificationTitle,
  getNotificationIcon,
  getNotificationColor
} from '../lib/notifications';

// Get notification details
const title = getNotificationTitle('invoice_overdue'); // "Invoice Overdue"
const icon = getNotificationIcon('invoice_overdue'); // "⚠️"
const color = getNotificationColor('invoice_overdue'); // "bg-rose-50 text-rose-600"
```

---

### 4. ✅ Data Export (CSV)

**Files Created:**
- [`lib/csv-export.ts`](lib/csv-export.ts) - CSV export utilities

**Features:**
- Export clients to CSV
- Export projects to CSV
- Export invoices to CSV
- Export time entries to CSV
- Export financial reports
- Automatic CSV formatting
- Download functionality

**How to Use:**
```typescript
import { 
  exportClientsToCSV,
  exportProjectsToCSV,
  exportInvoicesToCSV,
  exportTimeEntriesToCSV,
  exportAllData,
  exportFinancialReport
} from '../lib/csv-export';

// Export clients
exportClientsToCSV(clients);

// Export projects
exportProjectsToCSV(projects, clients);

// Export invoices
exportInvoicesToCSV(invoices, clients);

// Export time entries
exportTimeEntriesToCSV(timeEntries, projects, clients);

// Export all data
exportAllData(state);

// Export financial report
exportFinancialReport(invoices, clients);
```

**CSV Export Features:**
- Automatic escaping of special characters
- Proper CSV formatting
- Date-based filenames
- Client/project name resolution
- Financial calculations

---

### 5. ✅ Time Tracking

**Files Created:**
- [`lib/time-tracking.ts`](lib/time-tracking.ts) - Time tracking utilities

**Features:**
- Start/stop time entries
- Calculate duration
- Billable/non-billable tracking
- Hourly rate support
- Time summaries
- Duration formatting
- Grouping by date/project/client
- Date range filtering

**How to Use:**
```typescript
import { 
  startTimeEntry,
  stopTimeEntry,
  calculateTimeSummary,
  formatDuration,
  getActiveTimeEntry,
  isTimeEntryRunning,
  getElapsedTime,
  groupByDate,
  groupByProject,
  groupByClient,
  getTodayEntries,
  getThisWeekEntries,
  getThisMonthEntries
} from '../lib/time-tracking';

// Start a time entry
const entry = await startTimeEntry({
  projectId: 'project-123',
  description: 'Working on project',
  hourlyRate: 50,
  isBillable: true
});

// Stop the entry
const stoppedEntry = stopTimeEntry(entry);

// Calculate summary
const summary = calculateTimeSummary(entries);
// { totalMinutes: 120, totalHours: 2, billableMinutes: 120, ... }

// Format duration
const formatted = formatDuration(90); // "1h 30m"

// Get active entry
const active = getActiveTimeEntry(entries);

// Check if running
const running = isTimeEntryRunning(entry);

// Get elapsed time
const elapsed = getElapsedTime(entry);

// Group by date
const byDate = groupByDate(entries);

// Get today's entries
const today = getTodayEntries(entries);

// Get this week's entries
const thisWeek = getThisWeekEntries(entries);

// Get this month's entries
const thisMonth = getThisMonthEntries(entries);
```

**Time Entry Structure:**
```typescript
interface TimeEntry {
  id: string;
  projectId?: string;
  clientId?: string;
  description: string;
  startTime: string;
  endTime?: string;
  duration?: number; // in minutes
  isBillable: boolean;
  hourlyRate?: number;
  createdAt: string;
}
```

---

### 6. ✅ Recurring Invoices

**Files Created:**
- [`lib/recurring-invoices.ts`](lib/recurring-invoices.ts) - Recurring invoice utilities

**Features:**
- Multiple frequencies (weekly, biweekly, monthly, quarterly, yearly)
- Automatic next due date calculation
- Invoice generation from templates
- Validation
- Pause/resume/end functionality
- Annual revenue calculation
- Frequency labels

**How to Use:**
```typescript
import { 
  createRecurringInvoice,
  generateInvoiceFromRecurring,
  calculateNextDueDate,
  isDueForGeneration,
  getFrequencyLabel,
  getFrequencyInDays,
  getInvoicesPerYear,
  getAnnualRevenue,
  validateRecurringInvoice,
  updateNextDueDate,
  pauseRecurringInvoice,
  resumeRecurringInvoice,
  endRecurringInvoice,
  shouldEndRecurring
} from '../lib/recurring-invoices';

// Create recurring invoice
const recurring = await createRecurringInvoice({
  name: 'Monthly Retainer',
  clientId: 'client-123',
  frequency: 'monthly',
  dayOfMonth: 1,
  items: [{ description: 'Monthly retainer', quantity: 1, rate: 1000 }],
  subtotal: 1000,
  total: 1000,
  tax: 0,
  discount: 0,
  shipping: 0,
  notes: 'Monthly retainer invoice'
});

// Generate invoice from recurring
const invoice = generateInvoiceFromRecurring(recurring, 'INV-001');

// Calculate next due date
const nextDue = calculateNextDueDate(
  '2025-01-01',
  'monthly',
  1 // day of month
);

// Check if due for generation
const shouldGenerate = isDueForGeneration(recurring);

// Get frequency label
const label = getFrequencyLabel('monthly'); // "Monthly"

// Get frequency in days
const days = getFrequencyInDays('monthly'); // 30

// Get invoices per year
const perYear = getInvoicesPerYear('monthly'); // 12

// Get annual revenue
const annualRevenue = getAnnualRevenue(recurring);

// Validate
const validation = validateRecurringInvoice(recurring);
if (!validation.isValid) {
  console.log(validation.errors);
}

// Update next due date after generation
const updated = updateNextDueDate(recurring);

// Pause
const paused = pauseRecurringInvoice(recurring);

// Resume
const resumed = resumeRecurringInvoice(recurring);

// End
const ended = endRecurringInvoice(recurring);

// Check if should end
const shouldEnd = shouldEndRecurring(recurring);
```

**Recurring Invoice Structure:**
```typescript
interface RecurringInvoice {
  id: string;
  clientId?: string;
  projectId?: string;
  name: string;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  dayOfMonth?: number; // 1-31 for monthly
  dayOfWeek?: number; // 0-6 for weekly (0=Sunday)
  items: SalesItem[];
  tax: number;
  discount: number;
  shipping: number;
  subtotal: number;
  total: number;
  nextDueDate: string;
  lastGeneratedDate?: string;
  status: 'active' | 'paused' | 'ended';
  endDate?: string;
  notes: string;
  createdAt: string;
}
```

---

## 📋 Type Definitions Updated

**File Modified:**
- [`types.ts`](types.ts) - Added new types for notifications, time tracking, and recurring invoices

**New Types Added:**
```typescript
// Notification types
export type NotificationType = 'invoice_sent' | 'invoice_paid' | 'invoice_overdue' | 'project_deadline' | 'project_completed' | 'client_added' | 'payment_received';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
  metadata?: { docId?: string; projectId?: string; clientId?: string; amount?: number; };
}

// Time tracking types
export interface TimeEntry {
  id: string;
  projectId?: string;
  clientId?: string;
  description: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  isBillable: boolean;
  hourlyRate?: number;
  createdAt: string;
}

export interface TimeTrackingSummary {
  totalMinutes: number;
  totalHours: number;
  billableMinutes: number;
  billableHours: number;
  totalBillableAmount: number;
}

// Recurring invoice types
export type RecurringFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

export interface RecurringInvoice {
  id: string;
  clientId?: string;
  projectId?: string;
  name: string;
  frequency: RecurringFrequency;
  dayOfMonth?: number;
  dayOfWeek?: number;
  items: SalesItem[];
  tax: number;
  discount: number;
  shipping: number;
  subtotal: number;
  total: number;
  nextDueDate: string;
  lastGeneratedDate?: string;
  status: 'active' | 'paused' | 'ended';
  endDate?: string;
  notes: string;
  createdAt: string;
}
```

**AppState Updated:**
```typescript
export interface AppState {
  clients: Client[];
  projects: Project[];
  salesDocuments: SalesDocument[];
  notifications: Notification[];      // NEW
  timeEntries: TimeEntry[];         // NEW
  recurringInvoices: RecurringInvoice[]; // NEW
  settings: { ... };
}
```

---

## 🚀 Next Steps for Integration

### 1. Database Schema Updates

Add these tables to your Supabase database:

```sql
-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  link TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Time entries table
CREATE TABLE IF NOT EXISTS public.time_entries (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES public.projects(id) ON DELETE SET NULL,
  client_id TEXT REFERENCES public.clients(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER,
  is_billable BOOLEAN DEFAULT TRUE,
  hourly_rate NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recurring invoices table
CREATE TABLE IF NOT EXISTS public.recurring_invoices (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id TEXT REFERENCES public.clients(id) ON DELETE SET NULL,
  project_id TEXT REFERENCES public.projects(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  frequency TEXT NOT NULL,
  day_of_month INTEGER,
  day_of_week INTEGER,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  tax NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  shipping NUMERIC DEFAULT 0,
  subtotal NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  next_due_date DATE NOT NULL,
  last_generated_date DATE,
  status TEXT DEFAULT 'active',
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email logs table
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to TEXT NOT NULL,
  subject TEXT NOT NULL,
  email_id TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own time entries" ON public.time_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own recurring invoices" ON public.recurring_invoices FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own email logs" ON public.email_logs FOR ALL USING (auth.uid() = user_id);
```

### 2. Update db.ts

Add functions to sync new data types:

```typescript
// Add to db.ts
export const db = {
  // ... existing functions ...
  
  // Sync notifications
  async syncNotifications(notifications: Notification[], userId: string): Promise<void> {
    if (!supabase) return;
    
    const payload = notifications.map(n => ({
      id: n.id,
      user_id: userId,
      type: n.type,
      title: n.title,
      message: n.message,
      read: n.read,
      created_at: n.createdAt,
      link: n.link,
      metadata: n.metadata || {}
    }));
    
    await supabase.from('notifications').upsert(payload);
  },
  
  // Sync time entries
  async syncTimeEntries(entries: TimeEntry[], userId: string): Promise<void> {
    if (!supabase) return;
    
    const payload = entries.map(e => ({
      id: e.id,
      user_id: userId,
      project_id: e.projectId,
      client_id: e.clientId,
      description: e.description,
      start_time: e.startTime,
      end_time: e.endTime,
      duration: e.duration,
      is_billable: e.isBillable,
      hourly_rate: e.hourlyRate,
      created_at: e.createdAt
    }));
    
    await supabase.from('time_entries').upsert(payload);
  },
  
  // Sync recurring invoices
  async syncRecurringInvoices(invoices: RecurringInvoice[], userId: string): Promise<void> {
    if (!supabase) return;
    
    const payload = invoices.map(i => ({
      id: i.id,
      user_id: userId,
      client_id: i.clientId,
      project_id: i.projectId,
      name: i.name,
      frequency: i.frequency,
      day_of_month: i.dayOfMonth,
      day_of_week: i.dayOfWeek,
      items: i.items,
      tax: i.tax,
      discount: i.discount,
      shipping: i.shipping,
      subtotal: i.subtotal,
      total: i.total,
      next_due_date: i.nextDueDate,
      last_generated_date: i.lastGeneratedDate,
      status: i.status,
      end_date: i.endDate,
      notes: i.notes,
      created_at: i.createdAt
    }));
    
    await supabase.from('recurring_invoices').upsert(payload);
  },
  
  // Get notifications
  async getNotifications(userId: string): Promise<Notification[]> {
    if (!supabase) return [];
    
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    return data || [];
  },
  
  // Get time entries
  async getTimeEntries(userId: string): Promise<TimeEntry[]> {
    if (!supabase) return [];
    
    const { data } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: false });
    
    return data || [];
  },
  
  // Get recurring invoices
  async getRecurringInvoices(userId: string): Promise<RecurringInvoice[]> {
    if (!supabase) return [];
    
    const { data } = await supabase
      .from('recurring_invoices')
      .select('*')
      .eq('user_id', userId)
      .order('next_due_date', { ascending: true });
    
    return data || [];
  }
};
```

### 3. Create UI Components

Create new views/components for:

**Time Tracking View:**
- `views/TimeTracking.tsx` - Time entry list, start/stop timer
- `components/TimeEntryCard.tsx` - Individual time entry display
- `components/Timer.tsx` - Live timer component

**Notifications View:**
- `views/Notifications.tsx` - Notification list with mark as read
- `components/NotificationItem.tsx` - Individual notification display
- `components/NotificationBell.tsx` - Bell icon with unread count

**Recurring Invoices View:**
- `views/RecurringInvoices.tsx` - List of recurring invoices
- `components/RecurringInvoiceCard.tsx` - Individual recurring invoice display
- `components/RecurringInvoiceForm.tsx` - Create/edit form

**Export Components:**
- Add export buttons to existing views:
  - Clients view: Export clients button
  - Projects view: Export projects button
  - Billing view: Export invoices button
  - Settings view: Export all data button

### 4. Update Sidebar

Add new navigation items to [`components/Sidebar.tsx`](components/Sidebar.tsx):

```typescript
const menuItems = [
  { to: '/', icon: LayoutGrid, label: 'Dashboard' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/projects', icon: Briefcase, label: 'Projects' },
  { to: '/billing', icon: Receipt, label: 'Invoice' },
  { to: '/time-tracking', icon: Clock, label: 'Time Tracking' }, // NEW
  { to: '/recurring', icon: RefreshCw, label: 'Recurring' }, // NEW
  { to: '/notifications', icon: Bell, label: 'Notifications' }, // NEW
  { to: '/settings', icon: Settings, label: 'Settings' },
];
```

---

## 📝 Summary

All requested features have been implemented as utility libraries that can be easily integrated into the existing codebase:

| Feature | Status | Files Created |
|----------|--------|--------------|
| Real Email Service | ✅ Complete | lib/email.ts, .env.example, src/vite-env.d.ts |
| Form Validation | ✅ Complete | lib/validation.ts |
| Notification System | ✅ Complete | lib/notifications.ts |
| Data Export (CSV) | ✅ Complete | lib/csv-export.ts |
| Time Tracking | ✅ Complete | lib/time-tracking.ts |
| Recurring Invoices | ✅ Complete | lib/recurring-invoices.ts |

**Type Definitions Updated:**
- [`types.ts`](types.ts) - Added Notification, TimeEntry, TimeTrackingSummary, RecurringInvoice, RecurringFrequency types

**Files Modified:**
- [`lib/supabase.ts`](lib/supabase.ts) - Environment variable support
- [`views/SalesDetail.tsx`](views/SalesDetail.tsx) - Real email integration
- [`tsconfig.json`](tsconfig.json) - Added src directory and vite/client types

---

## 🎯 Production Deployment Checklist

Before deploying to production, ensure:

- [ ] Add Resend API key to environment variables
- [ ] Run database schema updates (add new tables)
- [ ] Update db.ts with new sync functions
- [ ] Create UI components for new features
- [ ] Add routes to App.tsx for new views
- [ ] Test all email functionality
- [ ] Test CSV exports
- [ ] Test time tracking
- [ ] Test recurring invoices
- [ ] Test notifications
- [ ] Test form validation
- [ ] Add error boundaries
- [ ] Add loading states
- [ ] Add rate limiting
- [ ] Add security headers
- [ ] Add input sanitization to all forms
- [ ] Test on staging environment

---

## 📚 Documentation

For more details on each feature, refer to:
- Email Service: [`lib/email.ts`](lib/email.ts)
- Validation: [`lib/validation.ts`](lib/validation.ts)
- Notifications: [`lib/notifications.ts`](lib/notifications.ts)
- CSV Export: [`lib/csv-export.ts`](lib/csv-export.ts)
- Time Tracking: [`lib/time-tracking.ts`](lib/time-tracking.ts)
- Recurring Invoices: [`lib/recurring-invoices.ts`](lib/recurring-invoices.ts)
