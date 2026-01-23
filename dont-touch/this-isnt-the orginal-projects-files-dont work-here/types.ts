
export type Status = 'active' | 'completed' | 'on_hold';

export type ProjectCategory = 
  | 'web_design'
  | 'logo_design'
  | 'video_editing'
  | 'graphic_design'
  | 'writing'
  | 'marketing'
  | 'development'
  | 'photography'
  | 'consulting'
  | 'animation';

export type DocType = 'INVOICE';
export type DocStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  countryCode?: string;
  company: string;
  country?: string;
  notes: string;
  createdAt: string;
  socialMedia?: {
    website?: string;
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
}

export interface Project {
  id: string;
  clientId: string;
  title: string;
  description: string;
  status: Status;
  category: ProjectCategory;
  totalBudget: number;
  deadline: string;
  createdAt: string;
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
  shipping: number;
  subtotal: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  dueDate: string;
  notes: string;
  terms: string;
  createdAt: string;
  // New advanced invoice fields
  logo?: string; // Base64 encoded logo
  companyInfo: string; // "Who is this from?"
  billTo: string; // "Who is this to?"
  shipTo?: string; // Optional shipping address
  paymentTerms: string;
  poNumber?: string;
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
    }
  }
}
