
export type Status = 'active' | 'completed' | 'on_hold' | 'in_review';

export type DocType = 'QUOTATION' | 'INVOICE';
export type DocStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'accepted' | 'rejected';

// Notification Types
export type NotificationType = 'invoice_sent' | 'invoice_paid' | 'invoice_overdue' | 'project_deadline' | 'project_completed' | 'client_added' | 'payment_received';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
  metadata?: {
    docId?: string;
    projectId?: string;
    clientId?: string;
    amount?: number;
    [key: string]: any;
  };
}

// Time Tracking Types
export interface TimeEntry {
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

export interface TimeTrackingSummary {
  totalMinutes: number;
  totalHours: number;
  billableMinutes: number;
  billableHours: number;
  totalBillableAmount: number;
}

// Recurring Invoice Types
export type RecurringFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

export interface RecurringInvoice {
  id: string;
  clientId?: string;
  projectId?: string;
  name: string;
  frequency: RecurringFrequency;
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

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  notes: string;
  createdAt: string;
  status?: string;
  countryCode?: string;
  country?: string;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

export interface Project {
  id: string;
  clientId?: string;
  teamId?: string; // New: link to a team
  title?: string;
  description: string;
  status: Status;
  totalBudget: number;
  deadline: string;
  createdAt: string;
  category?: string;
  assignedMembers?: string[]; // User IDs
}

// ─── Team & Collaboration Types ───

export interface TeamMember {
  userId: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  avatarUrl?: string;
  status: 'online' | 'offline' | 'away';
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Message {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  attachments?: Attachment[];
}

export interface Channel {
  id: string;
  teamId: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'project';
  projectId?: string; // If this is a project-specific channel
  msgCount?: number;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedTo: string; // User ID
  dueDate: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  createdAt: string;
  members: TeamMember[];
  channels: Channel[];
}

export interface SalesItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface SalesDocument {
  id: string;
  clientId?: string;
  projectId?: string;
  type: DocType;
  docNumber: string;
  status: DocStatus;
  items: SalesItem[];
  tax: number;
  discount: number;
  shipping: number; // Matched to SalesForm usage
  amountPaid: number;
  balanceDue: number; // Matched to SalesForm usage
  subtotal: number;
  total: number;
  dueDate: string;
  createdAt: string;
  notes: string;
  terms?: string;
  shipTo?: string;
  paymentTerms?: string;
  poNumber?: string;
  // Metadata fields from SalesForm
  logo?: string;
  companyInfo?: string;
  billTo?: string;
  useProTemplate?: boolean;
}

export interface AppState {
  clients: Client[];
  projects: Project[];
  salesDocuments: SalesDocument[];
  notifications: Notification[];
  timeEntries: TimeEntry[];
  recurringInvoices: RecurringInvoice[];
  teams: Team[]; // List of teams user belongs to
  messages: Record<string, Message[]>; // channelId -> Message[]
  tasks: Task[];
  activeTeamId: string | null;
  activeChannelId: string | null;
  activeProjectTabId: string | null; // For within the collaboration workspace
  settings: {
    currency: {
      code: string;
      symbol: string;
      name: string;
    },
    branding: {
      watermarkOpacity: number;
      showWatermark: boolean;
    },
    business: {
      name: string;
      address: string;
      email: string;
      phone: string;
    },
    paymentDetails: {
      bankName: string;
      accountNumber: string;
      routingNumber: string;
      swiftCode: string;
      payPal: string;
    },
    profile: {
      name: string;
      title: string;
      bio: string;
      website: string;
      avatarUrl: string;
    }
  }
}
