
export type Status = 'active' | 'completed' | 'on_hold';

export type DocType = 'QUOTATION' | 'INVOICE';
export type DocStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'accepted' | 'rejected';

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
  clientId: string;
  title: string;
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
  clientId: string;
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
