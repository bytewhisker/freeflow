
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
  title?: string;
  description: string;
  status: Status;
  totalBudget: number;
  deadline: string;
  createdAt: string;
  category?: string;
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
  // Payment method information
  paymentMethod?: PaymentMethod;
  paymentDetails?: any;
}

export type PaymentMethod = 'mobile_wallet' | 'bank';

export type MobileWalletType = 'bkash' | 'nagad';

export type AccountType = 'personal' | 'agent';

export interface MobileWalletPayment {
  type: MobileWalletType;
  number: string;
  accountType: AccountType;
}

export interface BankPayment {
  bankName: string;
  bankBranch: string;
  accountHolderName: string;
  accountNumber: string;
  routingNumber: string;
  swiftCode: string;
}

export interface PaymentDetails {
  method: PaymentMethod;
  mobileWallet?: MobileWalletPayment;
  bank?: BankPayment;
}

export interface AppState {
  clients: Client[];
  projects: Project[];
  salesDocuments: SalesDocument[];
  notifications: Notification[];
  timeEntries: TimeEntry[];
  recurringInvoices: RecurringInvoice[];
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
    paymentDetails: PaymentDetails;
    profile: {
      name: string;
      title: string;
      bio: string;
      website: string;
      avatarUrl: string;
      plan: 'free' | 'pro'; // Add plan type
    };
  }
}
