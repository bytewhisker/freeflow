
import { AppState } from './types';

const STORAGE_KEY = 'freeflow_db_v3';

const INITIAL_STATE: AppState = {
  clients: [
    {
      id: 'client-1',
      name: 'John Smith',
      email: 'john@techcorp.com',
      phone: '+1 (555) 123-4567',
      company: 'TechCorp Inc.',
      country: 'United States',
      notes: 'Premium client',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'client-2',
      name: 'Sarah Johnson',
      email: 'sarah@designstudio.com',
      phone: '+1 (555) 987-6543',
      company: 'Design Studio',
      country: 'United Kingdom',
      notes: 'Long-term partner',
      createdAt: '2024-02-20T14:30:00Z'
    },
    {
      id: 'client-3',
      name: 'Mike Chen',
      email: 'mike@startup.io',
      phone: '+1 (555) 456-7890',
      company: 'StartupIO',
      country: 'Canada',
      notes: 'Fast payment',
      createdAt: '2024-03-10T09:15:00Z'
    }
  ],
  projects: [
    {
      id: 'proj-1',
      clientId: 'client-1',
      title: 'E-commerce Website Redesign',
      description: 'Complete overhaul of the online store',
      status: 'completed',
      category: 'web_design',
      totalBudget: 5000,
      deadline: '2024-06-15',
      createdAt: '2024-03-01T10:00:00Z'
    },
    {
      id: 'proj-2',
      clientId: 'client-2',
      title: 'Brand Identity Package',
      description: 'Logo, colors, and brand guidelines',
      status: 'active',
      category: 'graphic_design',
      totalBudget: 2500,
      deadline: '2024-08-20',
      createdAt: '2024-05-10T14:30:00Z'
    },
    {
      id: 'proj-3',
      clientId: 'client-3',
      title: 'Mobile App Development',
      description: 'iOS and Android app for their platform',
      status: 'active',
      category: 'development',
      totalBudget: 12000,
      deadline: '2024-10-30',
      createdAt: '2024-06-01T09:00:00Z'
    }
  ],
  salesDocuments: [
    {
      id: 'doc-1',
      clientId: 'client-1',
      projectId: 'proj-1',
      type: 'INVOICE',
      docNumber: 'INV-2024-001',
      status: 'paid',
      items: [
        { id: 'item-1', description: 'Website Design', quantity: 1, rate: 2000 },
        { id: 'item-2', description: 'Development', quantity: 1, rate: 3000 }
      ],
      tax: 0,
      discount: 0,
      shipping: 0,
      subtotal: 5000,
      total: 5000,
      amountPaid: 5000,
      balanceDue: 0,
      dueDate: '2024-04-15',
      notes: '',
      terms: 'Net 30',
      createdAt: '2024-03-01T10:00:00Z',
      companyInfo: 'Alex Studio LLC\n123 Freelance Street\nalex@studio.design',
      billTo: 'TechCorp Inc.\nJohn Smith\n456 Business Ave',
      paymentTerms: 'Net 30'
    },
    {
      id: 'doc-2',
      clientId: 'client-2',
      projectId: 'proj-2',
      type: 'INVOICE',
      docNumber: 'INV-2024-002',
      status: 'paid',
      items: [
        { id: 'item-3', description: 'Logo Design', quantity: 1, rate: 1000 },
        { id: 'item-4', description: 'Brand Guidelines', quantity: 1, rate: 1500 }
      ],
      tax: 0,
      discount: 0,
      shipping: 0,
      subtotal: 2500,
      total: 2500,
      amountPaid: 2500,
      balanceDue: 0,
      dueDate: '2024-06-20',
      notes: '',
      terms: 'Net 30',
      createdAt: '2024-05-15T14:30:00Z',
      companyInfo: 'Alex Studio LLC\n123 Freelance Street\nalex@studio.design',
      billTo: 'Design Studio\nSarah Johnson\n789 Creative Blvd',
      paymentTerms: 'Net 30'
    },
    {
      id: 'doc-3',
      clientId: 'client-3',
      projectId: 'proj-3',
      type: 'INVOICE',
      docNumber: 'INV-2024-003',
      status: 'paid',
      items: [
        { id: 'item-5', description: 'App UI Design', quantity: 1, rate: 4000 },
        { id: 'item-6', description: 'iOS Development', quantity: 1, rate: 4000 },
        { id: 'item-7', description: 'Android Development', quantity: 1, rate: 4000 }
      ],
      tax: 0,
      discount: 0,
      shipping: 0,
      subtotal: 12000,
      total: 12000,
      amountPaid: 12000,
      balanceDue: 0,
      dueDate: '2024-08-30',
      notes: '',
      terms: 'Net 45',
      createdAt: '2024-07-01T09:00:00Z',
      companyInfo: 'Alex Studio LLC\n123 Freelance Street\nalex@studio.design',
      billTo: 'StartupIO\nMike Chen\n321 Innovation Way',
      paymentTerms: 'Net 45'
    },
    {
      id: 'doc-4',
      clientId: 'client-1',
      type: 'INVOICE',
      docNumber: 'INV-2024-004',
      status: 'paid',
      items: [
        { id: 'item-8', description: 'SEO Consulting', quantity: 10, rate: 150 }
      ],
      tax: 0,
      discount: 0,
      shipping: 0,
      subtotal: 1500,
      total: 1500,
      amountPaid: 1500,
      balanceDue: 0,
      dueDate: '2024-09-15',
      notes: '',
      terms: 'Net 30',
      createdAt: '2024-08-20T11:00:00Z',
      companyInfo: 'Alex Studio LLC\n123 Freelance Street\nalex@studio.design',
      billTo: 'TechCorp Inc.\nJohn Smith\n456 Business Ave',
      paymentTerms: 'Net 30'
    },
    // 2025 Invoices
    {
      id: 'doc-5',
      clientId: 'client-2',
      projectId: 'proj-2',
      type: 'INVOICE',
      docNumber: 'INV-2025-001',
      status: 'paid',
      items: [
        { id: 'item-9', description: 'Website Maintenance', quantity: 6, rate: 200 }
      ],
      tax: 0,
      discount: 0,
      shipping: 0,
      subtotal: 1200,
      total: 1200,
      amountPaid: 1200,
      balanceDue: 0,
      dueDate: '2025-02-15',
      notes: '',
      terms: 'Net 30',
      createdAt: '2025-01-15T10:00:00Z',
      companyInfo: 'Alex Studio LLC\n123 Freelance Street\nalex@studio.design',
      billTo: 'Design Studio\nSarah Johnson\n789 Creative Blvd',
      paymentTerms: 'Net 30'
    },
    {
      id: 'doc-6',
      clientId: 'client-3',
      type: 'INVOICE',
      docNumber: 'INV-2025-002',
      status: 'paid',
      items: [
        { id: 'item-10', description: 'App Updates', quantity: 1, rate: 2500 }
      ],
      tax: 0,
      discount: 0,
      shipping: 0,
      subtotal: 2500,
      total: 2500,
      amountPaid: 2500,
      balanceDue: 0,
      dueDate: '2025-04-01',
      notes: '',
      terms: 'Net 30',
      createdAt: '2025-03-01T09:00:00Z',
      companyInfo: 'Alex Studio LLC\n123 Freelance Street\nalex@studio.design',
      billTo: 'StartupIO\nMike Chen\n321 Innovation Way',
      paymentTerms: 'Net 30'
    },
    {
      id: 'doc-7',
      clientId: 'client-1',
      type: 'INVOICE',
      docNumber: 'INV-2025-003',
      status: 'paid',
      items: [
        { id: 'item-11', description: 'Marketing Website', quantity: 1, rate: 4500 },
        { id: 'item-12', description: 'Landing Pages', quantity: 3, rate: 500 }
      ],
      tax: 0,
      discount: 0,
      shipping: 0,
      subtotal: 6000,
      total: 6000,
      amountPaid: 6000,
      balanceDue: 0,
      dueDate: '2025-05-20',
      notes: '',
      terms: 'Net 30',
      createdAt: '2025-04-20T14:30:00Z',
      companyInfo: 'Alex Studio LLC\n123 Freelance Street\nalex@studio.design',
      billTo: 'TechCorp Inc.\nJohn Smith\n456 Business Ave',
      paymentTerms: 'Net 30'
    },
    {
      id: 'doc-8',
      clientId: 'client-2',
      type: 'INVOICE',
      docNumber: 'INV-2025-004',
      status: 'paid',
      items: [
        { id: 'item-13', description: 'Social Media Graphics', quantity: 12, rate: 150 }
      ],
      tax: 0,
      discount: 0,
      shipping: 0,
      subtotal: 1800,
      total: 1800,
      amountPaid: 1800,
      balanceDue: 0,
      dueDate: '2025-06-15',
      notes: '',
      terms: 'Net 30',
      createdAt: '2025-05-15T11:00:00Z',
      companyInfo: 'Alex Studio LLC\n123 Freelance Street\nalex@studio.design',
      billTo: 'Design Studio\nSarah Johnson\n789 Creative Blvd',
      paymentTerms: 'Net 30'
    },
    {
      id: 'doc-9',
      clientId: 'client-3',
      type: 'INVOICE',
      docNumber: 'INV-2025-005',
      status: 'paid',
      items: [
        { id: 'item-14', description: 'App Analytics Dashboard', quantity: 1, rate: 3500 }
      ],
      tax: 0,
      discount: 0,
      shipping: 0,
      subtotal: 3500,
      total: 3500,
      amountPaid: 3500,
      balanceDue: 0,
      dueDate: '2025-07-30',
      notes: '',
      terms: 'Net 30',
      createdAt: '2025-06-30T09:00:00Z',
      companyInfo: 'Alex Studio LLC\n123 Freelance Street\nalex@studio.design',
      billTo: 'StartupIO\nMike Chen\n321 Innovation Way',
      paymentTerms: 'Net 30'
    },
    {
      id: 'doc-10',
      clientId: 'client-1',
      type: 'INVOICE',
      docNumber: 'INV-2025-006',
      status: 'paid',
      items: [
        { id: 'item-15', description: 'E-commerce Integration', quantity: 1, rate: 2800 }
      ],
      tax: 0,
      discount: 0,
      shipping: 0,
      subtotal: 2800,
      total: 2800,
      amountPaid: 2800,
      balanceDue: 0,
      dueDate: '2025-08-25',
      notes: '',
      terms: 'Net 30',
      createdAt: '2025-07-25T10:00:00Z',
      companyInfo: 'Alex Studio LLC\n123 Freelance Street\nalex@studio.design',
      billTo: 'TechCorp Inc.\nJohn Smith\n456 Business Ave',
      paymentTerms: 'Net 30'
    }
  ],
  settings: {
    currency: {
      code: 'USD',
      symbol: '$',
      name: 'US Dollar'
    },
    branding: {
      watermarkOpacity: 0.25,
      showWatermark: true
    },
    business: {
      name: 'Alex Studio LLC',
      address: '123 Freelance Street, Digital City',
      email: 'alex@studio.design',
      phone: '+1 (555) 000-1234'
    }
  }
};

export const db = {
  getState: (): AppState => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : INITIAL_STATE;
  },

  setState: (state: AppState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },

  reset: () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }
};
